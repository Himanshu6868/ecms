"use client";

import { cn } from "@/lib/utils";

export function ModalOverlay({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("fixed inset-0 bg-slate-950/35 backdrop-blur-[2px]", className)} {...props} />;
}
