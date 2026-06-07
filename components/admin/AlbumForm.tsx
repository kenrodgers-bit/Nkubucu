"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Album } from "@/lib/client-types";
import { detectStorageProvider } from "@/lib/validators";
import { Spinner } from "@/components/ui/Spinner";

type AlbumFormProps = {
  albumId?: string;
};

type AlbumStatus = "draft" | "published" | "hidden";
type LinkCheckStatus = "idle" | "checking" | "ok" | "warning" | "error";

type FormState = {
  title: string;
  term: "1" | "2" | "3";
  year: string;
  eventName: string;
  description: string;
  externalAlbumUrl: string;
  storageProvider: string;
  status: AlbumStatus;
};

type LinkCheckResult = {
  status: "ok" | "warning" | "error";
  storageProvider?: string;
  message: string;
};

const defaultState: FormState = {
  title: "",
  term: "1",
  year: new Date().getFullYear().toString(),
  eventName: "",
  description: "",
  externalAlbumUrl: "",
  storageProvider: "",
  status: "draft",
};

const providerSuggestions = [
  "Google Photos",
  "Google Drive",
  "TeraBox",
  "OneDrive",
  "Dropbox",
  "Other Cloud Storage",
];

const providerTips = [
  "Google Photos: create an album, open sharing, then copy the share link.",
  "Google Drive: use a folder link and set access to anyone with the link.",
  "OneDrive/TeraBox: confirm the link opens in a private browser tab before publishing.",
];

export function AlbumForm({ albumId }: AlbumFormProps) {
  const router = useRouter();
  const [state, setState] = useState<FormState>(defaultState);
  const [isLoading, setIsLoading] = useState(Boolean(albumId));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [linkCheck, setLinkCheck] = useState<{
    status: LinkCheckStatus;
    message: string;
  }>({ status: "idle", message: "" });

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
            status: album.status ?? (album.isPublic ? "published" : "hidden"),
          });
          setLinkCheck({
            status:
              album.externalLinkStatus === "unchecked"
                ? "idle"
                : album.externalLinkStatus,
            message: album.externalLinkCheckedAt
              ? `Last checked ${new Date(
                  album.externalLinkCheckedAt,
                ).toLocaleString()}.`
              : "",
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

  function updateExternalUrl(value: string) {
    const detectedProvider = detectStorageProvider(value);

    setState((current) => ({
      ...current,
      externalAlbumUrl: value,
      storageProvider:
        detectedProvider &&
        (!current.storageProvider ||
          providerSuggestions.includes(current.storageProvider))
          ? detectedProvider
          : current.storageProvider,
    }));
    setLinkCheck({ status: "idle", message: "" });
  }

  async function checkExternalLink(): Promise<LinkCheckResult> {
    setLinkCheck({ status: "checking", message: "Checking album link..." });

    const response = await fetch("/api/admin/link-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: state.externalAlbumUrl }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error ?? "Unable to check album link");
    }

    const result: LinkCheckResult = {
      status: data.status,
      storageProvider: data.storageProvider,
      message: data.message,
    };

    if (data.storageProvider) {
      update("storageProvider", data.storageProvider);
    }

    setLinkCheck({ status: result.status, message: result.message });
    return result;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const checkedLink = await checkExternalLink();

      if (checkedLink.status === "error") {
        throw new Error(checkedLink.message);
      }

      const response = await fetch(
        albumId ? `/api/admin/albums/${albumId}` : "/api/admin/albums",
        {
          method: albumId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...state,
            storageProvider: checkedLink.storageProvider || state.storageProvider,
            year: Number(state.year),
            isPublic: state.status === "published",
            externalLinkStatus: checkedLink.status,
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
      <div className="mb-5 rounded-md border border-teal-100 bg-teal-50 px-4 py-3 text-sm leading-6 text-tealhub-900">
        <p className="font-semibold">Upload only 3-5 preview photos here.</p>
        <p>Upload the full album to Google Photos/Drive first, then paste the shared folder link below.</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {providerTips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </div>

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
            Publish state
          </span>
          <select
            value={state.status}
            onChange={(event) =>
              update("status", event.target.value as AlbumStatus)
            }
            className="focus-ring mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-sm"
          >
            <option value="draft">Draft - prepare before students see it</option>
            <option value="published">Published - visible on student website</option>
            <option value="hidden">Hidden - saved but not shown to students</option>
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm font-semibold text-slate-700">
            External full-album link
          </span>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              value={state.externalAlbumUrl}
              onChange={(event) => updateExternalUrl(event.target.value)}
              type="url"
              required
              placeholder="https://photos.app.goo.gl/..."
              className="focus-ring h-11 w-full rounded-md border border-slate-200 px-3 text-sm"
            />
            <button
              type="button"
              onClick={() => {
                checkExternalLink().catch((checkError) =>
                  setError(
                    checkError instanceof Error
                      ? checkError.message
                      : "Unable to check album link",
                  ),
                );
              }}
              disabled={linkCheck.status === "checking"}
              className="focus-ring h-11 rounded-md border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              {linkCheck.status === "checking" ? "Checking" : "Check link"}
            </button>
          </div>
          <span className="mt-1 block text-xs text-slate-500">
            Students will open this link to view the complete album.
          </span>
          {linkCheck.message ? (
            <span
              className={`mt-2 block rounded-md px-3 py-2 text-sm ${
                linkCheck.status === "ok"
                  ? "bg-teal-50 text-tealhub-800"
                  : linkCheck.status === "warning"
                    ? "bg-amber-50 text-amber-900"
                    : "bg-red-50 text-red-700"
              }`}
            >
              {linkCheck.message}
            </span>
          ) : null}
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
