import type { ReactNode } from "react";
import Link from "next/link";
import { ImageOff } from "lucide-react";

type EmptyStateProps = {
  title: string;
  message: string;
  cta?: {
    href: string;
    label: string;
  };
  icon?: ReactNode;
};

export function EmptyState({ title, message, cta, icon }: EmptyStateProps) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-tealhub-50 text-tealhub-600">
        {icon ?? <ImageOff size={22} />}
      </div>
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{message}</p>
      {cta ? (
        <Link
          href={cta.href}
          className="focus-ring mt-5 rounded-md bg-tealhub-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-tealhub-600"
        >
          {cta.label}
        </Link>
      ) : null}
    </div>
  );
}
