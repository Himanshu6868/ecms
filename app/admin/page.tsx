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

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin Panel</h1>
      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded border bg-white p-4">
          <h2 className="font-semibold">SLA Rules</h2>
          <p className="text-sm text-zinc-600">Priority-based SLA is enforced server-side in ticket service.</p>
        </article>
        <article className="rounded border bg-white p-4">
          <h2 className="font-semibold">Area Mappings</h2>
          <p className="text-sm text-zinc-600">Zone routing is managed via areas.zone_code and teams.area_id.</p>
        </article>
      </section>
      <section className="rounded border bg-white p-4">
        <h2 className="mb-3 font-semibold">Ticket Analytics</h2>
        <ul className="space-y-2 text-sm">
          {(analytics.error ? [] : analytics.data).map((item) => (
            <li key={item.status} className="flex justify-between border-b pb-1">
              <span>{item.status}</span>
              <span>{item.count}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
