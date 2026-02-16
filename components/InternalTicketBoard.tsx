"use client";

import { useMemo, useState } from "react";
import { Ticket, TicketStatus, Role } from "@/types/domain";
import Link from "next/link";
import { TicketChatModal } from "@/components/TicketChatModal";
import { TicketDetailsModal } from "@/components/TicketDetailsModal";
import { EmptyState } from "@/components/ui/empty-state";

const agentStatuses: TicketStatus[] = ["IN_PROGRESS", "RESOLVED", "CLOSED", "REOPENED"];
const managerStatuses: TicketStatus[] = ["ASSIGNED", "IN_PROGRESS", "RESOLVED", "REOPENED", "CLOSED", "SLA_BREACHED", "ESCALATED", "REASSIGNED"];
const allStatuses: TicketStatus[] = ["DRAFT", "OTP_VERIFIED", "CREATED", "ASSIGNED", "IN_PROGRESS", "SLA_BREACHED", "ESCALATED", "REASSIGNED", "RESOLVED", "REOPENED", "CLOSED"];

function allowedStatuses(role: Role): TicketStatus[] {
  if (role === "ADMIN") {
    return allStatuses;
  }
  if (role === "MANAGER" || role === "SENIOR_AGENT") {
    return managerStatuses;
  }
  return agentStatuses;
}

function priorityBadgeClass(priority: Ticket["priority"]) {
  if (priority === "CRITICAL" || priority === "HIGH") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }
  if (priority === "MEDIUM") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

