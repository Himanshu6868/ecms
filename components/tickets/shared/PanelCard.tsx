"use client";

import { cn } from "@/lib/utils";

export function PanelCard({ className, ...props }: React.ComponentProps<"section">) {
  return <section className={cn("rounded-lg border border-border-default bg-bg-surface p-4", className)} {...props} />;
}

export function KeyValueRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border-subtle py-2 last:border-b-0 last:pb-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-ink-600">{label}</dt>
      <dd className="text-sm font-medium text-ink-700">{value}</dd>
    </div>
  );
}
