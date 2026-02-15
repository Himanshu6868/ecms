import { auth } from "@/lib/auth";
import { canViewAdmin } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { dbQuery, supabase } from "@/lib/db";
import { AdminCockpit } from "@/components/AdminCockpit";

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
  const [ticketCount, userCount, openTicketCount] = await Promise.all([
    supabase.from("tickets").select("*", { head: true, count: "exact" }),
    supabase.from("users").select("*", { head: true, count: "exact" }),
    supabase.from("tickets").select("*", { head: true, count: "exact" }).in("status", ["CREATED", "ASSIGNED", "IN_PROGRESS", "SLA_BREACHED", "ESCALATED", "REASSIGNED", "REOPENED"]),
  ]);

  return (
    <main>
      <AdminCockpit
        analytics={analytics.error ? [] : analytics.data}
        totalTickets={ticketCount.count ?? 0}
        totalUsers={userCount.count ?? 0}
        openTickets={openTicketCount.count ?? 0}
      />
    </main>
  );
}
