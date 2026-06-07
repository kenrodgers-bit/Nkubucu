import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cloudinaryEnvKeys, getMissingEnv, mongoEnvKeys } from "@/lib/env";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const missing = getMissingEnv([
    ...mongoEnvKeys,
    ...cloudinaryEnvKeys,
    "NEXTAUTH_SECRET",
    "NEXTAUTH_URL",
    "ADMIN_EMAIL",
    "ADMIN_PASSWORD",
  ]);

  return NextResponse.json({
    configured: missing.length === 0,
    missing,
  });
}

export async function POST() {
  try {
    const missing = getMissingEnv([
      ...mongoEnvKeys,
      ...cloudinaryEnvKeys,
      "NEXTAUTH_SECRET",
      "NEXTAUTH_URL",
      "ADMIN_EMAIL",
      "ADMIN_PASSWORD",
    ]);

    if (missing.length) {
      return NextResponse.json(
        {
          error: `Missing environment variables: ${missing.join(", ")}`,
          configured: false,
          missing,
        },
        { status: 503 },
      );
    }

    await connectToDatabase();

    const existingAdmin = await User.findOne({ role: "admin" }).lean();

    if (existingAdmin) {
      return NextResponse.json({
        ok: true,
        created: false,
        message: "Admin already exists",
      });
    }

    const email = process.env.ADMIN_EMAIL?.toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Admin credentials are not configured" },
        { status: 503 },
      );
    }

    await User.create({
      name: "School Photo Hub Admin",
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role: "admin",
    });

    return NextResponse.json({
      ok: true,
      created: true,
      message: "Admin created",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to complete setup" },
      { status: 500 },
    );
  }
}
