"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold tracking-wide",
  {
    variants: {
      tone: {
        neutral: "border-panel-border bg-panel text-text-secondary",
        status: "border-panel-border bg-panel-elevated text-text-primary",
        low: "border-panel-border bg-panel text-text-secondary",
        medium: "border-panel-border bg-panel-elevated text-text-secondary",
        high: "border-panel-border bg-panel-elevated text-text-primary",
        critical: "border-panel-border bg-panel-elevated text-text-primary",
        live: "border-panel-border bg-panel-elevated text-text-primary",
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
