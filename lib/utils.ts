import { customAlphabet } from "nanoid";
import slugify from "slugify";

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 8);

export function createAlbumSlug(title: string) {
  const safeTitle = slugify(title, {
    lower: true,
    strict: true,
    trim: true,
  });

  return `${nanoid()}-${safeTitle || "album"}`;
}

export function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function cloudinaryThumbnailUrl(publicId: string) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

  if (!cloudName) {
    throw new Error("CLOUDINARY_CLOUD_NAME is not configured");
  }

  return `https://res.cloudinary.com/${cloudName}/image/upload/w_400,c_fill,q_auto,f_auto/${publicId}`;
}

export function isValidObjectId(id: string) {
  return /^[a-f\d]{24}$/i.test(id);
}

export function splitTags(value: string | null | undefined) {
  if (!value) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  );
}
