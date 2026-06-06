import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export function cloudinaryFolder(albumSlug: string) {
  return `school-photo-hub/${albumSlug}`;
}

export function createUploadSignature(albumSlug: string) {
  const timestamp = Math.round(Date.now() / 1000);
  const folder = cloudinaryFolder(albumSlug);
  const signature = cloudinary.utils.api_sign_request(
    {
      folder,
      timestamp,
    },
    process.env.CLOUDINARY_API_SECRET ?? "",
  );

  return {
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    folder,
    signature,
    timestamp,
  };
}

export function uploadImageBuffer(
  buffer: Buffer,
  albumSlug: string,
  fileName: string,
) {
  return new Promise<{
    secure_url: string;
    public_id: string;
    original_filename: string;
  }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: cloudinaryFolder(albumSlug),
        resource_type: "image",
        filename_override: fileName,
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          original_filename: result.original_filename,
        });
      },
    );

    uploadStream.end(buffer);
  });
}

export async function deleteCloudinaryAsset(publicId?: string | null) {
  if (!publicId) {
    return;
  }

  await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  });
}
