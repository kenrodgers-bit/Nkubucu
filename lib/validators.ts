import { z } from "zod";

export const albumStatuses = ["draft", "published", "hidden"] as const;

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
  status: z.enum(albumStatuses).optional().default("draft"),
  externalLinkStatus: z
    .enum(["unchecked", "ok", "warning", "error"])
    .optional()
    .default("unchecked"),
  coverImageUrl: z.string().trim().url().optional().or(z.literal("")),
  coverCloudinaryId: z.string().trim().optional().or(z.literal("")),
  isPublic: z.coerce.boolean().optional(),
});

export const albumPatchSchema = albumSchema.partial();

export const credentialsSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const signUploadSchema = z.object({
  albumSlug: z.string().trim().min(1),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Use at least 8 characters").max(128),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const adminUserSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(80),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "Use at least 8 characters").max(128),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter the admin email"),
});

export const linkCheckSchema = z.object({
  url: z.string().trim().url("Enter a full cloud folder link"),
});

export const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
  "image/avif",
  "image/bmp",
  "image/tiff",
  "image/x-ms-bmp",
] as const;

const allowedExtensions = [
  ".jpg",
  ".jpeg",
  ".jpe",
  ".jfif",
  ".png",
  ".webp",
  ".gif",
  ".heic",
  ".heif",
  ".avif",
  ".bmp",
  ".tif",
  ".tiff",
];

export function detectStorageProvider(url: string) {
  try {
    const hostname = new URL(url).hostname.toLowerCase();

    if (hostname.includes("photos.google")) {
      return "Google Photos";
    }

    if (hostname.includes("drive.google")) {
      return "Google Drive";
    }

    if (hostname.includes("terabox") || hostname.includes("1024tera")) {
      return "TeraBox";
    }

    if (hostname.includes("onedrive") || hostname.includes("1drv.ms")) {
      return "OneDrive";
    }

    if (hostname.includes("dropbox")) {
      return "Dropbox";
    }

    return "Other Cloud Storage";
  } catch {
    return "";
  }
}

export function validateImageFile(file: File) {
  const dotIndex = file.name.lastIndexOf(".");
  const extension = dotIndex >= 0 ? file.name.slice(dotIndex).toLowerCase() : "";
  const hasAllowedMimeType =
    file.type.startsWith("image/") ||
    allowedMimeTypes.includes(file.type as (typeof allowedMimeTypes)[number]);
  const hasAllowedExtension = allowedExtensions.includes(extension);

  if (file.type === "image/svg+xml" || extension === ".svg") {
    return "SVG files are not supported as preview photos";
  }

  if (!hasAllowedMimeType && !hasAllowedExtension) {
    return "Unsupported image type";
  }

  if (extension && !hasAllowedExtension) {
    return "Unsupported image extension";
  }

  if (file.size > 25 * 1024 * 1024) {
    return "Image exceeds 25 MB";
  }

  return null;
}
