import { redirect } from "next/navigation";
import { AlertTriangle, FolderKanban, FolderOpen } from "lucide-react";
import { auth } from "@/lib/auth";
import { dbQuery, supabase } from "@/lib/db";
import { Ticket } from "@/types/domain";
import { FadeIn } from "@/components/ui/motion";
import { canAssignTicket } from "@/lib/rbac";
import { KpiCard } from "@/components/ui/kpi-card";
import { DashboardTicketExplorer } from "@/components/DashboardTicketExplorer";

function isExternalScoped(role: string, isInternal: boolean): boolean {
  if (role === "CUSTOMER") {
    return true;
  }
  if (role === "AGENT") {
    return !isInternal;
  }
  return !isInternal;
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const query = supabase.from("tickets").select("*").order("created_at", { ascending: false }).limit(20);
  const guarded = isExternalScoped(session.user.role, session.user.isInternal)
    ? query.or(`customer_id.eq.${session.user.id},created_by.eq.${session.user.id}`)
    : query;

  const result = await dbQuery<Ticket[]>(() => guarded);
  const tickets = result.error ? [] : result.data;
  const openCount = tickets.filter((ticket) => !["CLOSED", "RESOLVED"].includes(ticket.status)).length;
  const highPriority = tickets.filter((ticket) => ["HIGH", "CRITICAL"].includes(ticket.priority)).length;
  const scopedExternal = isExternalScoped(session.user.role, session.user.isInternal);

  const assignedAgentIds = Array.from(
    new Set(
      tickets
        .map((ticket) => ticket.assigned_agent_id)
        .filter((id): id is string => Boolean(id)),
    ),
  );
  const assignedUsersResult = assignedAgentIds.length
    ? await dbQuery<Array<{ id: string; email: string }>>(() =>
        supabase.from("users").select("id, email").in("id", assignedAgentIds),
      )
    : { data: [] as Array<{ id: string; email: string }>, error: null as null };
  const assignedEmailByUserId = new Map(
    (assignedUsersResult.error ? [] : assignedUsersResult.data).map((user) => [user.id, user.email]),
  );

  let assignOptions: Array<{ teamId: string; teamName: string; userId: string; userLabel: string }> = [];
  if (!scopedExternal && canAssignTicket(session.user.role)) {
    const managerTeams = session.user.role === "MANAGER"
      ? await dbQuery<Array<{ team_id: string }>>(() =>
          supabase.from("team_members").select("team_id").eq("user_id", session.user.id),
        )
      : null;

    const allowedTeamIds = managerTeams && !managerTeams.error
      ? managerTeams.data.map((entry) => entry.team_id)
      : [];

    if (session.user.role === "MANAGER" && allowedTeamIds.length === 0) {
      assignOptions = [];
    } else {
      const teamMembers = await dbQuery<Array<{ team_id: string; user_id: string }>>(() =>
        session.user.role === "MANAGER"
          ? supabase.from("team_members").select("team_id, user_id").in("team_id", allowedTeamIds)
          : supabase.from("team_members").select("team_id, user_id"),
      );

      const teams = await dbQuery<Array<{ id: string; name: string }>>(() =>
        session.user.role === "MANAGER"
          ? supabase.from("teams").select("id, name").in("id", allowedTeamIds)
          : supabase.from("teams").select("id, name"),
      );

      const users = await dbQuery<Array<{ id: string; name: string; email: string; role: string }>>(() =>
        supabase.from("users").select("id, name, email, role").in("role", ["AGENT", "SENIOR_AGENT", "MANAGER", "ADMIN"]),
      );

      if (!teamMembers.error && !teams.error && !users.error) {
        const teamNameById = new Map(teams.data.map((team) => [team.id, team.name]));
        const userById = new Map(users.data.map((user) => [user.id, user]));
        assignOptions = teamMembers.data
          .map((member) => {
            const user = userById.get(member.user_id);
            const teamName = teamNameById.get(member.team_id);
            if (!user || !teamName) {
              return null;
            }
            return {
              teamId: member.team_id,
              teamName,
              userId: member.user_id,
              userLabel: `${user.name} (${user.role})`,
            };
          })
          .filter((item): item is { teamId: string; teamName: string; userId: string; userLabel: string } => Boolean(item));
      }
    }
  }

  return (
    <main className="space-y-6">
      <FadeIn className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-page-title">Dashboard</h1>
          <p className="mt-1 text-sm text-soft">Role: {session.user.role}</p>
        </div>
        <div className="status-chip inline-flex">Live queue: last 20 tickets</div>
      </FadeIn>

      <section className="grid gap-3 sm:grid-cols-3">
        <KpiCard label="Total tickets" value={tickets.length} trend="Across your scoped queue" icon={FolderKanban} />
        <KpiCard label="Open workload" value={openCount} trend="Active operational demand" icon={FolderOpen} />
        <KpiCard label="High priority" value={highPriority} trend="Needs immediate action" icon={AlertTriangle} />
      </section>

      <DashboardTicketExplorer
        tickets={tickets}
        scopedExternal={scopedExternal}
        currentUserId={session.user.id}
        role={session.user.role}
        assignOptions={assignOptions}
        assignedEmailByUserId={Object.fromEntries(assignedEmailByUserId)}
        currentUserName={session.user.name}
      />
    </main>
  );
}
