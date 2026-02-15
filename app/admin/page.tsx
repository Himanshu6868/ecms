import { auth } from "@/lib/auth";
import { canViewAdmin } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { dbQuery, supabase } from "@/lib/db";

interface Analytics {
  status: string;
  count: number;
}

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (!canViewAdmin(session.user.role)) {
    redirect("/dashboard");
  }

  const analytics = await dbQuery<Analytics[]>(() => supabase.rpc("ticket_status_analytics"));
  const ticketMetrics = analytics.error ? [] : analytics.data;

  return (
    <main className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-[var(--text-muted)]">Monitor routing rules, SLA coverage, and ticket status trends.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-[var(--border-soft)] bg-[var(--brand-green-soft)] p-5">
          <h2 className="font-semibold">SLA Rules</h2>
          <p className="mt-2 text-sm text-zinc-700">Priority-based SLA is enforced server-side in the ticket service.</p>
        </article>
        <article className="rounded-2xl border border-[var(--border-soft)] bg-white p-5">
          <h2 className="font-semibold">Area Mappings</h2>
          <p className="mt-2 text-sm text-zinc-700">Zone routing is managed via areas.zone_code and teams.area_id.</p>
        </article>
      </section>

      <section className="rounded-2xl border border-[var(--border-soft)] bg-white p-5">
        <h2 className="mb-4 font-semibold">Ticket Analytics</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-soft)] text-left text-zinc-600">
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Count</th>
              </tr>
            </thead>
            <tbody>
              {ticketMetrics.map((item) => (
                <tr key={item.status} className="border-b border-[var(--border-soft)] last:border-b-0">
                  <td className="px-3 py-3 font-medium">{item.status}</td>
                  <td className="px-3 py-3">{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
