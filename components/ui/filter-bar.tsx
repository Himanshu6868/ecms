import { Search } from "lucide-react";

export function FilterBar({ children, searchPlaceholder = "Search tickets, status, or assignee" }: { children?: React.ReactNode; searchPlaceholder?: string }) {
  return (
    <div className="surface-muted flex w-full flex-wrap items-center gap-3 p-3">
      <label className="relative block min-w-0 flex-1">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-600"
        />
        <input
          aria-label="Search tickets"
          className="input-clean h-10 pl-10 pr-3 placeholder:text-ink-600"
          placeholder={searchPlaceholder}
          type="search"
        />
      </label>
      <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">{children}</div>
    </div>
  );
}
