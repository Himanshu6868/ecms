import { cn } from "@/lib/utils";

export function ButtonPrimary({ className, ...props }: React.ComponentProps<"button">) {
  return <button className={cn("rounded-md border border-[var(--color-primary)] bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-text-primary transition-colors duration-150 hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60", className)} {...props} />;
}
