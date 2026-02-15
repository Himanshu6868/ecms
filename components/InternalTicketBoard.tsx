"use client";

import { useMemo, useState } from "react";
import { Ticket, TicketStatus, Role } from "@/types/domain";
import Link from "next/link";

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

export function InternalTicketBoard({
  tickets,
  currentUserId,
  role,
  assignOptions,
}: {
  tickets: Ticket[];
  currentUserId: string;
  role: Role;
  assignOptions: Array<{ teamId: string; teamName: string; userId: string; userLabel: string }>;
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
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${activeTab === "all" ? "bg-brand-500 text-ink-900" : "bg-brand-100 text-ink-900"}`}
          >
            All Tickets
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("assigned")}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${activeTab === "assigned" ? "bg-brand-500 text-ink-900" : "bg-brand-100 text-ink-900"}`}
          >
            Assigned to Me
          </button>
        </div>
        {message ? <p className="text-soft text-sm">{message}</p> : null}
      </div>

      <div className="surface overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-100/70 text-left">
            <tr>
              <th className="px-4 py-3">Ticket</th>
              <th className="px-4 py-3">Current Status</th>
              <th className="px-4 py-3">Priority</th>
              {showStatusControls ? <th className="px-4 py-3">Change Status</th> : null}
              {canAssign ? <th className="px-4 py-3">Assign</th> : null}
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map((ticket) => {
              const canUpdate = role === "ADMIN" || role === "MANAGER" || role === "SENIOR_AGENT" || ticket.assigned_agent_id === currentUserId;
              return (
                <tr key={ticket.id} className="border-t border-brand-100">
                  <td className="px-4 py-3 font-medium text-brand-800">
                    <Link href={`/tickets/${ticket.id}`}>#{ticket.id.slice(0, 8)}</Link>
                  </td>
                  <td className="px-4 py-3">{ticket.status}</td>
                  <td className="px-4 py-3">{ticket.priority}</td>
                  {showStatusControls ? (
                    <td className="px-4 py-3">
                      <div className="flex flex-nowrap items-center justify-center gap-2">
                        <select
                          className="input-clean !w-52 shrink-0 py-1 text-sm"
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
                          className="btn-brand w-24 px-3 py-1.5 text-sm text-center"
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
                      <div className="flex flex-nowrap items-center justify-center gap-2">
                        <select
                          className="input-clean !w-52 shrink-0 py-1 text-sm"
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
                        <button
                          type="button"
                          className="btn-muted w-24 px-3 py-1.5 text-sm text-center"
                          onClick={() => assignTicket(ticket.id)}
                        >
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
    </section>
  );
}
