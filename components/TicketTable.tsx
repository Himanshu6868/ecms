import { Ticket } from "@/types/domain";
import Link from "next/link";
import { TicketChatModal } from "@/components/TicketChatModal";
import { TicketDetailsModal } from "@/components/TicketDetailsModal";
import { EmptyState } from "@/components/ui/empty-state";

function priorityClasses(priority: Ticket["priority"]): string {
  switch (priority) {
    case "LOW":
      return "border-emerald-400/50 bg-emerald-500/10 text-emerald-300";
    case "MEDIUM":
      return "border-sky-400/50 bg-sky-500/10 text-sky-300";
    case "HIGH":
      return "border-amber-400/60 bg-amber-500/10 text-amber-200";
    case "CRITICAL":
      return "border-rose-400/60 bg-rose-500/15 text-rose-200";
    default:
      return "border-border-subtle bg-bg-surface/80 text-text-primary";
  }
}

export function TicketTable({
  tickets,
  currentUserId,
  currentUserName,
}: {
  tickets: Ticket[];
  currentUserId: string;
  currentUserName?: string | null;
}) {
  if (!tickets.length) {
    return <EmptyState title="No tickets found" description="You have no active tickets in this scope. Create a new ticket to begin escalation tracking." />;
  }

  return (
    <section className="space-y-4">
      <div className="grid gap-3 md:hidden">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="surface-muted border-l-4 border-l-primary p-4">
            <div className="flex items-start justify-between gap-3">
              <Link href={`/tickets/${ticket.id}`} className="text-card-title text-text-primary">
                #{ticket.id.slice(0, 8)}
              </Link>
              <p className="status-chip">{ticket.status}</p>
            </div>
            <div className="mt-2">
              <span className={`inline-flex rounded-full border px-2 py-1 text-label ${priorityClasses(ticket.priority)}`}>
                {ticket.priority}
              </span>
            </div>
            <p className="mt-1 text-meta text-soft">SLA: {new Date(ticket.sla_deadline).toLocaleString()}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <TicketDetailsModal ticket={ticket} assignedTo={ticket.assigned_agent_id ? (ticket.assigned_agent_id) : "Unassigned"} />
              <TicketChatModal ticketId={ticket.id} currentUserId={currentUserId} currentUserName={currentUserName} ticketStatus={ticket.status} />
            </div>
          </div>
        ))}
      </div>

      <div className="table-surface hidden overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="text-body w-full border-collapse">
            <thead>
              <tr className="table-head text-left text-text-secondary">
                <th className="px-4 py-3 text-table-header">Ticket</th>
                <th className="px-4 py-3 text-table-header">Status</th>
                <th className="px-4 py-3 text-table-header">Priority</th>
                <th className="px-4 py-3 text-table-header">SLA Deadline</th>
                <th className="px-4 py-3 text-table-header">Details</th>
                <th className="px-4 py-3 text-table-header">Chat</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="table-row transition-colors">
                  <td className="text-label px-4 py-3 text-text-primary">
                    <Link href={`/tickets/${ticket.id}`} className="hover:underline">#{ticket.id.slice(0, 8)}</Link>
                  </td>
                  <td className="text-body px-4 py-3 text-text-secondary">{ticket.status}</td>
                  <td className="px-4 py-3">
                    <span className={`text-label inline-flex rounded-full border px-2.5 py-1 ${priorityClasses(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="text-body px-4 py-3 text-text-secondary">{new Date(ticket.sla_deadline).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <TicketDetailsModal ticket={ticket} assignedTo={ticket.assigned_agent_id ? (ticket.assigned_agent_id) : "Unassigned"} />
                  </td>
                  <td className="px-4 py-3">
                    <TicketChatModal ticketId={ticket.id} currentUserId={currentUserId} currentUserName={currentUserName} ticketStatus={ticket.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
