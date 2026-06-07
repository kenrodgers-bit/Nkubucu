import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { deleteCloudinaryAsset } from "@/lib/cloudinary";
import { cloudinaryEnvKeys, missingEnvResponse, mongoEnvKeys } from "@/lib/env";
import { connectToDatabase } from "@/lib/mongodb";
import { serializeAlbum } from "@/lib/serializers";
import { isValidObjectId } from "@/lib/utils";
import { albumPatchSchema } from "@/lib/validators";
import Album from "@/models/Album";
import Photo from "@/models/Photo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await requireAdminSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const missingEnv = missingEnvResponse(mongoEnvKeys);

    if (missingEnv) {
      return NextResponse.json(missingEnv, { status: 503 });
    }

    if (!isValidObjectId(params.id)) {
      return NextResponse.json({ error: "Invalid album id" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = albumPatchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid album data", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const updateData: Record<string, unknown> = { ...parsed.data };

    if (parsed.data.status) {
      updateData.isPublic = parsed.data.status === "published";
    } else if (parsed.data.isPublic !== undefined) {
      updateData.status = parsed.data.isPublic ? "published" : "hidden";
    }

    if (parsed.data.externalLinkStatus && parsed.data.externalLinkStatus !== "unchecked") {
      updateData.externalLinkCheckedAt = new Date();
    }

    const album = await Album.findByIdAndUpdate(
      params.id,
      {
        ...updateData,
        coverImageUrl: parsed.data.coverImageUrl ?? undefined,
        coverCloudinaryId: parsed.data.coverCloudinaryId ?? undefined,
      },
      { new: true },
    );

    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    return NextResponse.json({ album: serializeAlbum(album) });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to update album" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
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
      return NextResponse.json({ error: "Invalid album id" }, { status: 400 });
    }

    await connectToDatabase();

    const album = await Album.findById(params.id);

    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    const photos = await Photo.find({ albumId: album._id }).lean();
    await Promise.all(
      photos.map((photo) => deleteCloudinaryAsset(photo.cloudinaryPublicId)),
    );

    if (
      album.coverCloudinaryId &&
      !photos.some(
        (photo) => photo.cloudinaryPublicId === album.coverCloudinaryId,
      )
    ) {
      await deleteCloudinaryAsset(album.coverCloudinaryId);
    }

    await Promise.all([
      Photo.deleteMany({ albumId: album._id }),
      Album.deleteOne({ _id: album._id }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to delete album" },
      { status: 500 },
    );
  }
}
