"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide",
  {
    variants: {
      tone: {
        neutral: "border-border-default bg-bg-surface text-text-secondary",
        status: "border-primary/40 bg-primary-soft text-text-primary",
        low: "border-emerald-400/50 bg-emerald-500/10 text-emerald-300",
        medium: "border-sky-400/50 bg-sky-500/10 text-sky-300",
        high: "border-amber-400/60 bg-amber-500/10 text-amber-200",
        critical: "border-rose-400/60 bg-rose-500/15 text-rose-200",
        live: "border-primary/45 bg-primary-soft text-text-primary",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
);

export interface TicketBadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function TicketBadge({ className, tone, ...props }: TicketBadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export function priorityTone(priority: string): NonNullable<VariantProps<typeof badgeVariants>["tone"]> {
  if (priority === "CRITICAL") return "critical";
  if (priority === "HIGH") return "high";
  if (priority === "MEDIUM") return "medium";
  if (priority === "LOW") return "low";
  return "neutral";
}
