import type { Metadata } from "next";
import { SettingsPage } from "@/components/admin/SettingsPage";

export const metadata: Metadata = {
  title: "Admin Settings",
};

export default function AdminSettingsPage() {
  return <SettingsPage />;
}
