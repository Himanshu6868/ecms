"use client";

import { cn } from "@/lib/utils";

export function ModalOverlay({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("fixed inset-0 bg-[var(--overlay-dark)] backdrop-blur-[3px]", className)} {...props} />;
}
