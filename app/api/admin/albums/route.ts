import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { missingEnvResponse, mongoEnvKeys } from "@/lib/env";
import { connectToDatabase } from "@/lib/mongodb";
import { serializeAlbum } from "@/lib/serializers";
import { createAlbumSlug } from "@/lib/utils";
import { albumSchema } from "@/lib/validators";
import Album from "@/models/Album";

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
    const albums = await Album.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ albums: albums.map(serializeAlbum) });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to load admin albums" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const missingEnv = missingEnvResponse(mongoEnvKeys);

    if (missingEnv) {
      return NextResponse.json(missingEnv, { status: 503 });
    }

    const body = await request.json();
    const parsed = albumSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid album data", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const album = await Album.create({
      ...parsed.data,
      slug: createAlbumSlug(parsed.data.title),
      previewImageUrls: [],
      coverImageUrl: parsed.data.coverImageUrl || "",
      coverCloudinaryId: parsed.data.coverCloudinaryId || "",
    });

    return NextResponse.json({ album: serializeAlbum(album) }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to create album" },
      { status: 500 },
    );
  }
}
