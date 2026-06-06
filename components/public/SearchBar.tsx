"use client";

import { Search, X } from "lucide-react";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

export function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  return (
    <div className="relative w-full">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        size={18}
      />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="focus-ring h-11 w-full rounded-md border border-slate-200 bg-white pl-10 pr-10 text-sm text-ink shadow-sm placeholder:text-slate-400"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="focus-ring absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      ) : null}
    </div>
  );
}
