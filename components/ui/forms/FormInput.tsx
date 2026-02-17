import { cn } from "@/lib/utils";

export function FormInput({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-md border border-panel-border bg-bg-field px-3 text-sm text-text-primary outline-none transition-colors duration-150 placeholder:text-text-placeholder focus:border-primary",
        className,
      )}
      {...props}
    />
  );
}
