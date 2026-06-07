"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { BrandIcon, BrandLogo } from "@/components/BrandLogo";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to request password reset");
      }

      setMessage(data.message);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to request password reset",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between gap-4">
          <BrandLogo className="w-44" priority />
          <BrandIcon />
        </div>
        <h1 className="mt-6 text-xl font-bold text-ink">Reset admin access</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Enter the admin email. If another admin exists, they can create a new
          temporary admin from Settings.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
              className="focus-ring mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-sm text-ink"
            />
          </label>
          {message ? (
            <p className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-tealhub-800">
              {message}
            </p>
          ) : null}
          {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="focus-ring h-11 w-full rounded-md bg-tealhub-500 text-sm font-semibold text-white transition hover:bg-tealhub-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Submitting" : "Request reset"}
          </button>
        </form>
        <Link
          href="/admin/login"
          className="focus-ring mt-5 inline-flex rounded-md text-sm font-semibold text-tealhub-700 hover:text-tealhub-600"
        >
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
