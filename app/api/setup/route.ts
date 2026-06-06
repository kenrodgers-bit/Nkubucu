import { NextResponse } from "next/server";
import { cloudinaryEnvKeys, getMissingEnv, mongoEnvKeys } from "@/lib/env";

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
