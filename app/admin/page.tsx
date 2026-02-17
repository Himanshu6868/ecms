import { auth } from "@/lib/auth";
import { canViewAdmin } from "@/lib/rbac";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { dbQuery, supabase } from "@/lib/db";
import { AdminCockpit } from "@/components/AdminCockpit";
import { AdminUserCreator } from "@/components/AdminUserCreator";
import { AdminUsersTable } from "@/components/AdminUsersTable";

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

  const managers = session.user.role === "ADMIN"
    ? await dbQuery<Array<{ id: string; name: string; email: string }>>(() =>
        supabase.from("users").select("id, name, email").eq("role", "MANAGER").is("deleted_at", null).order("name", { ascending: true }),
      )
    : { data: [], error: null as null };

  const superAdmins = session.user.role === "ADMIN"
    ? await dbQuery<Array<{ id: string; name: string; email: string }>>(() =>
        supabase.from("users").select("id, name, email").eq("role", "ADMIN").is("deleted_at", null).order("name", { ascending: true }),
      )
    : { data: [], error: null as null };

  const allUsers = session.user.role === "ADMIN"
    ? await dbQuery<Array<{ id: string; name: string; email: string; role: string; created_at: string }>>(() =>
        supabase.from("users").select("id, name, email, role, created_at").is("deleted_at", null).order("created_at", { ascending: false }),
      )
    : { data: [], error: null as null };

  return (
    <main className="mx-auto w-full max-w-[1400px] px-2 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4">
      <div className="mb-4">
        <Link href="/dashboard" className="group inline-flex items-center gap-2 rounded-xl bg-bg-elevated px-4 py-2 text-sm font-semibold text-ink-900">
          <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
          Back to Dashboard
        </Link>
      </div>
      {session.user.role === "ADMIN" ? (
        <AdminUserCreator
          managers={managers.error ? [] : managers.data}
          superAdmins={superAdmins.error ? [] : superAdmins.data}
        />
      ) : null}
      <AdminCockpit
        analytics={analytics.error ? [] : analytics.data}
        totalTickets={ticketCount.count ?? 0}
        totalUsers={userCount.count ?? 0}
        openTickets={openTicketCount.count ?? 0}
      />
      {session.user.role === "ADMIN" ? <AdminUsersTable users={allUsers.error ? [] : allUsers.data} /> : null}
    </main>
  );
}
