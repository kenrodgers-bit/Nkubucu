"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Copy, Edit, Plus, Trash2, Upload } from "lucide-react";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import type { Album } from "@/lib/client-types";

export function AlbumList() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [albumToDelete, setAlbumToDelete] = useState<Album | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadAlbums();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleDelete() {
    if (!albumToDelete) {
      return;
    }

    setIsDeleting(true);
    const previousAlbums = albums;
    setAlbums((current) =>
      current.filter((album) => album.id !== albumToDelete.id),
    );

    try {
      const response = await fetch(`/api/admin/albums/${albumToDelete.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to delete album");
      }

      setAlbumToDelete(null);
    } catch (deleteError) {
      setAlbums(previousAlbums);
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete album",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  function copyLink(album: Album) {
    const url = `${window.location.origin}/album/${album.slug}`;
    navigator.clipboard?.writeText(url);
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-ink">Albums</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create albums, copy student links, and manage preview uploads.
          </p>
        </div>
        <Link
          href="/admin/albums/new"
          className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-md bg-tealhub-500 px-4 text-sm font-semibold text-white transition hover:bg-tealhub-600"
        >
          <Plus size={17} />
          New album
        </Link>
      </div>

      {isLoading ? (
        <Spinner label="Loading albums" />
      ) : error ? (
        <div className="mt-6">
          <EmptyState title="Albums unavailable" message={error} />
        </div>
      ) : !albums.length ? (
        <div className="mt-6">
          <EmptyState
            title="No albums yet"
            message="Create your first album before uploading preview photos."
            cta={{ href: "/admin/albums/new", label: "Create album" }}
          />
        </div>
      ) : (
        <section className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="hidden grid-cols-[1fr_110px_120px_260px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-normal text-slate-500 md:grid">
            <span>Album</span>
            <span>Previews</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          <div className="divide-y divide-slate-100">
            {albums.map((album) => (
              <div
                key={album.id}
                className="grid gap-4 px-5 py-4 md:grid-cols-[1fr_110px_120px_260px] md:items-center"
              >
                <div>
                  <p className="font-semibold text-ink">{album.title}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {album.eventName} - Term {album.term} - {album.year}
                  </p>
                </div>
                <p className="text-sm font-semibold text-slate-700">
                  {album.photoCount}
                </p>
                <span
                  className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${
                    album.isPublic
                      ? "bg-tealhub-50 text-tealhub-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {album.isPublic ? "Public" : "Private"}
                </span>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/admin/albums/${album.id}/upload`}
                    className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:border-tealhub-500 hover:text-tealhub-700"
                    aria-label={`Upload preview photos to ${album.title}`}
                  >
                    <Upload size={16} />
                  </Link>
                  <Link
                    href={`/admin/albums/${album.id}/edit`}
                    className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:border-tealhub-500 hover:text-tealhub-700"
                    aria-label={`Edit ${album.title}`}
                  >
                    <Edit size={16} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => copyLink(album)}
                    className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:border-tealhub-500 hover:text-tealhub-700"
                    aria-label={`Copy public link for ${album.title}`}
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlbumToDelete(album)}
                    className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:border-red-300 hover:text-red-600"
                    aria-label={`Delete ${album.title}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <ConfirmModal
        isOpen={Boolean(albumToDelete)}
        isBusy={isDeleting}
        title="Delete album"
        message="This deletes the album, all related preview photo records, and the Cloudinary assets for those previews."
        onCancel={() => setAlbumToDelete(null)}
        onConfirm={handleDelete}
      />
    </main>
  );
}
