"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "text-body flex h-11 w-full rounded-xl border border-border-default bg-bg-elevated px-3 py-2 text-ink-900 shadow-[var(--shadow-xs)] transition placeholder:text-ink-600 focus-visible:border-theme-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-theme-primary/25 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
