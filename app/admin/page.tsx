import type { Metadata } from "next";
import { DashboardHome } from "@/components/admin/DashboardHome";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default function AdminPage() {
  return <DashboardHome />;
}
