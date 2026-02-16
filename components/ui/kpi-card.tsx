import { ArrowUpRight, type LucideIcon } from "lucide-react";

export function KpiCard({
  label,
  value,
  trend,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  trend?: string;
  icon: LucideIcon;
}) {
  return (
    <article className="surface-muted p-4 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-600">{label}</p>
        <span className="rounded-lg bg-brand-100 p-2 text-ink-700">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-ink-900">{value}</p>
      {trend ? (
        <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-ink-600">
          <ArrowUpRight className="h-3.5 w-3.5" />
          {trend}
        </p>
      ) : null}
    </article>
  );
}
