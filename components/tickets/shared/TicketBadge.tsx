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
        low: "border-primary/35 bg-primary/10 text-primary",
        medium: "border-border-subtle bg-bg-surface/80 text-text-secondary",
        high: "border-primary/45 bg-primary-soft text-text-primary",
        critical: "border-state-error/45 bg-state-error/10 text-state-error",
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
