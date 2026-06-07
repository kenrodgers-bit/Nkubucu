import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { missingEnvResponse, mongoEnvKeys } from "@/lib/env";
import { connectToDatabase } from "@/lib/mongodb";
import { passwordChangeSchema } from "@/lib/validators";
import User from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAdminSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const missingEnv = missingEnvResponse(mongoEnvKeys);

    if (missingEnv) {
      return NextResponse.json(missingEnv, { status: 503 });
    }

    const parsed = passwordChangeSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid password data", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const user = await User.findOne({
      email: session.user.email.toLowerCase(),
      role: "admin",
    });

    if (!user) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      parsed.data.currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 },
      );
    }

    user.passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
    await user.save();

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to update password" },
      { status: 500 },
    );
  }
}
