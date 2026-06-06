export function getMissingEnv(keys: string[]) {
  return keys.filter((key) => !process.env[key]);
}

export function missingEnvResponse(keys: string[]) {
  const missing = getMissingEnv(keys);

  if (!missing.length) {
    return null;
  }

  return {
    error: `Missing environment variables: ${missing.join(", ")}. Create .env.local before using this feature.`,
    setupRequired: true,
    missing,
  };
}

export const mongoEnvKeys = ["MONGODB_URI"];

export const cloudinaryEnvKeys = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];
