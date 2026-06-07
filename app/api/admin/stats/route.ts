import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { cloudinary } from "@/lib/cloudinary";
import {
  cloudinaryEnvKeys,
  getMissingEnv,
  missingEnvResponse,
  mongoEnvKeys,
} from "@/lib/env";
import { connectToDatabase } from "@/lib/mongodb";
import { serializeAlbum } from "@/lib/serializers";
import Album from "@/models/Album";
import Photo from "@/models/Photo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireAdminSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const missingEnv = missingEnvResponse(mongoEnvKeys);

    if (missingEnv) {
      return NextResponse.json(missingEnv, { status: 503 });
    }

    await connectToDatabase();

    const [
      totalAlbums,
      totalPreviewPhotos,
      statusCounts,
      providerCounts,
      analyticsTotals,
      mostViewedAlbums,
      missingPreviewAlbums,
      albumsWithoutLinks,
    ] = await Promise.all([
      Album.countDocuments({}),
      Photo.countDocuments({}),
      Album.aggregate([
        {
          $group: {
            _id: { $ifNull: ["$status", { $cond: ["$isPublic", "published", "hidden"] }] },
            count: { $sum: 1 },
          },
        },
      ]),
      Album.aggregate([
        {
          $group: {
            _id: { $ifNull: ["$storageProvider", "Unknown"] },
            count: { $sum: 1 },
            checkAllClicks: { $sum: { $ifNull: ["$checkAllClicks", 0] } },
          },
        },
        { $sort: { count: -1 } },
      ]),
      Album.aggregate([
        {
          $group: {
            _id: null,
            totalViews: { $sum: { $ifNull: ["$viewCount", 0] } },
            totalCheckAllClicks: {
              $sum: { $ifNull: ["$checkAllClicks", 0] },
            },
          },
        },
      ]),
      Album.find({})
        .sort({ viewCount: -1, checkAllClicks: -1, createdAt: -1 })
        .limit(5)
        .lean(),
      Album.countDocuments({
        $or: [{ photoCount: { $lt: 3 } }, { photoCount: { $gt: 5 } }],
      }),
      Album.countDocuments({
        $or: [
          { externalAlbumUrl: { $exists: false } },
          { externalAlbumUrl: "" },
        ],
      }),
    ]);

    const missingCloudinary = getMissingEnv(cloudinaryEnvKeys);
    let cloudinaryHealthWarning = "";

    if (!missingCloudinary.length) {
      try {
        await Promise.race([
          cloudinary.api.ping(),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Cloudinary health check timed out")),
              5000,
            ),
          ),
        ]);
      } catch {
        cloudinaryHealthWarning =
          "Cloudinary health check failed. Preview photo uploads may fail until the API credentials are fixed.";
      }
    }

    const warnings = [
      ...missingCloudinary.map((key) => `${key} is missing. Preview photo uploads will fail.`),
      ...(cloudinaryHealthWarning ? [cloudinaryHealthWarning] : []),
      ...(missingPreviewAlbums
        ? [
            `${missingPreviewAlbums} album${
              missingPreviewAlbums === 1 ? " has" : "s have"
            } outside the required 3-5 preview photo range.`,
          ]
        : []),
      ...(albumsWithoutLinks
        ? [
            `${albumsWithoutLinks} album${
              albumsWithoutLinks === 1 ? " is" : "s are"
            } missing an external full-album link.`,
          ]
        : []),
      "Keep MongoDB Atlas backups enabled and review Vercel logs after each production deploy.",
    ];

    return NextResponse.json({
      totalAlbums,
      totalPreviewPhotos,
      totalViews: analyticsTotals[0]?.totalViews ?? 0,
      totalCheckAllClicks: analyticsTotals[0]?.totalCheckAllClicks ?? 0,
      statusCounts,
      providerCounts,
      mostViewedAlbums: mostViewedAlbums.map(serializeAlbum),
      warnings,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to load stats" },
      { status: 500 },
    );
  }
}
