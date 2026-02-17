"use client";

import { cn } from "@/lib/utils";

export function PanelCard({ className, ...props }: React.ComponentProps<"section">) {
  return <section className={cn("rounded-lg border border-slate-200 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.06)]", className)} {...props} />;
}

export function KeyValueRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-2 last:border-b-0 last:pb-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="text-sm font-medium text-slate-800">{value}</dd>
    </div>
  );
}