export function InternalTicketBoard({
  tickets,
  currentUserId,
  role,
  assignOptions,
  assignedEmailByUserId,
  currentUserName,
}: {
  tickets: Ticket[];
  currentUserId: string;
  role: Role;
  assignOptions: Array<{ teamId: string; teamName: string; userId: string; userLabel: string }>;
  assignedEmailByUserId: Record<string, string>;
  currentUserName?: string | null;
}) {
  const [activeTab, setActiveTab] = useState<"all" | "assigned">("all");
  const [statusValues, setStatusValues] = useState<Record<string, TicketStatus>>({});
  const [assignValues, setAssignValues] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  const filteredTickets = useMemo(() => {
    if (activeTab === "assigned") {
      return tickets.filter((ticket) => ticket.assigned_agent_id === currentUserId);
    }
    return tickets;
  }, [activeTab, tickets, currentUserId]);

  const statuses = allowedStatuses(role);
  const showStatusControls = role !== "AGENT" || activeTab === "assigned";

  async function updateStatus(ticketId: string) {
    const status = statusValues[ticketId];
    if (!status) {
      setMessage("Choose a status first.");
      return;
    }

    const res = await fetch(`/api/tickets/${ticketId}/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const payload = (await res.json()) as { error?: string };
    if (!res.ok) {
      setMessage(payload.error ?? "Unable to update status.");
      return;
    }
    setMessage("Status updated.");
    window.location.reload();
  }

  async function assignTicket(ticketId: string) {
    const value = assignValues[ticketId];
    if (!value) {
      setMessage("Choose a team member first.");
      return;
    }

    const [teamId, agentId] = value.split("|");
    const res = await fetch(`/api/tickets/${ticketId}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId, agentId }),
    });
    const payload = (await res.json()) as { error?: string };
    if (!res.ok) {
      setMessage(payload.error ?? "Unable to assign ticket.");
      return;
    }
    setMessage("Ticket assigned.");
    window.location.reload();
  }

  const canAssign = role === "MANAGER" || role === "ADMIN";

  return (
    <section className="min-w-0 max-w-full space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${activeTab === "all" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"}`}
          >
            All Tickets
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("assigned")}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${activeTab === "assigned" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"}`}
          >
            Assigned to Me
          </button>
        </div>
        {message ? <p className="text-sm text-soft">{message}</p> : null}
      </div>

      {!filteredTickets.length ? <EmptyState title="No tickets in this queue" description="Adjust filters or wait for new assignments." /> : null}

      {filteredTickets.length ? (
        <div className="max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="theme-scrollbar h-[clamp(280px,calc(100vh-22rem),540px)] w-full max-w-full overflow-auto overscroll-contain">
            <table className="w-max min-w-[1080px] border-collapse text-sm text-slate-700">
              <thead className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/95 text-left backdrop-blur supports-[backdrop-filter]:bg-slate-50/80">
                <tr>
                  <th className="px-4 py-3 font-medium uppercase tracking-wide text-slate-500">Ticket ID</th>
                  <th className="px-4 py-3 font-medium uppercase tracking-wide text-slate-500">Current Status</th>
                  <th className="px-4 py-3 font-medium uppercase tracking-wide text-slate-500">Priority</th>
                  <th className="px-4 py-3 font-medium uppercase tracking-wide text-slate-500">Assigned To</th>
                  <th className="px-4 py-3 font-medium uppercase tracking-wide text-slate-500">Details</th>
                  <th className="px-4 py-3 font-medium uppercase tracking-wide text-slate-500">Chat</th>
                  {showStatusControls ? <th className="px-4 py-3 font-medium uppercase tracking-wide text-slate-500">Change Status</th> : null}
                  {canAssign ? <th className="px-4 py-3 font-medium uppercase tracking-wide text-slate-500">Assign</th> : null}
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => {
                  const canUpdate = role === "ADMIN" || role === "MANAGER" || role === "SENIOR_AGENT" || ticket.assigned_agent_id === currentUserId;
                  return (
                    <tr key={ticket.id} className="border-t border-slate-100 bg-white hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        <Link href={`/tickets/${ticket.id}`} className="hover:underline">#{ticket.id.slice(0, 8)}</Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{ticket.status.replaceAll("_", " ")}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityBadgeClass(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="max-w-[300px] truncate px-4 py-3 text-slate-600">
                        {ticket.assigned_agent_id ? assignedEmailByUserId[ticket.assigned_agent_id] ?? "Assigned user" : "Unassigned"}
                      </td>
                      <td className="px-4 py-3">
                        <TicketDetailsModal ticketId={ticket.id} description={ticket.description} />
                      </td>
                      <td className="px-4 py-3">
                        <TicketChatModal ticketId={ticket.id} currentUserId={currentUserId} currentUserName={currentUserName} />
                      </td>
                      {showStatusControls ? (
                        <td className="px-4 py-3">
                          <div className="flex flex-nowrap items-center gap-2">
                            <select
                              className="input-clean !w-52 shrink-0 border-slate-200 py-1.5 text-sm"
                              value={statusValues[ticket.id] ?? ""}
                              onChange={(event) => setStatusValues((prev) => ({ ...prev, [ticket.id]: event.target.value as TicketStatus }))}
                              disabled={!canUpdate}
                            >
                              <option value="">Select status</option>
                              {statuses.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              className="w-24 rounded-lg border border-slate-900 bg-slate-900 px-3 py-1.5 text-center text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                              disabled={!canUpdate}
                              onClick={() => updateStatus(ticket.id)}
                            >
                              Update
                            </button>
                          </div>
                        </td>
                      ) : null}
                      {canAssign ? (
                        <td className="px-4 py-3">
                          <div className="flex flex-nowrap items-center gap-2">
                            <select
                              className="input-clean !w-52 shrink-0 border-slate-200 py-1.5 text-sm"
                              value={assignValues[ticket.id] ?? ""}
                              onChange={(event) => setAssignValues((prev) => ({ ...prev, [ticket.id]: event.target.value }))}
                            >
                              <option value="">Select member</option>
                              {assignOptions.map((option) => (
                                <option key={`${option.teamId}-${option.userId}`} value={`${option.teamId}|${option.userId}`}>
                                  {option.userLabel} - {option.teamName}
                                </option>
                              ))}
                            </select>
                            <button type="button" className="w-24 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50" onClick={() => assignTicket(ticket.id)}>
                              Assign
                            </button>
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </section>
  );
}
