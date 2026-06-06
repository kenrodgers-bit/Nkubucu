import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { missingEnvResponse, mongoEnvKeys } from "@/lib/env";
import { connectToDatabase } from "@/lib/mongodb";
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

    const [totalAlbums, totalPreviewPhotos] = await Promise.all([
      Album.countDocuments({}),
      Photo.countDocuments({}),
    ]);

    return NextResponse.json({ totalAlbums, totalPreviewPhotos });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to load stats" },
      { status: 500 },
    );
  }
}
