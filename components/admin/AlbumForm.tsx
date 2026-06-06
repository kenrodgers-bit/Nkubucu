"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Album } from "@/lib/client-types";
import { Spinner } from "@/components/ui/Spinner";

type AlbumFormProps = {
  albumId?: string;
};

type FormState = {
  title: string;
  term: "1" | "2" | "3";
  year: string;
  eventName: string;
  description: string;
  externalAlbumUrl: string;
  storageProvider: string;
  isPublic: boolean;
};

const defaultState: FormState = {
  title: "",
  term: "1",
  year: new Date().getFullYear().toString(),
  eventName: "",
  description: "",
  externalAlbumUrl: "",
  storageProvider: "",
  isPublic: true,
};

const providerSuggestions = [
  "Google Photos",
  "Google Drive",
  "TeraBox",
  "OneDrive",
  "Dropbox",
];

export function AlbumForm({ albumId }: AlbumFormProps) {
  const router = useRouter();
  const [state, setState] = useState<FormState>(defaultState);
  const [isLoading, setIsLoading] = useState(Boolean(albumId));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!albumId) {
      return;
    }

    let isMounted = true;

    async function loadAlbum() {
      try {
        const response = await fetch("/api/admin/albums");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Unable to load album");
        }

        const album = data.albums.find((item: Album) => item.id === albumId);

        if (!album) {
          throw new Error("Album not found");
        }

        if (isMounted) {
          setState({
            title: album.title,
            term: album.term,
            year: album.year.toString(),
            eventName: album.eventName,
            description: album.description,
            externalAlbumUrl: album.externalAlbumUrl,
            storageProvider: album.storageProvider,
            isPublic: album.isPublic,
          });
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

  function update<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setState((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const response = await fetch(
        albumId ? `/api/admin/albums/${albumId}` : "/api/admin/albums",
        {
          method: albumId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...state,
            year: Number(state.year),
          }),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to save album");
      }

      router.push("/admin/albums");
      router.refresh();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Unable to save album",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <Spinner label="Loading album" />;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-sm font-semibold text-slate-700">Title</span>
          <input
            value={state.title}
            onChange={(event) => update("title", event.target.value)}
            required
            className="focus-ring mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Term</span>
          <select
            value={state.term}
            onChange={(event) =>
              update("term", event.target.value as FormState["term"])
            }
            className="focus-ring mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-sm"
          >
            <option value="1">Term 1</option>
            <option value="2">Term 2</option>
            <option value="3">Term 3</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Year</span>
          <input
            value={state.year}
            onChange={(event) => update("year", event.target.value)}
            type="number"
            min="2000"
            max="2100"
            required
            className="focus-ring mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-sm"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm font-semibold text-slate-700">Event</span>
          <input
            value={state.eventName}
            onChange={(event) => update("eventName", event.target.value)}
            required
            className="focus-ring mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-sm"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm font-semibold text-slate-700">
            External full-album link
          </span>
          <input
            value={state.externalAlbumUrl}
            onChange={(event) => update("externalAlbumUrl", event.target.value)}
            type="url"
            required
            placeholder="https://photos.app.goo.gl/..."
            className="focus-ring mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-sm"
          />
          <span className="mt-1 block text-xs text-slate-500">
            Students will open this link to view the complete album.
          </span>
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm font-semibold text-slate-700">
            Storage provider
          </span>
          <input
            value={state.storageProvider}
            onChange={(event) => update("storageProvider", event.target.value)}
            list="storage-provider-options"
            required
            placeholder="Google Photos"
            className="focus-ring mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-sm"
          />
          <datalist id="storage-provider-options">
            {providerSuggestions.map((provider) => (
              <option key={provider} value={provider} />
            ))}
          </datalist>
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm font-semibold text-slate-700">
            Description
          </span>
          <textarea
            value={state.description}
            onChange={(event) => update("description", event.target.value)}
            rows={4}
            className="focus-ring mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex items-center gap-3 sm:col-span-2">
          <input
            checked={state.isPublic}
            onChange={(event) => update("isPublic", event.target.checked)}
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-tealhub-600 focus:ring-tealhub-500"
          />
          <span className="text-sm font-semibold text-slate-700">
            Public album
          </span>
        </label>
      </div>
      {error ? <p className="mt-4 text-sm font-medium text-red-600">{error}</p> : null}
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="focus-ring rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="focus-ring rounded-md bg-tealhub-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-tealhub-600 disabled:opacity-60"
        >
          {isSaving ? "Saving" : "Save album"}
        </button>
      </div>
    </form>
  );
}
