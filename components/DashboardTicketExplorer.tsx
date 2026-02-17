"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState, useTransition } from "react";
import { InternalTicketBoard } from "@/components/InternalTicketBoard";
import { TicketTable } from "@/components/TicketTable";
import { FilterBar } from "@/components/ui/filter-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { Ticket, Role } from "@/types/domain";

type FilterTab = "ALL" | "OPEN" | "HIGH_PRIORITY" | "ASSIGNED_TO_ME";

interface AppliedFilters {
  tab: FilterTab;
  query: string;
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

const FILTER_TAB_IDS = new Set<FilterTab>(FILTER_TABS.map((tab) => tab.id));

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


function normalizeSearchQuery(value: string): string {
  return value.trim().toLowerCase();
}

function buildTicketSearchIndex(ticket: Ticket, assignedTo: string): string {
  return [ticket.id, ticket.status, ticket.priority, assignedTo]
    .join(" ")
    .toLowerCase();
}

export interface TicketSearchApiParamsInput {
  searchQuery: string;
  tab: FilterTab;
  page: number;
  pageSize: number;
}

export function buildTicketSearchApiParams(input: TicketSearchApiParamsInput): URLSearchParams {
  const params = new URLSearchParams({
    page: String(input.page),
    pageSize: String(input.pageSize),
    tab: input.tab,
  });

  const query = normalizeSearchQuery(input.searchQuery);
  if (query) {
    params.set("q", query);
    params.set("fields", "ticketId,status,assignedTo,priority");
  }

  return params;
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
  const [activeFilters, setActiveFilters] = useState<AppliedFilters>({ tab: "ALL", query: "" });
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, pageSize: 10 });
  const deferredQuery = useDeferredValue(activeFilters.query);
  const isDebouncing = deferredQuery !== activeFilters.query;
  const [isPending, startTransition] = useTransition();

  const applyFilters = useCallback((nextQuery: string, nextTab: FilterTab) => {
    const normalizedQuery = normalizeSearchQuery(nextQuery);
    startTransition(() => {
      setActiveFilters((previous) => {
        if (previous.query === normalizedQuery && previous.tab === nextTab) {
          return previous;
        }
        return { tab: nextTab, query: normalizedQuery };
      });
      setPagination((previous) => (previous.page === 1 ? previous : { ...previous, page: 1 }));
    });
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  useEffect(() => {
    if (normalizeSearchQuery(searchQuery) === "" && activeFilters.query !== "") {
      applyFilters("", activeFilters.tab);
    }
  }, [activeFilters.query, activeFilters.tab, applyFilters, searchQuery]);

  const handleApply = useCallback(() => {
    applyFilters(searchQuery, activeFilters.tab);
  }, [activeFilters.tab, applyFilters, searchQuery]);

  const handleFilterTabChange = useCallback(
    (tab: string) => {
      if (!FILTER_TAB_IDS.has(tab as FilterTab)) {
        return;
      }

      applyFilters(activeFilters.query, tab as FilterTab);
    },
    [activeFilters.query, applyFilters],
  );

  const searchIndexByTicketId = useMemo(() => {
    return new Map(
      tickets.map((ticket) => {
        const assignedTo = assignedEmailByUserId[ticket.assigned_agent_id ?? ""] ?? ticket.assigned_agent_id ?? "";
        return [ticket.id, buildTicketSearchIndex(ticket, assignedTo)] as const;
      }),
    );
  }, [assignedEmailByUserId, tickets]);

  const filteredTickets = useMemo(
    () => tickets.filter((ticket) => {
      if (!matchesTabFilter(ticket, activeFilters.tab, currentUserId)) {
        return false;
      }

      if (!deferredQuery) {
        return true;
      }

      return (searchIndexByTicketId.get(ticket.id) ?? "").includes(deferredQuery);
    }),
    [activeFilters.tab, currentUserId, deferredQuery, searchIndexByTicketId, tickets],
  );

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
        searchPlaceholder="Search tickets by ID, status, priority, or assigned user"
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
        filterTabs={FILTER_TABS}
        activeFilter={activeFilters.tab}
        onFilterChange={handleFilterTabChange}
        onApply={handleApply}
        isApplying={isPending || isDebouncing}
      />

      {showNoResults ? (
        <EmptyState
          title="No matching tickets"
          description="Try a different search query or adjust filters to view the queue."
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
        <nav className="text-meta flex items-center justify-between gap-3 rounded-xl border border-brand-200 bg-bg-elevated p-3 text-soft" aria-label="Pagination">
          <p>
            Page {safePage} of {pageCount}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-muted text-label disabled:opacity-50"
              onClick={handlePreviousPage}
              disabled={safePage === 1}
            >
              Previous
            </button>
            <button
              type="button"
              className="btn-muted text-label disabled:opacity-50"
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
