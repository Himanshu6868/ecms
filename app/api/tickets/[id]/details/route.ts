import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { dbQuery, supabase } from "@/lib/db";
import { createSignedTicketObjectUrl } from "@/lib/ticketUploads";
import { Ticket, TicketAttachment } from "@/types/domain";

function isExternalScoped(role: string, isInternal: boolean): boolean {
  if (role === "CUSTOMER") return true;
  if (role === "AGENT") return !isInternal;
  return !isInternal;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const ticketResult = await dbQuery<Ticket>(() => supabase.from("tickets").select("*").eq("id", id).single());
  if (ticketResult.error) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  const ticket = ticketResult.data;
  if (isExternalScoped(session.user.role, session.user.isInternal) && ticket.customer_id !== session.user.id && ticket.created_by !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const assignedUserResult = ticket.assigned_agent_id
    ? await dbQuery<{ name: string; email: string }>(() => supabase.from("users").select("name, email").eq("id", ticket.assigned_agent_id).single())
    : { data: null, error: null };

  const attachmentsResult = await dbQuery<TicketAttachment[]>(() =>
    supabase.from("ticket_attachments").select("*").eq("ticket_id", ticket.id).order("created_at", { ascending: false }),
  );

  const attachments = await Promise.all(
    (attachmentsResult.error ? [] : attachmentsResult.data).map(async (attachment) => ({
      ...attachment,
      signed_url: await createSignedTicketObjectUrl(attachment.file_url),
    })),
  );

  const assignedTo = assignedUserResult.error || !assignedUserResult.data
    ? null
    : `${assignedUserResult.data.name} (${assignedUserResult.data.email})`;

  return NextResponse.json({
    ticket,
    assignedTo,
    attachments,
  });
}
