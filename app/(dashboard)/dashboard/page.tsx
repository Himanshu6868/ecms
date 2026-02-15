import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { dbQuery, supabase } from "@/lib/db";
import { Ticket } from "@/types/domain";
import { TicketTable } from "@/components/TicketTable";
import { FadeIn, HoverLift } from "@/components/ui/motion";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const query = supabase.from("tickets").select("*").order("created_at", { ascending: false }).limit(20);
  const guarded = session.user.role === "CUSTOMER" ? query.eq("customer_id", session.user.id) : query;

  const result = await dbQuery<Ticket[]>(() => guarded);
  const tickets = result.error ? [] : result.data;
  const openCount = tickets.filter((ticket) => !["CLOSED", "RESOLVED"].includes(ticket.status)).length;
  const highPriority = tickets.filter((ticket) => ["HIGH", "CRITICAL"].includes(ticket.priority)).length;

  return (
    <main className="space-y-6">
      <FadeIn className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="[font-family:var(--font-space)] text-2xl font-semibold tracking-tight md:text-3xl">Dashboard</h1>
          <p className="text-soft text-sm">Role: {session.user.role}</p>
        </div>
        <div className="status-chip inline-flex">Last 20 tickets</div>
      </FadeIn>

      <section className="grid gap-3 sm:grid-cols-3">
        <HoverLift className="surface-3d p-4">
          <p className="text-soft text-xs uppercase">Total Tickets</p>
          <p className="mt-2 text-2xl font-semibold">{tickets.length}</p>
        </HoverLift>
        <HoverLift className="surface-3d p-4">
          <p className="text-soft text-xs uppercase">Open Workload</p>
          <p className="mt-2 text-2xl font-semibold">{openCount}</p>
        </HoverLift>
        <HoverLift className="surface-3d p-4">
          <p className="text-soft text-xs uppercase">High Priority</p>
          <p className="mt-2 text-2xl font-semibold">{highPriority}</p>
        </HoverLift>
      </section>

      <TicketTable tickets={tickets} />
    </main>
  );
}
