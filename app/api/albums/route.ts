import { NextResponse } from "next/server";
import { missingEnvResponse, mongoEnvKeys } from "@/lib/env";
import { connectToDatabase } from "@/lib/mongodb";
import { serializeAlbum } from "@/lib/serializers";
import Album from "@/models/Album";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const missingEnv = missingEnvResponse(mongoEnvKeys);

    if (missingEnv) {
      return NextResponse.json(missingEnv, { status: 503 });
    }

    await connectToDatabase();

    const albums = await Album.find({ isPublic: true })
      .select(
        "title slug coverImageUrl photoCount term year eventName externalAlbumUrl storageProvider previewImageUrls createdAt",
      )
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      albums: albums.map(serializeAlbum),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to load albums" }, { status: 500 });
  }
}
