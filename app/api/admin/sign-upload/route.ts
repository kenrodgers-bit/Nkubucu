import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { createUploadSignature } from "@/lib/cloudinary";
import { cloudinaryEnvKeys, missingEnvResponse } from "@/lib/env";
import { signUploadSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const missingEnv = missingEnvResponse(cloudinaryEnvKeys);

    if (missingEnv) {
      return NextResponse.json(missingEnv, { status: 503 });
    }

    const body = await request.json();
    const parsed = signUploadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid signing request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    return NextResponse.json(createUploadSignature(parsed.data.albumSlug));
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to sign upload" },
      { status: 500 },
    );
  }
}
