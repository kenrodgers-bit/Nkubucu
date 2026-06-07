"use client";

import Image from "next/image";
import { ChangeEvent, DragEvent, useMemo, useRef, useState } from "react";
import { CheckCircle2, ImagePlus, RotateCcw, UploadCloud, XCircle } from "lucide-react";
import type { Album } from "@/lib/client-types";

type UploadStatus = "pending" | "uploading" | "success" | "error";

type UploadItem = {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
  status: UploadStatus;
  error?: string;
};

type UploadZoneProps = {
  album: Album;
};

const minimumPreviewPhotos = 3;
const maximumPreviewPhotos = 5;
const acceptedImageExtensions = [
  ".jpg",
  ".jpeg",
  ".jpe",
  ".jfif",
  ".png",
  ".webp",
  ".gif",
  ".heic",
  ".heif",
  ".avif",
  ".bmp",
  ".tif",
  ".tiff",
];

function isSupportedPreviewPhoto(file: File) {
  const extension = file.name
    .slice(Math.max(0, file.name.lastIndexOf(".")))
    .toLowerCase();

  return file.type.startsWith("image/") || acceptedImageExtensions.includes(extension);
}

export function UploadZone({ album }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [uploadedPreviewCount, setUploadedPreviewCount] = useState(
    album.photoCount,
  );
  const [classTag, setClassTag] = useState("");
  const [eventTag, setEventTag] = useState(album.eventName);
  const [tags, setTags] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const totals = useMemo(() => {
    const success = items.filter((item) => item.status === "success").length;
    const errors = items.filter((item) => item.status === "error").length;
    const progress = items.length
      ? Math.round(
          items.reduce((sum, item) => sum + item.progress, 0) / items.length,
        )
      : 0;

    return { success, errors, progress };
  }, [items]);

  function addFiles(fileList: FileList | File[]) {
    setItems((current) => {
      const reservedSlots =
        uploadedPreviewCount +
        current.filter(
          (item) => item.status === "pending" || item.status === "uploading",
        ).length;
      const availableSlots = Math.max(maximumPreviewPhotos - reservedSlots, 0);
      const nextItems = Array.from(fileList)
        .filter(isSupportedPreviewPhoto)
        .slice(0, availableSlots)
        .map((file) => ({
          id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
          file,
          previewUrl: URL.createObjectURL(file),
          progress: 0,
          status: "pending" as UploadStatus,
        }));

      return [...current, ...nextItems];
    });
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      addFiles(event.target.files);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    addFiles(event.dataTransfer.files);
  }

  function setItemsByIds(targetItems: UploadItem[], patch: Partial<UploadItem>) {
    const ids = new Set(targetItems.map((item) => item.id));

    setItems((current) =>
      current.map((item) => (ids.has(item.id) ? { ...item, ...patch } : item)),
    );
  }

  function uploadItems(targetItems: UploadItem[]) {
    const nextPreviewCount = uploadedPreviewCount + targetItems.length;

    if (
      !targetItems.length ||
      nextPreviewCount < minimumPreviewPhotos ||
      nextPreviewCount > maximumPreviewPhotos
    ) {
      return;
    }

    return new Promise<void>((resolve) => {
      const formData = new FormData();
      formData.append("albumId", album.id);
      formData.append("classTag", classTag);
      formData.append("eventTag", eventTag);
      formData.append("tags", tags);
      targetItems.forEach((item) => formData.append("files", item.file));

      const xhr = new XMLHttpRequest();
      setItemsByIds(targetItems, {
        status: "uploading",
        progress: 5,
        error: undefined,
      });
      setIsUploading(true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setItemsByIds(targetItems, {
            progress: Math.max(5, Math.round((event.loaded / event.total) * 95)),
          });
        }
      };

      xhr.onload = () => {
        let parsed: {
          errors?: { fileName: string; error: string }[];
          error?: string;
        } = {};

        try {
          parsed = JSON.parse(xhr.responseText);
        } catch {
          parsed = {};
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          const errorMap = new Map(
            parsed.errors?.map((error) => [error.fileName, error.error]) ?? [],
          );

          setItems((current) =>
            current.map((item) => {
              const error = errorMap.get(item.file.name);
              const wasUploaded = targetItems.some(
                (targetItem) => targetItem.id === item.id,
              );

              if (!wasUploaded) {
                return item;
              }

              return error
                ? { ...item, status: "error", progress: 0, error }
                : { ...item, status: "success", progress: 100 };
            }),
          );
          setUploadedPreviewCount(
            (count) => count + targetItems.length - errorMap.size,
          );
        } else {
          const fallbackError = parsed.error ?? "Upload failed";
          const errorMap = new Map(
            parsed.errors?.map((error) => [error.fileName, error.error]) ?? [],
          );

          setItems((current) =>
            current.map((item) => {
              const wasUploaded = targetItems.some(
                (targetItem) => targetItem.id === item.id,
              );

              if (!wasUploaded) {
                return item;
              }

              return {
                ...item,
                status: "error",
                progress: 0,
                error: errorMap.get(item.file.name) ?? fallbackError,
              };
            }),
          );
        }

        setIsUploading(false);
        resolve();
      };

      xhr.onerror = () => {
        setItemsByIds(targetItems, {
          status: "error",
          progress: 0,
          error: "Network error",
        });
        setIsUploading(false);
        resolve();
      };

      xhr.open("POST", "/api/admin/photos/upload");
      xhr.send(formData);
    });
  }

  function retryFailed() {
    const failed = items.filter((item) => item.status === "error");
    uploadItems(failed);
  }

  const pendingItems = items.filter((item) => item.status === "pending");
  const nextPreviewCount = uploadedPreviewCount + pendingItems.length;
  const canUploadPending =
    pendingItems.length > 0 &&
    nextPreviewCount >= minimumPreviewPhotos &&
    nextPreviewCount <= maximumPreviewPhotos;
  const previewStatusText = `${uploadedPreviewCount} of ${maximumPreviewPhotos} preview photos uploaded`;
  const validationMessage =
    pendingItems.length && !canUploadPending
      ? `Select enough preview photos to end with ${minimumPreviewPhotos} to ${maximumPreviewPhotos} total.`
      : "";

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Class tag</span>
            <input
              value={classTag}
              onChange={(event) => setClassTag(event.target.value)}
              placeholder="Form 1"
              className="focus-ring mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Event tag</span>
            <input
              value={eventTag}
              onChange={(event) => setEventTag(event.target.value)}
              className="focus-ring mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">
              Custom tags
            </span>
            <input
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="sports, prize day"
              className="focus-ring mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-sm"
            />
          </label>
        </div>
        <div className="mt-4 rounded-md border border-tealhub-100 bg-tealhub-50 px-3 py-2 text-sm font-semibold text-tealhub-800">
          {previewStatusText}. Upload only {minimumPreviewPhotos} to{" "}
          {maximumPreviewPhotos} preview photos here; the complete album stays
          in {album.storageProvider || "your external storage"}.
        </div>
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`rounded-lg border-2 border-dashed bg-white p-8 text-center transition ${
          isDragging
            ? "border-tealhub-500 bg-tealhub-50"
            : "border-slate-300 hover:border-tealhub-500"
        }`}
      >
        <input
          ref={inputRef}
          onChange={handleInputChange}
          type="file"
          accept="image/*,.jpg,.jpeg,.jpe,.jfif,.png,.webp,.gif,.heic,.heif,.avif,.bmp,.tif,.tiff"
          multiple
          className="hidden"
        />
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-tealhub-50 text-tealhub-700">
          <ImagePlus size={26} />
        </div>
        <p className="mt-4 text-base font-semibold text-ink">
          Drop preview photos here
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Choose {minimumPreviewPhotos} to {maximumPreviewPhotos} JPG/JFIF,
          PNG, HEIC, HEIF, AVIF, TIFF, BMP, WebP, or GIF files. Maximum 25 MB each.
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploadedPreviewCount >= maximumPreviewPhotos || isUploading}
          className="focus-ring mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-tealhub-500 px-4 text-sm font-semibold text-white transition hover:bg-tealhub-600"
        >
          <UploadCloud size={17} />
          Choose files
        </button>
      </div>

      {items.length ? (
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-base font-semibold text-ink">
                Selected preview files
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {totals.success} uploaded, {totals.errors} failed
              </p>
              {validationMessage ? (
                <p className="mt-2 text-sm font-medium text-amber-700">
                  {validationMessage}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {totals.errors ? (
                <button
                  type="button"
                  onClick={retryFailed}
                  disabled={isUploading}
                  className="focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:border-tealhub-500 hover:text-tealhub-700 disabled:opacity-50"
                >
                  <RotateCcw size={16} />
                  Retry failed
                </button>
              ) : null}
              <button
                type="button"
                onClick={() =>
                  uploadItems(items.filter((item) => item.status === "pending"))
                }
                disabled={isUploading || !canUploadPending}
                className="focus-ring inline-flex h-10 items-center gap-2 rounded-md bg-tealhub-500 px-4 text-sm font-semibold text-white transition hover:bg-tealhub-600 disabled:opacity-50"
              >
                <UploadCloud size={16} />
                Upload previews
              </button>
            </div>
          </div>
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-tealhub-500 transition-all"
                style={{ width: `${totals.progress}%` }}
              />
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <div
                key={item.id}
                className="grid gap-4 px-5 py-4 sm:grid-cols-[64px_1fr_160px] sm:items-center"
              >
                <div className="relative h-16 w-16 overflow-hidden rounded-md bg-slate-100">
                  <Image
                    src={item.previewUrl}
                    alt={item.file.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">
                    {item.file.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {(item.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all ${
                        item.status === "error" ? "bg-red-500" : "bg-tealhub-500"
                      }`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  {item.error ? (
                    <p className="mt-2 text-xs font-medium text-red-600">
                      {item.error}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  {item.status === "success" ? (
                    <span className="inline-flex items-center gap-2 text-tealhub-700">
                      <CheckCircle2 size={17} />
                      Uploaded
                    </span>
                  ) : item.status === "error" ? (
                    <span className="inline-flex items-center gap-2 text-red-600">
                      <XCircle size={17} />
                      Failed
                    </span>
                  ) : item.status === "uploading" ? (
                    <span className="text-slate-600">Uploading</span>
                  ) : (
                    <span className="text-slate-500">Pending</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
