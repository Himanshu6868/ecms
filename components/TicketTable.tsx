import { Ticket } from "@/types/domain";
import Link from "next/link";
import { TicketChatModal } from "@/components/TicketChatModal";
import { EmptyState } from "@/components/ui/empty-state";

function priorityClasses(priority: Ticket["priority"]): string {
  switch (priority) {
    case "LOW":
      return "border-success-600/20 bg-success-100 text-success-600";
    case "MEDIUM":
      return "border-warning-600/20 bg-warning-100 text-warning-600";
    case "HIGH":
      return "border-orange-200 bg-orange-50 text-orange-800";
    case "CRITICAL":
      return "border-error-600/20 bg-error-100 text-error-600";
    default:
      return "border-brand-200 bg-brand-50 text-ink-900";
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
          <div key={ticket.id} className="surface-muted border-l-4 border-l-brand-400 p-4">
            <div className="flex items-start justify-between gap-3">
              <Link href={`/tickets/${ticket.id}`} className="font-semibold text-ink-900">
                #{ticket.id.slice(0, 8)}
              </Link>
              <p className="status-chip">{ticket.status}</p>
            </div>
            <div className="mt-2">
              <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${priorityClasses(ticket.priority)}`}>
                {ticket.priority}
              </span>
            </div>
            <p className="mt-1 text-xs text-soft">SLA: {new Date(ticket.sla_deadline).toLocaleString()}</p>
            <div className="mt-2">
              <TicketChatModal ticketId={ticket.id} currentUserId={currentUserId} currentUserName={currentUserName} />
            </div>
          </div>
        ))}
      </div>

      <div className="surface hidden overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-brand-100/70 text-left text-ink-700">
                <th className="px-4 py-3 font-semibold">Ticket</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Priority</th>
                <th className="px-4 py-3 font-semibold">SLA Deadline</th>
                <th className="px-4 py-3 font-semibold">Chat</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="border-t border-brand-100 transition-colors hover:bg-brand-50/70">
                  <td className="px-4 py-3 font-medium text-ink-900">
                    <Link href={`/tickets/${ticket.id}`} className="hover:underline">#{ticket.id.slice(0, 8)}</Link>
                  </td>
                  <td className="px-4 py-3 text-ink-700">{ticket.status}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityClasses(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-700">{new Date(ticket.sla_deadline).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <TicketChatModal ticketId={ticket.id} currentUserId={currentUserId} currentUserName={currentUserName} />
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
