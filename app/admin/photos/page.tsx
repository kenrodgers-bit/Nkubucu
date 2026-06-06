import type { Metadata } from "next";
import { PhotoManager } from "@/components/admin/PhotoManager";

export const metadata: Metadata = {
  title: "Preview Photos",
};

export default function AdminPhotosPage() {
  return <PhotoManager />;
}
