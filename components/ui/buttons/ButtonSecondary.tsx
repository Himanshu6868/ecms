import { cn } from "@/lib/utils";

export function ButtonSecondary({ className, ...props }: React.ComponentProps<"button">) {
  return <button className={cn("rounded-md border border-[var(--panel-border)] bg-[var(--panel-bg-elevated)] px-4 py-2 text-sm font-medium text-text-secondary transition-colors duration-150 hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-60", className)} {...props} />;
}
