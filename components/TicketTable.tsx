import { Ticket } from "@/types/domain";

export function TicketTable({ tickets }: { tickets: Ticket[] }) {
  return (
    <table className="w-full border-collapse rounded border text-sm">
      <thead>
        <tr className="bg-zinc-100 text-left">
          <th className="p-2">ID</th>
          <th className="p-2">Status</th>
          <th className="p-2">Priority</th>
          <th className="p-2">SLA Deadline</th>
        </tr>
      </thead>
      <tbody>
        {tickets.map((ticket) => (
          <tr key={ticket.id} className="border-t">
            <td className="p-2">{ticket.id.slice(0, 8)}</td>
            <td className="p-2">{ticket.status}</td>
            <td className="p-2">{ticket.priority}</td>
            <td className="p-2">{new Date(ticket.sla_deadline).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
