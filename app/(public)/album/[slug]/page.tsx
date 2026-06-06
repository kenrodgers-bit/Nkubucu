import type { Metadata } from "next";
import { AlbumGallery } from "@/components/public/AlbumGallery";

export const metadata: Metadata = {
  title: "Photo Library",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AlbumPage({ params }: { params: { slug: string } }) {
  return <AlbumGallery slug={params.slug} />;
}
