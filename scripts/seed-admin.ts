import "dotenv/config";
import { config } from "dotenv";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "../lib/mongodb";
import User from "../models/User";

config({ path: ".env.local" });

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required");
  }

  await connectToDatabase();

  const existing = await User.findOne({ email });

  if (existing) {
    console.log(`Admin already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await User.create({
    name: "School Photo Hub Admin",
    email,
    passwordHash,
    role: "admin",
  });

  console.log(`Admin created: ${email}`);
}

seedAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
