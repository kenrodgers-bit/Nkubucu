"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { Spinner } from "@/components/ui/Spinner";
import type { Album, PaginationState, Photo } from "@/lib/client-types";

export function PhotoManager() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albumId, setAlbumId] = useState("");
  const [query, setQuery] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 50,
    totalPhotos: 0,
    totalPages: 1,
  });
  const [photoToDelete, setPhotoToDelete] = useState<Photo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadAlbums() {
      try {
        const response = await fetch("/api/admin/albums");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Unable to load albums");
        }

        if (isMounted) {
          setAlbums(data.albums);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load albums",
          );
        }
      }
    }

    loadAlbums();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadPhotos() {
      setIsLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
        });

        if (albumId) {
          params.set("albumId", albumId);
        }

        const response = await fetch(`/api/admin/photos?${params.toString()}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Unable to load preview photos");
        }

        if (isMounted) {
          setPhotos(data.photos);
          setPagination(data.pagination);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load preview photos",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadPhotos();

    return () => {
      isMounted = false;
    };
  }, [albumId, pagination.page, pagination.limit]);

  const filteredPhotos = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return photos;
    }

    return photos.filter((photo) =>
      [photo.fileName, photo.classTag, photo.eventTag, ...photo.tags]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [photos, query]);

  async function deletePhoto() {
    if (!photoToDelete) {
      return;
    }

    const previousPhotos = photos;
    setIsDeleting(true);
    setPhotos((current) =>
      current.filter((photo) => photo.id !== photoToDelete.id),
    );

    try {
      const response = await fetch(`/api/admin/photos/${photoToDelete.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to delete preview photo");
      }

      setPhotoToDelete(null);
    } catch (deleteError) {
      setPhotos(previousPhotos);
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete preview photo",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold text-ink">Preview Photos</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review and delete preview records and Cloudinary preview assets.
        </p>
      </div>

      <div className="mt-6 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[minmax(240px,1fr)_240px]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search filename, class, event, or tag"
          className="focus-ring h-11 rounded-md border border-slate-200 px-3 text-sm"
        />
        <select
          value={albumId}
          onChange={(event) => {
            setAlbumId(event.target.value);
            setPagination((current) => ({ ...current, page: 1 }));
          }}
          className="focus-ring h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700"
        >
          <option value="">All albums</option>
          {albums.map((album) => (
            <option key={album.id} value={album.id}>
              {album.title}
            </option>
          ))}
        </select>
      </div>

      <section className="mt-6">
        {isLoading ? (
          <Spinner label="Loading preview photos" />
        ) : error ? (
          <EmptyState title="Preview photos unavailable" message={error} />
        ) : !photos.length ? (
          <EmptyState
            title="No preview photos yet"
            message="Uploaded preview photos will appear here for admin review."
          />
        ) : !filteredPhotos.length ? (
          <EmptyState
            title="No matching preview photos"
            message="Try another filename, class, event, or tag."
          />
        ) : (
          <>
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="hidden grid-cols-[72px_1fr_180px_110px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-normal text-slate-500 md:grid">
                <span>Preview</span>
                <span>Details</span>
                <span>Tags</span>
                <span>Actions</span>
              </div>
              <div className="divide-y divide-slate-100">
                {filteredPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="grid gap-4 px-5 py-4 md:grid-cols-[72px_1fr_180px_110px] md:items-center"
                  >
                    <div className="relative h-16 w-16 overflow-hidden rounded-md bg-slate-100">
                      <Image
                        src={photo.thumbnailUrl}
                        alt={photo.fileName}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">
                        {photo.fileName}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {photo.classTag || "No class"} -{" "}
                        {photo.eventTag || "No event"} - Term {photo.term} -{" "}
                        {photo.year}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {photo.tags.length ? (
                        photo.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-tealhub-50 px-2 py-1 text-xs font-semibold text-tealhub-700"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">No tags</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setPhotoToDelete(photo)}
                      className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:border-red-300 hover:text-red-600"
                      aria-label={`Delete ${photo.fileName}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) =>
                setPagination((current) => ({ ...current, page }))
              }
            />
          </>
        )}
      </section>

      <ConfirmModal
        isOpen={Boolean(photoToDelete)}
        isBusy={isDeleting}
        title="Delete preview photo"
        message="This removes the preview metadata from MongoDB and deletes the Cloudinary asset."
        onCancel={() => setPhotoToDelete(null)}
        onConfirm={deletePhoto}
      />
    </main>
  );
}
