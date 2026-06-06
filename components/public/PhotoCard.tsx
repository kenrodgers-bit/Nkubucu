"use client";

import Image from "next/image";
import { Download } from "lucide-react";
import type { Photo } from "@/lib/client-types";

type PhotoCardProps = {
  photo: Photo;
  onOpen: () => void;
};

export function PhotoCard({ photo, onOpen }: PhotoCardProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative aspect-square overflow-hidden rounded-md bg-slate-100 text-left"
    >
      <Image
        src={photo.thumbnailUrl}
        alt={photo.fileName}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
        className="object-cover transition duration-300 group-hover:scale-105"
        loading="lazy"
      />
      <span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/25" />
      <span className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-tealhub-700 opacity-0 shadow-sm transition group-hover:opacity-100">
        <Download size={16} />
      </span>
    </button>
  );
}
