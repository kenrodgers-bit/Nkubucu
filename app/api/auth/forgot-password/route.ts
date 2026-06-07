import { NextRequest, NextResponse } from "next/server";
import { missingEnvResponse, mongoEnvKeys } from "@/lib/env";
import { connectToDatabase } from "@/lib/mongodb";
import { forgotPasswordSchema } from "@/lib/validators";
import User from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const missingEnv = missingEnvResponse(mongoEnvKeys);

    if (missingEnv) {
      return NextResponse.json(missingEnv, { status: 503 });
    }

    const parsed = forgotPasswordSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    await connectToDatabase();
    const admin = await User.findOne({
      email: parsed.data.email.toLowerCase(),
      role: "admin",
    }).lean();

    if (admin) {
      console.info(`Password reset requested for ${admin.email}`);
    }

    return NextResponse.json({
      ok: true,
      message:
        "If this email belongs to an admin, ask another admin to create a temporary admin account or change the password from Admin Settings.",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to process password reset request" },
      { status: 500 },
    );
  }
}
