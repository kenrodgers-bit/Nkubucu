import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { missingEnvResponse, mongoEnvKeys } from "@/lib/env";
import { connectToDatabase } from "@/lib/mongodb";
import { adminUserSchema } from "@/lib/validators";
import User from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function serializeAdmin(user: {
  _id: unknown;
  name: string;
  email: string;
  role: string;
  createdAt?: Date;
}) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

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
    const users = await User.find({ role: "admin" })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({ users: users.map(serializeAdmin) });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to load admin users" },
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

    const parsed = adminUserSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid admin user data", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const email = parsed.data.email.toLowerCase();
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { error: "An admin with this email already exists" },
        { status: 409 },
      );
    }

    const user = await User.create({
      name: parsed.data.name,
      email,
      role: "admin",
      passwordHash: await bcrypt.hash(parsed.data.password, 12),
    });

    return NextResponse.json({ user: serializeAdmin(user) }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to create admin user" },
      { status: 500 },
    );
  }
}
