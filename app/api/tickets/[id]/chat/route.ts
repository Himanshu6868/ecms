import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { chatMessageSchema, paginationSchema } from "@/lib/validations";
import { dbQuery, supabase } from "@/lib/db";
import { ChatMessage, Ticket } from "@/types/domain";

type ChatTicket = Pick<Ticket, "customer_id" | "created_by" | "assigned_agent_id">;

function canUseChat(ticket: ChatTicket, userId: string): boolean {
  return (
    ticket.customer_id === userId ||
    ticket.created_by === userId ||
    ticket.assigned_agent_id === userId
  );
}

async function loadTicketForChat(ticketId: string): Promise<ChatTicket | null> {
  const ticketResult = await dbQuery<ChatTicket>(() =>
    supabase.from("tickets").select("customer_id, created_by, assigned_agent_id").eq("id", ticketId).single(),
  );
  if (ticketResult.error) {
    return null;
  }
  return ticketResult.data;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const routeParams = await params;
  const ticket = await loadTicketForChat(routeParams.id);
  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }
  if (!canUseChat(ticket, session.user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const pager = paginationSchema.parse({ page: url.searchParams.get("page"), pageSize: url.searchParams.get("pageSize") });
  const from = (pager.page - 1) * pager.pageSize;
  const to = from + pager.pageSize - 1;

  const result = await dbQuery<ChatMessage[]>(() =>
    supabase.from("chat_messages").select("*").eq("ticket_id", routeParams.id).order("created_at", { ascending: false }).range(from, to),
  );
  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }
  return NextResponse.json(result.data);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = chatMessageSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const routeParams = await params;
  const ticket = await loadTicketForChat(routeParams.id);
  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }
  if (!canUseChat(ticket, session.user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await dbQuery<ChatMessage>(() =>
    supabase
      .from("chat_messages")
      .insert({ ticket_id: routeParams.id, sender_id: session.user.id, message: parsed.data.message })
      .select("*")
      .single(),
  );

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 400 });
  }
  return NextResponse.json(result.data, { status: 201 });
}
