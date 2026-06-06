import Image from "next/image";
import Link from "next/link";
import { Images } from "lucide-react";
import type { Album } from "@/lib/client-types";

export function AlbumCard({ album }: { album: Album }) {
  return (
    <Link
      href={`/album/${album.slug}`}
      className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-tealhub-50 via-white to-slate-100">
        {album.coverImageUrl ? (
          <Image
            src={album.coverImageUrl}
            alt={`${album.title} cover`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-tealhub-600">
            <Images size={42} />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
          <div className="flex items-center justify-between gap-3 text-xs font-semibold">
            <span>Term {album.term}</span>
            <span>{album.year}</span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="line-clamp-2 text-base font-semibold leading-6 text-ink">
              {album.title}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{album.eventName}</p>
          </div>
          <span className="shrink-0 rounded-full bg-tealhub-50 px-2.5 py-1 text-xs font-semibold text-tealhub-700">
            {album.photoCount} previews
          </span>
        </div>
      </div>
    </Link>
  );
}
