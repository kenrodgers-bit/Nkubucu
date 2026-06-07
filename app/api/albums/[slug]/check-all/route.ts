import { NextRequest, NextResponse } from "next/server";
import { missingEnvResponse, mongoEnvKeys } from "@/lib/env";
import { connectToDatabase } from "@/lib/mongodb";
import Album from "@/models/Album";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  _request: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    const missingEnv = missingEnvResponse(mongoEnvKeys);

    if (missingEnv) {
      return NextResponse.json(missingEnv, { status: 503 });
    }

    await connectToDatabase();

    const album = await Album.findOneAndUpdate(
      {
        slug: params.slug,
        $or: [
          { status: "published", isPublic: true },
          { status: { $exists: false }, isPublic: true },
        ],
      },
      {
        $inc: { checkAllClicks: 1 },
        $set: { lastCheckAllAt: new Date() },
      },
      { new: true },
    ).lean();

    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      externalAlbumUrl: album.externalAlbumUrl,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to record album click" },
      { status: 500 },
    );
  }
}
