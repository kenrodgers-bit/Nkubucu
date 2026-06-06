import type { Metadata } from "next";
import { AlbumList } from "@/components/admin/AlbumList";

export const metadata: Metadata = {
  title: "Albums",
};

export default function AdminAlbumsPage() {
  return <AlbumList />;
}
