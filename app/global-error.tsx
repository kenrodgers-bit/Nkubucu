"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
          <div className="max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
            <h1 className="text-xl font-bold text-ink">System unavailable</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Refresh the page. If the issue continues, review the latest Vercel
              logs for the error digest.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-5 h-10 rounded-md bg-tealhub-500 px-4 text-sm font-semibold text-white transition hover:bg-tealhub-600"
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
