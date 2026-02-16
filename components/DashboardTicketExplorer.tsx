"use client";

import { useCallback, useDeferredValue, useMemo, useState, useTransition } from "react";
import { InternalTicketBoard } from "@/components/InternalTicketBoard";
import { TicketTable } from "@/components/TicketTable";
import { FilterBar } from "@/components/ui/filter-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { Ticket, Role } from "@/types/domain";

type FilterTab = "ALL" | "OPEN" | "HIGH_PRIORITY" | "ASSIGNED_TO_ME";

interface AppliedFilters {
  query: string;
  tab: FilterTab;
}

interface PaginationState {
  page: number;
  pageSize: number;
}

interface DashboardTicketExplorerProps {
  tickets: Ticket[];
  scopedExternal: boolean;
  currentUserId: string;
  role: Role;
  assignOptions: Array<{ teamId: string; teamName: string; userId: string; userLabel: string }>;
  assignedEmailByUserId: Record<string, string>;
  currentUserName?: string | null;
}

const FILTER_TABS: Array<{ id: FilterTab; label: string }> = [
  { id: "ALL", label: "All" },
  { id: "OPEN", label: "Open" },
  { id: "HIGH_PRIORITY", label: "High Priority" },
  { id: "ASSIGNED_TO_ME", label: "Assigned to Me" },
];

function matchesTabFilter(ticket: Ticket, tab: FilterTab, currentUserId: string): boolean {
  if (tab === "OPEN") {
    return ticket.status !== "CLOSED" && ticket.status !== "RESOLVED";
  }

  if (tab === "HIGH_PRIORITY") {
    return ticket.priority === "HIGH" || ticket.priority === "CRITICAL";
  }

  if (tab === "ASSIGNED_TO_ME") {
    return ticket.assigned_agent_id === currentUserId;
  }

  return true;
}

function includesQuery(ticket: Ticket, normalizedQuery: string): boolean {
  if (!normalizedQuery) {
    return true;
  }

  const searchableValues = [
    ticket.id,
    ticket.status,
    ticket.priority,
    ticket.description,
    ticket.assigned_agent_id ?? "",
  ];

  return searchableValues.some((value) => value.toLowerCase().includes(normalizedQuery));
}

export function DashboardTicketExplorer({
  tickets,
  scopedExternal,
  currentUserId,
  role,
  assignOptions,
  assignedEmailByUserId,
  currentUserName,
}: DashboardTicketExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("ALL");
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({ query: "", tab: "ALL" });
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, pageSize: 10 });
  const deferredSearch = useDeferredValue(searchQuery);
  const isDebouncing = deferredSearch !== searchQuery;
  const [isPending, startTransition] = useTransition();

  const applyFilters = useCallback(
    (nextQuery: string, nextTab: FilterTab) => {
      const normalizedQuery = nextQuery.trim().toLowerCase();
      startTransition(() => {
        setAppliedFilters((previous) => {
          if (previous.query === normalizedQuery && previous.tab === nextTab) {
            return previous;
          }
          return { query: normalizedQuery, tab: nextTab };
        });
        setPagination((previous) => (previous.page === 1 ? previous : { ...previous, page: 1 }));
      });
    },
    [],
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleApply = useCallback(() => {
    applyFilters(deferredSearch, activeFilter);
  }, [activeFilter, applyFilters, deferredSearch]);

  const handleFilterTabChange = useCallback(
    (tab: string) => {
      const selectedTab = tab as FilterTab;
      setActiveFilter((previous) => (previous === selectedTab ? previous : selectedTab));
      applyFilters(deferredSearch, selectedTab);
    },
    [applyFilters, deferredSearch],
  );

  const handleReset = useCallback(() => {
    setSearchQuery("");
    setActiveFilter("ALL");
    applyFilters("", "ALL");
  }, [applyFilters]);

  const filteredTickets = useMemo(() => tickets.filter((ticket) => {
    if (!matchesTabFilter(ticket, appliedFilters.tab, currentUserId)) {
      return false;
    }
    return includesQuery(ticket, appliedFilters.query);
  }), [appliedFilters, currentUserId, tickets]);

  const pageCount = Math.max(1, Math.ceil(filteredTickets.length / pagination.pageSize));
  const safePage = Math.min(pagination.page, pageCount);

  const visibleTickets = useMemo(() => {
    const start = (safePage - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return filteredTickets.slice(start, end);
  }, [filteredTickets, pagination.pageSize, safePage]);

  const handlePageChange = useCallback((nextPage: number) => {
    setPagination((previous) => {
      if (previous.page === nextPage) {
        return previous;
      }
      return { ...previous, page: nextPage };
    });
  }, []);

  const handlePreviousPage = useCallback(() => {
    handlePageChange(Math.max(1, safePage - 1));
  }, [handlePageChange, safePage]);

  const handleNextPage = useCallback(() => {
    handlePageChange(Math.min(pageCount, safePage + 1));
  }, [handlePageChange, pageCount, safePage]);

  const showNoResults = !isPending && !isDebouncing && filteredTickets.length === 0;

  return (
    <section className="space-y-4">
      <FilterBar
        searchPlaceholder="Search tickets by ID, status, priority, or description"
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
        filterTabs={FILTER_TABS}
        activeFilter={activeFilter}
        onFilterChange={handleFilterTabChange}
        onApply={handleApply}
        onReset={handleReset}
        isApplying={isPending || isDebouncing}
      />

      {showNoResults ? (
        <EmptyState
          title="No matching tickets"
          description="Try a different search query or reset filters to view the full queue."
        />
      ) : null}

      {filteredTickets.length > 0 ? (
        scopedExternal ? (
          <TicketTable tickets={visibleTickets} currentUserId={currentUserId} currentUserName={currentUserName} />
        ) : (
          <InternalTicketBoard
            tickets={visibleTickets}
            currentUserId={currentUserId}
            role={role}
            assignOptions={assignOptions}
            assignedEmailByUserId={assignedEmailByUserId}
            currentUserName={currentUserName}
          />
        )
      ) : null}

      {filteredTickets.length > 0 ? (
        <nav className="flex items-center justify-between gap-3 rounded-xl border border-brand-200 bg-white p-3 text-xs text-soft" aria-label="Pagination">
          <p>
            Page {safePage} of {pageCount}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-muted text-xs disabled:opacity-50"
              onClick={handlePreviousPage}
              disabled={safePage === 1}
            >
              Previous
            </button>
            <button
              type="button"
              className="btn-muted text-xs disabled:opacity-50"
              onClick={handleNextPage}
              disabled={safePage === pageCount}
            >
              Next
            </button>
          </div>
        </nav>
      ) : null}
    </section>
  );
}
