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

    await Album.updateOne(
      {
        slug: params.slug,
        $or: [
          { status: "published", isPublic: true },
          { status: { $exists: false }, isPublic: true },
        ],
      },
      {
        $inc: { viewCount: 1 },
        $set: { lastViewedAt: new Date() },
      },
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to record album view" },
      { status: 500 },
    );
  }
}
