"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Images,
  MousePointerClick,
  Plus,
  QrCode,
  Upload,
} from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import type { Album } from "@/lib/client-types";

type Stats = {
  totalAlbums: number;
  totalPreviewPhotos: number;
  totalViews: number;
  totalCheckAllClicks: number;
  providerCounts: { _id: string; count: number; checkAllClicks: number }[];
  mostViewedAlbums: Album[];
  warnings: string[];
};

const studentWebsiteUrl = "https://nkubucu.vercel.app";

export function DashboardHome() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const qrCodeUrl = useMemo(
    () =>
      `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
        studentWebsiteUrl,
      )}`,
    [],
  );

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
          <section id="stats" className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
            <StatCard
              icon={QrCode}
              label="Album views"
              value={stats?.totalViews ?? 0}
            />
            <StatCard
              icon={MousePointerClick}
              label="Check All clicks"
              value={stats?.totalCheckAllClicks ?? 0}
            />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
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
                      <div className="text-sm sm:text-right">
                        <p className="font-semibold text-tealhub-700">
                          {album.photoCount} previews
                        </p>
                        <p className="mt-1 text-slate-500">
                          {album.status.charAt(0).toUpperCase() +
                            album.status.slice(1)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-ink">Student QR code</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Print this for notices or share it in WhatsApp groups.
              </p>
              <div className="mt-4 flex justify-center rounded-md border border-slate-100 bg-white p-4">
                <img
                  src={qrCodeUrl}
                  alt="QR code for the student website"
                  className="h-44 w-44"
                />
              </div>
              <a
                href={studentWebsiteUrl}
                target="_blank"
                rel="noreferrer"
                className="focus-ring mt-4 flex h-10 items-center justify-center rounded-md bg-tealhub-500 px-4 text-sm font-semibold text-white transition hover:bg-tealhub-600"
              >
                Open student website
              </a>
              <p className="mt-3 break-all text-xs text-slate-500">
                {studentWebsiteUrl}
              </p>
            </div>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-base font-semibold text-ink">
                  Most viewed albums
                </h2>
              </div>
              {stats?.mostViewedAlbums.length ? (
                <div className="divide-y divide-slate-100">
                  {stats.mostViewedAlbums.map((album) => (
                    <div
                      key={album.id}
                      className="flex justify-between gap-4 px-5 py-4"
                    >
                      <div>
                        <p className="text-sm font-semibold text-ink">
                          {album.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {album.storageProvider}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-tealhub-700">
                        {album.viewCount} views
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-5">
                  <EmptyState
                    title="No views yet"
                    message="Published albums will appear here after students open them."
                  />
                </div>
              )}
            </div>

            <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-base font-semibold text-ink">
                  Provider usage
                </h2>
              </div>
              {stats?.providerCounts.length ? (
                <div className="divide-y divide-slate-100">
                  {stats.providerCounts.map((provider) => (
                    <div
                      key={provider._id}
                      className="flex justify-between gap-4 px-5 py-4"
                    >
                      <p className="text-sm font-semibold text-ink">
                        {provider._id}
                      </p>
                      <p className="text-sm text-slate-500">
                        {provider.count} albums, {provider.checkAllClicks} clicks
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-5">
                  <EmptyState
                    title="No providers yet"
                    message="Create albums with external links to track provider usage."
                  />
                </div>
              )}
            </div>
          </section>

          {stats?.warnings.length ? (
            <section className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-center gap-2 text-amber-900">
                <AlertTriangle size={19} />
                <h2 className="text-base font-semibold">System warnings</h2>
              </div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-amber-900">
                {stats.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}
    </main>
  );
}
