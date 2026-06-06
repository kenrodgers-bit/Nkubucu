import type { HydratedDocument } from "mongoose";
import type { AlbumDocument } from "@/models/Album";
import type { PhotoDocument } from "@/models/Photo";

type AnyDocument<T> = HydratedDocument<T> | (T & { _id: unknown });

export function serializeAlbum(album: AnyDocument<AlbumDocument>) {
  return {
    id: String(album._id),
    title: album.title,
    slug: album.slug,
    term: album.term,
    year: album.year,
    eventName: album.eventName,
    description: album.description ?? "",
    externalAlbumUrl: album.externalAlbumUrl ?? "",
    storageProvider: album.storageProvider ?? "",
    previewImageUrls: album.previewImageUrls ?? [],
    coverImageUrl: album.coverImageUrl ?? "",
    coverCloudinaryId: album.coverCloudinaryId ?? "",
    isPublic: album.isPublic,
    photoCount: album.photoCount ?? 0,
    createdAt: "createdAt" in album ? album.createdAt : undefined,
    updatedAt: "updatedAt" in album ? album.updatedAt : undefined,
  };
}

export function serializePhoto(photo: AnyDocument<PhotoDocument>) {
  return {
    id: String(photo._id),
    albumId: photo.albumId.toString(),
    fileName: photo.fileName,
    originalUrl: photo.originalUrl,
    thumbnailUrl: photo.thumbnailUrl,
    cloudinaryPublicId: photo.cloudinaryPublicId,
    tags: photo.tags ?? [],
    classTag: photo.classTag ?? "",
    eventTag: photo.eventTag ?? "",
    term: photo.term,
    year: photo.year,
    uploadedAt: photo.uploadedAt,
  };
}
