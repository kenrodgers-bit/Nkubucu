import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: number | string;
};

export function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-ink">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-tealhub-50 text-tealhub-700">
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}
