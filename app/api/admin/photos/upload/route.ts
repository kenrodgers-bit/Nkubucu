import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { deleteCloudinaryAsset, uploadImageBuffer } from "@/lib/cloudinary";
import { cloudinaryEnvKeys, missingEnvResponse, mongoEnvKeys } from "@/lib/env";
import { connectToDatabase } from "@/lib/mongodb";
import { serializePhoto } from "@/lib/serializers";
import { cloudinaryThumbnailUrl, isValidObjectId, splitTags } from "@/lib/utils";
import { validateImageFile } from "@/lib/validators";
import Album from "@/models/Album";
import Photo from "@/models/Photo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const minimumPreviewPhotos = 3;
const maximumPreviewPhotos = 5;

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const missingEnv = missingEnvResponse([...mongoEnvKeys, ...cloudinaryEnvKeys]);

    if (missingEnv) {
      return NextResponse.json(missingEnv, { status: 503 });
    }

    const formData = await request.formData();
    const albumId = String(formData.get("albumId") ?? "");

    if (!isValidObjectId(albumId)) {
      return NextResponse.json({ error: "Invalid album id" }, { status: 400 });
    }

    const files = formData
      .getAll("files")
      .filter((value): value is File => value instanceof File);

    if (!files.length) {
      return NextResponse.json(
        { error: "No preview files uploaded" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const album = await Album.findById(albumId);

    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    const existingPreviewCount = await Photo.countDocuments({
      albumId: album._id,
    });
    const nextPreviewCount = existingPreviewCount + files.length;

    if (
      nextPreviewCount < minimumPreviewPhotos ||
      nextPreviewCount > maximumPreviewPhotos
    ) {
      return NextResponse.json(
        {
          error: `Each album must have ${minimumPreviewPhotos} to ${maximumPreviewPhotos} preview photos.`,
        },
        { status: 400 },
      );
    }

    const validationErrors = files
      .map((file) => {
        const error = validateImageFile(file);
        return error ? { fileName: file.name, error } : null;
      })
      .filter((error): error is { fileName: string; error: string } =>
        Boolean(error),
      );

    if (validationErrors.length) {
      return NextResponse.json(
        {
          error: "One or more preview photos are invalid",
          errors: validationErrors,
        },
        { status: 400 },
      );
    }

    const classTag = String(formData.get("classTag") ?? "").trim();
    const eventTag =
      String(formData.get("eventTag") ?? "").trim() || album.eventName;
    const customTags = splitTags(String(formData.get("tags") ?? ""));
    const createdPhotos = [];
    const errors: { fileName: string; error: string }[] = [];

    for (const file of files) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const upload = await uploadImageBuffer(
          Buffer.from(arrayBuffer),
          album.slug,
          file.name,
        );

        const photo = await Photo.create({
          albumId: album._id,
          fileName: file.name,
          originalUrl: upload.secure_url,
          thumbnailUrl: cloudinaryThumbnailUrl(upload.public_id),
          cloudinaryPublicId: upload.public_id,
          tags: customTags,
          classTag,
          eventTag,
          term: album.term,
          year: album.year,
        });

        createdPhotos.push(photo);
      } catch (error) {
        console.error(error);
        errors.push({ fileName: file.name, error: "Upload failed" });
      }
    }

    if (errors.length) {
      await Promise.all(
        createdPhotos.map((photo) =>
          deleteCloudinaryAsset(photo.cloudinaryPublicId),
        ),
      );
      await Photo.deleteMany({
        _id: { $in: createdPhotos.map((photo) => photo._id) },
      });

      return NextResponse.json(
        {
          error: "Preview upload failed",
          errors,
        },
        { status: 400 },
      );
    }

    if (createdPhotos.length) {
      const increment = createdPhotos.length;
      const firstPhoto = createdPhotos[0];
      const previewImageUrls = createdPhotos.map((photo) => photo.thumbnailUrl);
      const coverUpdate =
        album.coverImageUrl || !firstPhoto
          ? {}
          : {
              coverImageUrl: firstPhoto.thumbnailUrl,
              coverCloudinaryId: firstPhoto.cloudinaryPublicId,
            };

      await Album.updateOne(
        { _id: album._id },
        {
          $inc: { photoCount: increment },
          $push: { previewImageUrls: { $each: previewImageUrls } },
          $set: coverUpdate,
        },
      );
    }

    return NextResponse.json(
      {
        photos: createdPhotos.map(serializePhoto),
        errors,
      },
      { status: createdPhotos.length ? 201 : 400 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to upload preview photos" },
      { status: 500 },
    );
  }
}
