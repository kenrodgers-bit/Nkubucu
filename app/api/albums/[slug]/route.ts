import { NextRequest, NextResponse } from "next/server";
import { missingEnvResponse, mongoEnvKeys } from "@/lib/env";
import { connectToDatabase } from "@/lib/mongodb";
import { serializeAlbum, serializePhoto } from "@/lib/serializers";
import Album from "@/models/Album";
import Photo from "@/models/Photo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    const missingEnv = missingEnvResponse(mongoEnvKeys);

    if (missingEnv) {
      return NextResponse.json(missingEnv, { status: 503 });
    }

    await connectToDatabase();

    const album = await Album.findOne({
      slug: params.slug,
      isPublic: true,
    }).lean();

    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    const [photos, totalPhotos] = await Promise.all([
      Photo.find({ albumId: album._id })
        .sort({ uploadedAt: -1 })
        .limit(5)
        .lean(),
      Photo.countDocuments({ albumId: album._id }),
    ]);

    return NextResponse.json({
      album: serializeAlbum(album),
      photos: photos.map(serializePhoto),
      pagination: {
        page: 1,
        limit: 5,
        totalPhotos,
        totalPages: 1,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to load album" },
      { status: 500 },
    );
  }
}
