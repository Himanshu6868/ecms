import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canAssignTicket } from "@/lib/rbac";
import { dbQuery, supabase } from "@/lib/db";
import { Ticket } from "@/types/domain";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canAssignTicket(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as { agentId: string | null; teamId: string | null };
  if (!body.teamId) {
    return NextResponse.json({ error: "teamId is required" }, { status: 400 });
  }

  if (session.user.role === "MANAGER") {
    const managerMembership = await dbQuery<{ user_id: string; team_id: string }>(() =>
      supabase.from("team_members").select("user_id, team_id").eq("user_id", session.user.id).eq("team_id", body.teamId).single(),
    );
    if (managerMembership.error) {
      return NextResponse.json({ error: "Managers can assign only inside their team" }, { status: 403 });
    }
  }

  if (body.agentId) {
    const assigneeMembership = await dbQuery<{ user_id: string; team_id: string }>(() =>
      supabase.from("team_members").select("user_id, team_id").eq("user_id", body.agentId).eq("team_id", body.teamId).single(),
    );
    if (assigneeMembership.error) {
      return NextResponse.json({ error: "Selected member is not part of the target team" }, { status: 400 });
    }
  }

  const routeParams = await params;
  const result = await dbQuery<Ticket>(() =>
    supabase
      .from("tickets")
      .update({ assigned_agent_id: body.agentId, assigned_team_id: body.teamId, status: "ASSIGNED" })
      .eq("id", routeParams.id)
      .select("*")
      .single(),
  );
  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 400 });
  }
  return NextResponse.json(result.data);
}
