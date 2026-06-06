import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { deleteCloudinaryAsset } from "@/lib/cloudinary";
import { cloudinaryEnvKeys, missingEnvResponse, mongoEnvKeys } from "@/lib/env";
import { connectToDatabase } from "@/lib/mongodb";
import { isValidObjectId } from "@/lib/utils";
import Album from "@/models/Album";
import Photo from "@/models/Photo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await requireAdminSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const missingEnv = missingEnvResponse([...mongoEnvKeys, ...cloudinaryEnvKeys]);

    if (missingEnv) {
      return NextResponse.json(missingEnv, { status: 503 });
    }

    if (!isValidObjectId(params.id)) {
      return NextResponse.json({ error: "Invalid photo id" }, { status: 400 });
    }

    await connectToDatabase();

    const photo = await Photo.findById(params.id);

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    await deleteCloudinaryAsset(photo.cloudinaryPublicId);
    await Photo.deleteOne({ _id: photo._id });

    const nextCover = await Photo.findOne({ albumId: photo.albumId })
      .sort({ uploadedAt: -1 })
      .lean();
    const coverUpdate =
      nextCover && photo.thumbnailUrl
        ? {
            coverImageUrl: nextCover.thumbnailUrl,
            coverCloudinaryId: nextCover.cloudinaryPublicId,
          }
        : {
            coverImageUrl: "",
            coverCloudinaryId: "",
          };

    await Album.updateOne(
      { _id: photo.albumId },
      {
        $inc: { photoCount: -1 },
        $pull: { previewImageUrls: photo.thumbnailUrl },
        $set: coverUpdate,
      },
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to delete photo" },
      { status: 500 },
    );
  }
}
