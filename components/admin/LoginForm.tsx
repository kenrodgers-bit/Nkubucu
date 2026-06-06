"use client";

import { FormEvent, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandIcon, BrandLogo } from "@/components/BrandLogo";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [missingEnv, setMissingEnv] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSetupState() {
      try {
        const response = await fetch("/api/setup");
        const data = await response.json();

        if (isMounted) {
          setMissingEnv(data.missing ?? []);
        }
      } catch {
        if (isMounted) {
          setMissingEnv([]);
        }
      }
    }

    loadSetupState();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (result?.error) {
      setError("Invalid admin credentials");
      return;
    }

    router.push(searchParams.get("callbackUrl") ?? "/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between gap-4">
          <BrandLogo className="w-44" priority />
          <BrandIcon />
        </div>
        <h1 className="sr-only">School Photo Hub</h1>
        <p className="mt-2 text-sm text-slate-500">Admin sign in</p>
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
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Password</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              required
              className="focus-ring mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-sm text-ink"
            />
          </label>
          {missingEnv.length ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-900">
              Configure .env.local first: {missingEnv.join(", ")}.
            </div>
          ) : null}
          {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="focus-ring h-11 w-full rounded-md bg-tealhub-500 text-sm font-semibold text-white transition hover:bg-tealhub-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Signing in" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
