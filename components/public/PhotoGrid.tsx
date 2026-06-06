"use client";

import type { Photo } from "@/lib/client-types";
import { PhotoCard } from "@/components/public/PhotoCard";

type PhotoGridProps = {
  photos: Photo[];
  onOpen: (index: number) => void;
};

export function PhotoGrid({ photos, onOpen }: PhotoGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {photos.map((photo, index) => (
        <PhotoCard key={photo.id} photo={photo} onOpen={() => onOpen(index)} />
      ))}
    </div>
  );
}
