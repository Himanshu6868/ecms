"use client";

import { useCallback, useDeferredValue, useMemo, useState, useTransition } from "react";
import { InternalTicketBoard } from "@/components/InternalTicketBoard";
import { TicketTable } from "@/components/TicketTable";
import { FilterBar } from "@/components/ui/filter-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { Ticket, Role } from "@/types/domain";

type FilterTab = "ALL" | "OPEN" | "HIGH_PRIORITY" | "ASSIGNED_TO_ME";

interface ActiveFilters {
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

function normalizeQuery(value: string): string {
  return value.trim().toLowerCase();
}

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
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({ query: "", tab: "ALL" });
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, pageSize: 10 });
  const [selectedTab, setSelectedTab] = useState<FilterTab>("ALL");
  const [isPending, startTransition] = useTransition();
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const normalizedDeferredQuery = useMemo(
    () => normalizeQuery(deferredSearchQuery),
    [deferredSearchQuery],
  );

  const ticketSearchIndex = useMemo(() => {
    const index = new Map<string, string>();

    for (const ticket of tickets) {
      const assignedTo = ticket.assigned_agent_id
        ? (assignedEmailByUserId[ticket.assigned_agent_id] ?? ticket.assigned_agent_id)
        : "unassigned";
      const searchableContent = [ticket.id, ticket.status, ticket.priority, assignedTo].join(" ").toLowerCase();
      index.set(ticket.id, searchableContent);
    }

    return index;
  }, [assignedEmailByUserId, tickets]);

  const applyFilters = useCallback((query: string, tab: FilterTab) => {
    const normalizedQuery = normalizeQuery(query);

    startTransition(() => {
      setActiveFilters((previous) => {
        if (previous.query === normalizedQuery && previous.tab === tab) {
          return previous;
        }
        return { query: normalizedQuery, tab };
      });
      setPagination((previous) => (previous.page === 1 ? previous : { ...previous, page: 1 }));
    });
  }, []);

  const handleSearchChange = useCallback(
    (nextValue: string) => {
      setSearchQuery(nextValue);

      if (normalizeQuery(nextValue) === "") {
        applyFilters("", selectedTab);
      }
    },
    [applyFilters, selectedTab],
  );

  const handleApply = useCallback(() => {
    applyFilters(searchQuery, selectedTab);
  }, [applyFilters, searchQuery, selectedTab]);

  const handleFilterTabChange = useCallback(
    (tab: string) => {
      const nextTab = tab as FilterTab;
      setSelectedTab((previous) => (previous === nextTab ? previous : nextTab));
      applyFilters(searchQuery, nextTab);
    },
    [applyFilters, searchQuery],
  );

  const filteredTickets = useMemo(
    () =>
      tickets.filter((ticket) => {
        if (!matchesTabFilter(ticket, activeFilters.tab, currentUserId)) {
          return false;
        }

        if (!activeFilters.query) {
          return true;
        }

        const searchableContent = ticketSearchIndex.get(ticket.id);
        return searchableContent ? searchableContent.includes(activeFilters.query) : false;
      }),
    [activeFilters, currentUserId, ticketSearchIndex, tickets],
  );

  const pageCount = Math.max(1, Math.ceil(filteredTickets.length / pagination.pageSize));
  const safePage = Math.min(pagination.page, pageCount);

  const visibleTickets = useMemo(() => {
    const start = (safePage - 1) * pagination.pageSize;
    return filteredTickets.slice(start, start + pagination.pageSize);
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

  const isApplying = isPending || normalizeQuery(searchQuery) !== normalizedDeferredQuery;
  const showNoResults = !isApplying && filteredTickets.length === 0;

  return (
    <section className="space-y-4 overflow-x-hidden">
      <FilterBar
        searchPlaceholder="Search by ticket ID, status, assigned to, or priority"
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
        filterTabs={FILTER_TABS}
        activeFilter={selectedTab}
        onFilterChange={handleFilterTabChange}
        onApply={handleApply}
        isApplying={isApplying}
      />

      {showNoResults ? (
        <EmptyState
          title="No matching tickets"
          description="Try a different search term or switch filter tabs to broaden results."
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
        <nav
          className="flex items-center justify-between gap-3 rounded-xl border border-brand-200 bg-white p-3 text-xs text-soft"
          aria-label="Pagination"
        >
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
