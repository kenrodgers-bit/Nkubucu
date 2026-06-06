"use client";

import { useEffect, useMemo, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { AlbumCard } from "@/components/public/AlbumCard";
import { SearchBar } from "@/components/public/SearchBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import type { Album } from "@/lib/client-types";

export function AlbumBrowser() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [query, setQuery] = useState("");
  const [termFilter, setTermFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [eventFilter, setEventFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadAlbums() {
      try {
        const response = await fetch("/api/albums");
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

  const filteredAlbums = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return albums.filter((album) =>
      (normalizedQuery
        ? [
            album.title,
            album.eventName,
            album.year.toString(),
            `term ${album.term}`,
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery)
        : true) &&
      (termFilter ? album.term === termFilter : true) &&
      (yearFilter ? album.year.toString() === yearFilter : true) &&
      (eventFilter ? album.eventName === eventFilter : true),
    );
  }, [albums, query, termFilter, yearFilter, eventFilter]);

  const years = useMemo(
    () =>
      Array.from(new Set(albums.map((album) => album.year.toString()))).sort(
        (a, b) => Number(b) - Number(a),
      ),
    [albums],
  );

  const events = useMemo(
    () => Array.from(new Set(albums.map((album) => album.eventName))).sort(),
    [albums],
  );

  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <BrandLogo className="w-56" priority />
              <h1 className="sr-only">School Photo Hub</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Browse school albums, preview events, and open the complete
                photo folders from shared cloud storage.
              </p>
            </div>
            <div className="rounded-md border border-tealhub-100 bg-tealhub-50 px-4 py-3 text-sm font-semibold text-tealhub-700">
              {albums.length} public albums
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_160px_160px_minmax(180px,220px)]">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Search albums"
            />
            <select
              value={termFilter}
              onChange={(event) => setTermFilter(event.target.value)}
              className="focus-ring h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm"
              aria-label="Filter by term"
            >
              <option value="">All terms</option>
              <option value="1">Term 1</option>
              <option value="2">Term 2</option>
              <option value="3">Term 3</option>
            </select>
            <select
              value={yearFilter}
              onChange={(event) => setYearFilter(event.target.value)}
              className="focus-ring h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm"
              aria-label="Filter by year"
            >
              <option value="">All years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <select
              value={eventFilter}
              onChange={(event) => setEventFilter(event.target.value)}
              className="focus-ring h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm"
              aria-label="Filter by event"
            >
              <option value="">All events</option>
              {events.map((eventName) => (
                <option key={eventName} value={eventName}>
                  {eventName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {isLoading ? (
          <div>
            <Spinner label="Loading albums" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-lg border border-slate-200 bg-white"
                >
                  <div className="skeleton aspect-[4/3]" />
                  <div className="space-y-3 p-4">
                    <div className="skeleton h-5 w-2/3 rounded" />
                    <div className="skeleton h-4 w-1/2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <EmptyState title="Albums unavailable" message={error} />
        ) : !albums.length ? (
          <EmptyState
            title="No albums yet"
            message="Public albums will appear here once an admin creates them."
          />
        ) : !filteredAlbums.length ? (
          <EmptyState
            title="No search results"
            message="Try a different album title, event, term, or year."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAlbums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
