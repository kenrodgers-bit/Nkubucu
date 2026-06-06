"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { UploadZone } from "@/components/admin/UploadZone";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import type { Album } from "@/lib/client-types";

export function UploadPage({ albumId }: { albumId: string }) {
  const [album, setAlbum] = useState<Album | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadAlbum() {
      try {
        const response = await fetch("/api/admin/albums");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Unable to load album");
        }

        const match = data.albums.find((item: Album) => item.id === albumId);

        if (!match) {
          throw new Error("Album not found");
        }

        if (isMounted) {
          setAlbum(match);
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
  }, [albumId]);

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href="/admin/albums"
        className="focus-ring inline-flex items-center gap-2 rounded-md text-sm font-semibold text-tealhub-700 hover:text-tealhub-600"
      >
        <ArrowLeft size={17} />
        Albums
      </Link>
      <div className="mt-5">
        <h1 className="text-2xl font-bold text-ink">Upload preview photos</h1>
        <p className="mt-1 text-sm text-slate-500">
          {album
            ? `${album.title} - Term ${album.term} - ${album.year}`
            : "Prepare 3 to 5 preview images for this album."}
        </p>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <Spinner label="Loading album" />
        ) : error || !album ? (
          <EmptyState title="Upload unavailable" message={error} />
        ) : (
          <UploadZone album={album} />
        )}
      </div>
    </main>
  );
}
