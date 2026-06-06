"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import type { Photo } from "@/lib/client-types";

type LightboxProps = {
  photos: Photo[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
};

export function Lightbox({
  photos,
  index,
  onClose,
  onIndexChange,
}: LightboxProps) {
  const photo = photos[index];

  if (!photo) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/90 text-white"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{photo.fileName}</p>
          <p className="mt-0.5 text-xs text-white/60">
            {[photo.classTag, photo.eventTag].filter(Boolean).join(" • ")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/api/photos/${photo.id}/download`}
            className="focus-ring inline-flex h-10 items-center gap-2 rounded-md bg-white px-3 text-sm font-semibold text-ink transition hover:bg-slate-100"
          >
            <Download size={17} />
            <span className="hidden sm:inline">Download</span>
          </a>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-md bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Close lightbox"
          >
            <X size={20} />
          </button>
        </div>
      </div>
      <div className="relative min-h-0 flex-1">
        <Image
          src={photo.originalUrl}
          alt={photo.fileName}
          fill
          sizes="100vw"
          className="object-contain p-4 md:p-8"
          priority
        />
        {photos.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() =>
                onIndexChange(index === 0 ? photos.length - 1 : index - 1)
              }
              className="focus-ring absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-lg transition hover:bg-white"
              aria-label="Previous photo"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={() =>
                onIndexChange(index === photos.length - 1 ? 0 : index + 1)
              }
              className="focus-ring absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-lg transition hover:bg-white"
              aria-label="Next photo"
            >
              <ChevronRight size={22} />
            </button>
          </>
        ) : null}
      </div>
      {photo.tags.length ? (
        <div className="flex flex-wrap gap-2 border-t border-white/10 px-4 py-3">
          {photo.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/85"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
