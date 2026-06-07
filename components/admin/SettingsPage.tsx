"use client";

import { FormEvent, useEffect, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
};

const emptyPasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const emptyAdminForm = {
  name: "",
  email: "",
  password: "",
};

export function SettingsPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [adminForm, setAdminForm] = useState(emptyAdminForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [adminMessage, setAdminMessage] = useState("");
  const [error, setError] = useState("");

  async function loadUsers() {
    const response = await fetch("/api/admin/users");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error ?? "Unable to load admin users");
    }

    setUsers(data.users);
  }

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        await loadUsers();
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load settings",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingPassword(true);
    setPasswordMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordForm),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to update password");
      }

      setPasswordForm(emptyPasswordForm);
      setPasswordMessage("Password updated successfully.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to update password",
      );
    } finally {
      setIsSavingPassword(false);
    }
  }

  async function createAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreatingAdmin(true);
    setAdminMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminForm),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to create admin");
      }

      setAdminForm(emptyAdminForm);
      setAdminMessage("Admin account created.");
      await loadUsers();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Unable to create admin",
      );
    } finally {
      setIsCreatingAdmin(false);
    }
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold text-ink">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage admin access and recovery options.
        </p>
      </div>

      {isLoading ? (
        <Spinner label="Loading settings" />
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-ink">Change password</h2>
            <form onSubmit={changePassword} className="mt-4 grid gap-4">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Current password
                </span>
                <input
                  value={passwordForm.currentPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      currentPassword: event.target.value,
                    }))
                  }
                  type="password"
                  required
                  className="focus-ring mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  New password
                </span>
                <input
                  value={passwordForm.newPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      newPassword: event.target.value,
                    }))
                  }
                  type="password"
                  minLength={8}
                  required
                  className="focus-ring mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Confirm new password
                </span>
                <input
                  value={passwordForm.confirmPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      confirmPassword: event.target.value,
                    }))
                  }
                  type="password"
                  minLength={8}
                  required
                  className="focus-ring mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-sm"
                />
              </label>
              {passwordMessage ? (
                <p className="text-sm font-medium text-tealhub-700">
                  {passwordMessage}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={isSavingPassword}
                className="focus-ring h-10 rounded-md bg-tealhub-500 px-4 text-sm font-semibold text-white transition hover:bg-tealhub-600 disabled:opacity-60"
              >
                {isSavingPassword ? "Saving" : "Update password"}
              </button>
            </form>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-ink">Admin accounts</h2>
            {users.length ? (
              <div className="mt-4 divide-y divide-slate-100 rounded-md border border-slate-100">
                {users.map((user) => (
                  <div key={user.id} className="px-3 py-3">
                    <p className="text-sm font-semibold text-ink">{user.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{user.email}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4">
                <EmptyState
                  title="No admin accounts"
                  message="Create an admin account to keep access recoverable."
                />
              </div>
            )}

            <form onSubmit={createAdmin} className="mt-5 grid gap-4">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Name</span>
                <input
                  value={adminForm.name}
                  onChange={(event) =>
                    setAdminForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  required
                  className="focus-ring mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Email</span>
                <input
                  value={adminForm.email}
                  onChange={(event) =>
                    setAdminForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  type="email"
                  required
                  className="focus-ring mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Temporary password
                </span>
                <input
                  value={adminForm.password}
                  onChange={(event) =>
                    setAdminForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  type="password"
                  minLength={8}
                  required
                  className="focus-ring mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-sm"
                />
              </label>
              {adminMessage ? (
                <p className="text-sm font-medium text-tealhub-700">
                  {adminMessage}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={isCreatingAdmin}
                className="focus-ring h-10 rounded-md border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                {isCreatingAdmin ? "Creating" : "Create admin"}
              </button>
            </form>
          </section>
        </div>
      )}

      {error ? <p className="mt-4 text-sm font-medium text-red-600">{error}</p> : null}
    </main>
  );
}
