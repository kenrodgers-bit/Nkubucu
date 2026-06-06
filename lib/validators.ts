import { z } from "zod";

export const albumSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(120),
  term: z.enum(["1", "2", "3"]),
  year: z.coerce.number().int().min(2000).max(2100),
  eventName: z.string().trim().min(1, "Event name is required").max(120),
  description: z.string().trim().max(1200).optional().default(""),
  externalAlbumUrl: z
    .string()
    .trim()
    .url("Enter the full external album link"),
  storageProvider: z
    .string()
    .trim()
    .min(2, "Storage provider is required")
    .max(60),
  coverImageUrl: z.string().trim().url().optional().or(z.literal("")),
  coverCloudinaryId: z.string().trim().optional().or(z.literal("")),
  isPublic: z.coerce.boolean().optional().default(true),
});

export const albumPatchSchema = albumSchema.partial();

export const credentialsSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const signUploadSchema = z.object({
  albumSlug: z.string().trim().min(1),
});

export const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

export function validateImageFile(file: File) {
  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

  if (!allowedMimeTypes.includes(file.type as (typeof allowedMimeTypes)[number])) {
    return "Unsupported image type";
  }

  if (!allowedExtensions.includes(extension)) {
    return "Unsupported image extension";
  }

  if (file.size > 15 * 1024 * 1024) {
    return "Image exceeds 15 MB";
  }

  return null;
}
