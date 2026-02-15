import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createTicket } from "@/lib/ticketService";
import { dbQuery, supabase } from "@/lib/db";
import { paginationSchema, ticketCreateSchema } from "@/lib/validations";
import { Ticket } from "@/types/domain";

function isExternalScoped(role: string, isInternal: boolean): boolean {
  if (role === "CUSTOMER") {
    return true;
  }
  if (role === "AGENT") {
    return !isInternal;
  }
  return !isInternal;
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const pager = paginationSchema.parse({
    page: url.searchParams.get("page"),
    pageSize: url.searchParams.get("pageSize"),
  });
  const from = (pager.page - 1) * pager.pageSize;
  const to = from + pager.pageSize - 1;

  const query = supabase.from("tickets").select("*").order("created_at", { ascending: false }).range(from, to);
  const guarded = isExternalScoped(session.user.role, session.user.isInternal)
    ? query.or(`customer_id.eq.${session.user.id},created_by.eq.${session.user.id}`)
    : query;

  const result = await dbQuery<Ticket[]>(() => guarded);

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }
  return NextResponse.json(result.data);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = ticketCreateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const ticket = await createTicket({
      customerId: session.user.id,
      createdBy: session.user.id,
      description: parsed.data.description,
      priority: parsed.data.priority,
      location: parsed.data.location,
    });
    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 400 });
  }
}
