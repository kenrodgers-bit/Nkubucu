import { NextResponse } from "next/server";
import { missingEnvResponse, mongoEnvKeys } from "@/lib/env";
import { connectToDatabase } from "@/lib/mongodb";
import { isValidObjectId } from "@/lib/utils";
import Photo from "@/models/Photo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const missingEnv = missingEnvResponse(mongoEnvKeys);

    if (missingEnv) {
      return NextResponse.json(missingEnv, { status: 503 });
    }

    if (!isValidObjectId(params.id)) {
      return NextResponse.json({ error: "Invalid photo id" }, { status: 400 });
    }

    await connectToDatabase();

    const photo = await Photo.findById(params.id).lean();

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    const response = await fetch(photo.originalUrl);

    if (!response.ok) {
      return NextResponse.json(
        { error: "Unable to fetch image" },
        { status: 502 },
      );
    }

    const bytes = await response.arrayBuffer();
    const fileName = photo.fileName.replace(/"/g, "");

    return new Response(bytes, {
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "image/jpeg",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to download photo" },
      { status: 500 },
    );
  }
}
