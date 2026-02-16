import { Search } from "lucide-react";

export function FilterBar({ children, searchPlaceholder = "Search tickets, status, or assignee" }: { children?: React.ReactNode; searchPlaceholder?: string }) {
  return (
    <div className="surface-muted flex flex-wrap items-center gap-3 p-3">
      <label className="relative min-w-56 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-600" />
        <input className="input-clean pl-9" placeholder={searchPlaceholder} />
      </label>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}
