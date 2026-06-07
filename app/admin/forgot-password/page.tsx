import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/admin/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset Admin Access",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
