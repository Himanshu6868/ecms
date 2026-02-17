"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide",
  {
    variants: {
      tone: {
        neutral: "border-slate-200 bg-white text-slate-700",
        status: "border-violet-200 bg-violet-50 text-violet-700",
        low: "border-slate-200 bg-slate-100 text-slate-600",
        medium: "border-amber-200 bg-amber-50 text-amber-700",
        high: "border-orange-200 bg-orange-50 text-orange-700",
        critical: "border-rose-200 bg-rose-50 text-rose-700",
        live: "border-violet-200 bg-violet-50 text-violet-700",
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
