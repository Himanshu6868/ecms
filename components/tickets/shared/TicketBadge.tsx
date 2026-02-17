"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide",
  {
    variants: {
      tone: {
        neutral: "border-border-default bg-bg-elevated text-ink-700",
        status: "border-theme-primary/40 bg-theme-primary-soft text-indigo-200",
        low: "border-success-600/35 bg-success-100 text-success-600",
        medium: "border-warning-600/35 bg-warning-100 text-warning-600",
        high: "border-theme-primary/45 bg-theme-primary-soft text-indigo-200",
        critical: "border-error-600/35 bg-error-100 text-error-600",
        live: "border-theme-primary/45 bg-theme-primary-soft text-indigo-200",
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
