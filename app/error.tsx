"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-bold text-ink">Something went wrong</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          The page failed to load. Try again or check the Vercel logs if this
          continues.
        </p>
        <button
          type="button"
          onClick={reset}
          className="focus-ring mt-5 h-10 rounded-md bg-tealhub-500 px-4 text-sm font-semibold text-white transition hover:bg-tealhub-600"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
