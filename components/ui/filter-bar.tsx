import { ChangeEvent, FormEvent, MouseEvent, useCallback } from "react";
import { Loader2, Search } from "lucide-react";

interface FilterTabItem {
  id: string;
  label: string;
}

interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterTabs?: FilterTabItem[];
  activeFilter?: string;
  onFilterChange?: (id: string) => void;
  onApply?: () => void;
  isApplying?: boolean;
}

type TabClickEvent = MouseEvent<HTMLButtonElement>;

export function FilterBar({
  searchPlaceholder = "Search tickets, status, or assignee",
  searchValue,
  onSearchChange,
  filterTabs,
  activeFilter,
  onFilterChange,
  onApply,
  isApplying = false,
}: FilterBarProps) {
  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (onApply) {
        onApply();
      }
    },
    [onApply],
  );

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onSearchChange(event.target.value);
    },
    [onSearchChange],
  );

  const handleTabClick = useCallback(
    (event: TabClickEvent) => {
      const selectedId = event.currentTarget.dataset.filterId;
      if (selectedId && onFilterChange) {
        onFilterChange(selectedId);
      }
    },
    [onFilterChange],
  );

  const hasTabs = Boolean(filterTabs?.length);

  return (
    <form className="surface-muted w-full space-y-3 p-3" onSubmit={handleSubmit}>
      <div className="flex w-full items-center gap-2">
        <label className="relative block min-w-0 flex-1" htmlFor="ticket-search-input">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-600"
          />
          <input
            id="ticket-search-input"
            aria-label="Search tickets"
            className="input-clean h-10 pl-12 pr-3 placeholder:text-ink-600"
            style={{ paddingLeft: "3rem" }}
            placeholder={searchPlaceholder}
            type="search"
            value={searchValue}
            onChange={handleInputChange}
          />
        </label>

        {onApply ? (
          <button
            type="submit"
            className="btn-brand inline-flex h-10 min-w-24 items-center justify-center gap-2 px-4 text-xs"
            disabled={isApplying}
          >
            <Loader2
              aria-hidden="true"
              className={`h-3.5 w-3.5 shrink-0 transition-opacity ${isApplying ? "animate-spin opacity-100" : "opacity-0"}`}
            />
            <span>Apply</span>
          </button>
        ) : null}
      </div>

      {hasTabs ? (
        <div className="flex w-full flex-wrap items-center gap-2" role="tablist" aria-label="Ticket filters">
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
    </form>
  );
}
