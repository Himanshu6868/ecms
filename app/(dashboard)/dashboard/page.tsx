import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { dbQuery, supabase } from "@/lib/db";
import { Ticket } from "@/types/domain";
import { TicketTable } from "@/components/TicketTable";
import { FadeIn, HoverLift } from "@/components/ui/motion";
import { InternalTicketBoard } from "@/components/InternalTicketBoard";
import { canAssignTicket } from "@/lib/rbac";

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

      {scopedExternal ? (
        <TicketTable tickets={tickets} />
      ) : (
        <InternalTicketBoard
          tickets={tickets}
          currentUserId={session.user.id}
          role={session.user.role}
          assignOptions={assignOptions}
        />
      )}
    </main>
  );
}
