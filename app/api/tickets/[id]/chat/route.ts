import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { chatMessageSchema, paginationSchema } from "@/lib/validations";
import { dbQuery, supabase } from "@/lib/db";
import { ChatMessage, Ticket } from "@/types/domain";

function isExternalScoped(role: string, isInternal: boolean): boolean {
  if (role === "CUSTOMER") {
    return true;
  }
  if (role === "AGENT") {
    return !isInternal;
  }
  return !isInternal;
}

async function canAccessTicket(ticketId: string, userId: string): Promise<boolean> {
  const ticketResult = await dbQuery<Pick<Ticket, "customer_id" | "created_by">>(() =>
    supabase.from("tickets").select("customer_id, created_by").eq("id", ticketId).single(),
  );
  if (ticketResult.error) {
    return false;
  }

  return ticketResult.data.customer_id === userId || ticketResult.data.created_by === userId;
}

async function assertExternalScopeAccess(ticketId: string, userId: string, scoped: boolean): Promise<boolean> {
  if (!scoped) {
    return true;
  }
  return canAccessTicket(ticketId, userId);
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const routeParams = await params;
  const scoped = isExternalScoped(session.user.role, session.user.isInternal);
  const hasAccess = await assertExternalScopeAccess(routeParams.id, session.user.id, scoped);
  if (!hasAccess) {
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
  const scoped = isExternalScoped(session.user.role, session.user.isInternal);
  const hasAccess = await assertExternalScopeAccess(routeParams.id, session.user.id, scoped);
  if (!hasAccess) {
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
