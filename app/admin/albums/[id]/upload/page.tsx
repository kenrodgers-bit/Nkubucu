import type { Metadata } from "next";
import { UploadPage } from "@/components/admin/UploadPage";

export const metadata: Metadata = {
  title: "Upload Preview Photos",
};

export default function AlbumUploadPage({
  params,
}: {
  params: { id: string };
}) {
  return <UploadPage albumId={params.id} />;
}
