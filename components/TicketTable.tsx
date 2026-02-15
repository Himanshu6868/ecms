import { Ticket } from "@/types/domain";
import Link from "next/link";

function priorityClasses(priority: Ticket["priority"]): string {
  switch (priority) {
    case "LOW":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "MEDIUM":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "HIGH":
      return "border-orange-200 bg-orange-50 text-orange-800";
    case "CRITICAL":
      return "border-rose-200 bg-rose-50 text-rose-800";
    default:
      return "border-brand-200 bg-brand-50 text-ink-900";
  }
}

export function TicketTable({ tickets }: { tickets: Ticket[] }) {
  if (!tickets.length) {
    return (
      <section className="surface-3d p-5">
        <p className="text-soft text-sm">No tickets yet. Create one from the New Ticket page.</p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="grid gap-3 md:hidden">
        {tickets.map((ticket) => (
          <Link key={ticket.id} href={`/tickets/${ticket.id}`} className="surface-3d block border-l-4 border-l-brand-300 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="font-semibold text-brand-700">#{ticket.id.slice(0, 8)}</p>
              <p className="status-chip">{ticket.status}</p>
            </div>
            <div className="mt-2">
              <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${priorityClasses(ticket.priority)}`}>
                {ticket.priority}
              </span>
            </div>
            <p className="mt-1 text-xs text-soft">SLA: {new Date(ticket.sla_deadline).toLocaleString()}</p>
          </Link>
        ))}
      </div>

      <div className="surface hidden overflow-hidden md:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-brand-100/70 text-left">
              <th className="px-4 py-3">Ticket</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">SLA Deadline</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="border-t border-brand-100 transition-colors hover:bg-brand-50">
                <td className="px-4 py-3 font-medium text-brand-800">
                  <Link href={`/tickets/${ticket.id}`}>#{ticket.id.slice(0, 8)}</Link>
                </td>
                <td className="px-4 py-3">{ticket.status}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityClasses(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-4 py-3">{new Date(ticket.sla_deadline).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
