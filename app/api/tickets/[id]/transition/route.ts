import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canManageTicket, canTransitionTicketTo } from "@/lib/rbac";
import { dbQuery, supabase } from "@/lib/db";
import { transitionTicket } from "@/lib/ticketService";
import { ticketTransitionSchema } from "@/lib/validations";
import { Ticket } from "@/types/domain";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canManageTicket(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = ticketTransitionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  if (!canTransitionTicketTo(session.user.role, parsed.data.status)) {
    return NextResponse.json({ error: "Insufficient permissions for requested status change" }, { status: 403 });
  }

  try {
    const routeParams = await params;
    const ticketLookup = await dbQuery<Ticket>(() =>
      supabase.from("tickets").select("*").eq("id", routeParams.id).single(),
    );
    if (ticketLookup.error) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    if (session.user.role === "AGENT" && ticketLookup.data.assigned_agent_id !== session.user.id) {
      return NextResponse.json({ error: "Members can change status only for tickets assigned to them" }, { status: 403 });
    }

    const ticket = await transitionTicket(routeParams.id, parsed.data.status, { force: session.user.role === "ADMIN" });
    return NextResponse.json(ticket);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 400 });
  }
}
