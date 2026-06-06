"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ExternalLink, Images } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import type { Album, Photo } from "@/lib/client-types";

type AlbumGalleryProps = {
  slug: string;
};

export function AlbumGallery({ slug }: AlbumGalleryProps) {
  const [album, setAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadAlbum() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/albums/${slug}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Unable to load album");
        }

        if (isMounted) {
          setAlbum(data.album);
          setPhotos(data.photos);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load album",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadAlbum();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const previewImages = useMemo(() => {
    if (photos.length) {
      return photos.map((photo) => ({
        id: photo.id,
        src: photo.thumbnailUrl,
        alt: photo.fileName,
      }));
    }

    return (album?.previewImageUrls ?? []).map((src, index) => ({
      id: `${src}-${index}`,
      src,
      alt: `${album?.title ?? "Album"} preview ${index + 1}`,
    }));
  }, [album, photos]);

  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="focus-ring inline-flex items-center gap-2 rounded-md text-sm font-semibold text-tealhub-700 hover:text-tealhub-600"
          >
            <ArrowLeft size={17} />
            Albums
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {isLoading ? (
          <div>
            <Spinner label="Loading album preview" />
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="skeleton aspect-square rounded-md" />
              ))}
            </div>
          </div>
        ) : error || !album ? (
          <EmptyState title="Album unavailable" message={error} />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
            <div>
              <div className="max-w-3xl">
                <h1 className="text-3xl font-bold tracking-normal text-ink sm:text-4xl">
                  {album.title}
                </h1>
                <p className="mt-3 text-sm font-semibold text-tealhub-700">
                  Term {album.term} - {album.year} - {album.eventName}
                </p>
                {album.description ? (
                  <p className="mt-4 text-base leading-7 text-slate-600">
                    {album.description}
                  </p>
                ) : null}
              </div>

              <div className="mt-8">
                <h2 className="text-lg font-semibold text-ink">
                  Preview photos
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  A small preview is shown here. The complete album is stored in{" "}
                  {album.storageProvider || "the linked cloud folder"}.
                </p>
              </div>

              {previewImages.length ? (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {previewImages.map((preview) => (
                    <div
                      key={preview.id}
                      className="relative aspect-square overflow-hidden rounded-lg bg-slate-100"
                    >
                      <Image
                        src={preview.src}
                        alt={preview.alt}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4">
                  <EmptyState
                    title="No preview photos yet"
                    message="The album exists, but preview photos have not been uploaded."
                  />
                </div>
              )}
            </div>

            <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-tealhub-50 text-tealhub-700">
                <Images size={24} />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-ink">
                Full album
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Open the complete folder on {album.storageProvider || "the cloud"}.
              </p>
              {album.externalAlbumUrl ? (
                <a
                  href={album.externalAlbumUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring mt-5 inline-flex h-14 w-full items-center justify-center gap-2 rounded-md bg-green-600 px-5 text-base font-bold text-white transition hover:bg-green-700"
                >
                  Check All Photos
                  <ExternalLink size={20} />
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="mt-5 inline-flex h-14 w-full items-center justify-center rounded-md bg-slate-200 px-5 text-base font-bold text-slate-500"
                >
                  Check All Photos
                </button>
              )}
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
