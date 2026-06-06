"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Images, Plus, Upload } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import type { Album } from "@/lib/client-types";

type Stats = {
  totalAlbums: number;
  totalPreviewPhotos: number;
};

export function DashboardHome() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        const [statsResponse, albumsResponse] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/albums"),
        ]);
        const [statsData, albumsData] = await Promise.all([
          statsResponse.json(),
          albumsResponse.json(),
        ]);

        if (!statsResponse.ok) {
          throw new Error(statsData.error ?? "Unable to load stats");
        }

        if (!albumsResponse.ok) {
          throw new Error(albumsData.error ?? "Unable to load albums");
        }

        if (isMounted) {
          setStats(statsData);
          setAlbums(albumsData.albums.slice(0, 5));
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load dashboard",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage school album previews and full-album cloud links.
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
        <Spinner label="Loading dashboard" />
      ) : error ? (
        <div className="mt-6">
          <EmptyState title="Dashboard unavailable" message={error} />
        </div>
      ) : (
        <>
          <section id="stats" className="mt-6 grid gap-4 sm:grid-cols-2">
            <StatCard
              icon={Images}
              label="Total albums"
              value={stats?.totalAlbums ?? 0}
            />
            <StatCard
              icon={Upload}
              label="Preview photos"
              value={stats?.totalPreviewPhotos ?? 0}
            />
          </section>
          <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <h2 className="text-base font-semibold text-ink">Recent albums</h2>
              <Link
                href="/admin/albums"
                className="focus-ring rounded-md text-sm font-semibold text-tealhub-700 hover:text-tealhub-600"
              >
                View all
              </Link>
            </div>
            {!albums.length ? (
              <div className="p-5">
                <EmptyState
                  title="No albums yet"
                  message="Create the first album to start uploading preview photos."
                  cta={{ href: "/admin/albums/new", label: "Create album" }}
                />
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {albums.map((album) => (
                  <div
                    key={album.id}
                    className="flex flex-col justify-between gap-3 px-5 py-4 sm:flex-row sm:items-center"
                  >
                    <div>
                      <p className="font-semibold text-ink">{album.title}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {album.eventName} - Term {album.term} - {album.year}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-tealhub-700">
                      {album.photoCount} previews
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
