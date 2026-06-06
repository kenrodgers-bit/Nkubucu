"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/albums", label: "Albums", icon: Images },
  { href: "/admin/photos", label: "Preview Photos", icon: Images },
  { href: "/admin#stats", label: "Stats", icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const nav = (
    <nav className="mt-8 space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href.split("#")[0]);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsOpen(false)}
            className={`focus-ring flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition ${
              isActive
                ? "bg-tealhub-50 text-tealhub-700"
                : "text-slate-600 hover:bg-slate-100 hover:text-ink"
            }`}
          >
            <Icon size={18} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <Link href="/admin" className="block">
          <BrandLogo className="w-36" />
        </Link>
        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-700"
          aria-label="Toggle admin navigation"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white px-4 py-5 transition lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <Link href="/admin" className="block">
            <BrandLogo className="w-44" />
          </Link>
          <p className="mt-1 text-sm text-slate-500">Admin</p>
        </div>
        {nav}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="focus-ring absolute bottom-5 left-4 right-4 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-ink"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </aside>
      {isOpen ? (
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
        />
      ) : null}
    </>
  );
}
