import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AlbumForm } from "@/components/admin/AlbumForm";

export const metadata: Metadata = {
  title: "New Album",
};

export default function NewAlbumPage() {
  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href="/admin/albums"
        className="focus-ring inline-flex items-center gap-2 rounded-md text-sm font-semibold text-tealhub-700 hover:text-tealhub-600"
      >
        <ArrowLeft size={17} />
        Albums
      </Link>
      <div className="mt-5">
        <h1 className="text-2xl font-bold text-ink">New album</h1>
        <p className="mt-1 text-sm text-slate-500">
          Add the full-album cloud link before uploading preview photos.
        </p>
      </div>
      <div className="mt-6">
        <AlbumForm />
      </div>
    </main>
  );
}
