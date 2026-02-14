import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canManageTicket } from "@/lib/rbac";
import { dbQuery, supabase } from "@/lib/db";
import { Ticket } from "@/types/domain";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canManageTicket(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as { agentId: string | null; teamId: string | null };
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
