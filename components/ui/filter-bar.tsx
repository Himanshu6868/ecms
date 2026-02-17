import { ChangeEvent, FormEvent, MouseEvent, useCallback } from "react";
import { Loader2, Search } from "lucide-react";

interface FilterTabItem {
  id: string;
  label: string;
}

interface FilterBarProps {
  children?: React.ReactNode;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filterTabs?: FilterTabItem[];
  activeFilter?: string;
  onFilterChange?: (id: string) => void;
  onApply?: () => void;
  isApplying?: boolean;
}

type TabClickEvent = MouseEvent<HTMLButtonElement>;

export function FilterBar({
  children,
  searchPlaceholder = "Search tickets, status, or assignee",
  searchValue,
  onSearchChange,
  filterTabs,
  activeFilter,
  onFilterChange,
  onApply,
  isApplying = false,
}: FilterBarProps) {
  const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (onApply) {
      onApply();
    }
  }, [onApply]);

  const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    if (onSearchChange) {
      onSearchChange(event.target.value);
    }
  }, [onSearchChange]);

  const hasTabs = Boolean(filterTabs?.length);

  const handleTabClick = useCallback((event: TabClickEvent) => {
    const selectedId = event.currentTarget.dataset.filterId;
    if (selectedId && onFilterChange) {
      onFilterChange(selectedId);
    }
  }, [onFilterChange]);

  return (
    <form className="surface-muted flex w-full flex-col gap-3 p-3" onSubmit={handleSubmit}>
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative block min-w-0 flex-1" htmlFor="ticket-search-input">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-placeholder"
          />
          <input
            id="ticket-search-input"
            aria-label="Search tickets"
            className="input-clean h-10 pl-12 pr-3 placeholder:text-text-placeholder"
            
            placeholder={searchPlaceholder}
            type="search"
            value={searchValue ?? ""}
            onChange={handleInputChange}
          />
        </label>

        {onApply ? (
          <button
            type="submit"
            className="btn-brand inline-flex h-10 min-w-24 items-center justify-center gap-2 text-xs disabled:cursor-not-allowed"
            disabled={isApplying}
            aria-busy={isApplying}
          >
            <Loader2 aria-hidden="true" className={isApplying ? "h-4 w-4 animate-spin" : "invisible h-4 w-4"} />
            <span>Apply</span>
          </button>
        ) : null}
      </div>

      {hasTabs ? (
        <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto" role="tablist" aria-label="Ticket filters">
          {filterTabs?.map((tab) => {
            const isActive = activeFilter === tab.id;

            return (
              <button
                key={tab.id}
                data-filter-id={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={isActive ? "btn-brand text-xs" : "btn-muted text-xs"}
                onClick={handleTabClick}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      ) : null}

      {children ? (
        <div className="flex w-full flex-wrap items-center justify-end gap-2">{children}</div>
      ) : null}
    </form>
  );
}
