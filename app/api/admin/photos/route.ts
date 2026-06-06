import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { missingEnvResponse, mongoEnvKeys } from "@/lib/env";
import { connectToDatabase } from "@/lib/mongodb";
import { serializePhoto } from "@/lib/serializers";
import { isValidObjectId } from "@/lib/utils";
import Photo from "@/models/Photo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
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

    const page = Math.max(
      1,
      Number.parseInt(request.nextUrl.searchParams.get("page") ?? "1", 10),
    );
    const limit = Math.min(
      Math.max(
        Number.parseInt(request.nextUrl.searchParams.get("limit") ?? "50", 10),
        1,
      ),
      100,
    );
    const albumId = request.nextUrl.searchParams.get("albumId");
    const query = albumId && isValidObjectId(albumId) ? { albumId } : {};

    const [photos, totalPhotos] = await Promise.all([
      Photo.find(query)
        .sort({ uploadedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Photo.countDocuments(query),
    ]);

    return NextResponse.json({
      photos: photos.map(serializePhoto),
      pagination: {
        page,
        limit,
        totalPhotos,
        totalPages: Math.max(1, Math.ceil(totalPhotos / limit)),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to load preview photos" },
      { status: 500 },
    );
  }
}
