import { auth } from "@/lib/auth";
import { dbQuery, supabase } from "@/lib/db";
import { ChatMessage, Ticket } from "@/types/domain";
import { FadeIn } from "@/components/ui/motion";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

function isExternalScoped(role: string, isInternal: boolean): boolean {
  if (role === "CUSTOMER") {
    return true;
  }
  if (role === "AGENT") {
    return !isInternal;
  }
  return !isInternal;
}

function priorityClasses(priority: Ticket["priority"]): string {
  switch (priority) {
    case "LOW":
      return "border-emerald-400/50 bg-emerald-500/10 text-emerald-300";
    case "MEDIUM":
      return "border-sky-400/50 bg-sky-500/10 text-sky-300";
    case "HIGH":
      return "border-amber-400/60 bg-amber-500/10 text-amber-200";
    case "CRITICAL":
      return "border-rose-400/60 bg-rose-500/15 text-rose-200";
    default:
      return "border-border-subtle bg-bg-surface/80 text-text-primary";
  }
}

function canUseChat(ticket: Ticket, userId: string): boolean {
  return (
    ticket.customer_id === userId ||
    ticket.created_by === userId ||
    ticket.assigned_agent_id === userId
  );
}

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const routeParams = await params;
  const ticketResult = await dbQuery<Ticket>(() => supabase.from("tickets").select("*").eq("id", routeParams.id).single());
  if (ticketResult.error) {
    notFound();
  }
  const ticket = ticketResult.data;
  if (
    isExternalScoped(session.user.role, session.user.isInternal) &&
    ticket.customer_id !== session.user.id &&
    ticket.created_by !== session.user.id
  ) {
    notFound();
  }

  const canChat = canUseChat(ticket, session.user.id);
  const chatResult = canChat
    ? await dbQuery<ChatMessage[]>(() =>
        supabase.from("chat_messages").select("*").eq("ticket_id", routeParams.id).order("created_at", { ascending: false }).limit(30),
      )
    : { data: [] as ChatMessage[], error: null as null };

  async function postMessage(formData: FormData) {
    "use server";
    const activeSession = await auth();
    if (!activeSession?.user) {
      return;
    }
    if (!canUseChat(ticket, activeSession.user.id)) {
      return;
    }
    if (
      isExternalScoped(activeSession.user.role, activeSession.user.isInternal) &&
      ticket.customer_id !== activeSession.user.id &&
      ticket.created_by !== activeSession.user.id
    ) {
      return;
    }
    const message = String(formData.get("message") ?? "").trim();
    if (!message) {
      return;
    }
    await supabase.from("chat_messages").insert({ ticket_id: routeParams.id, sender_id: activeSession.user.id, message });
    revalidatePath(`/tickets/${routeParams.id}`);
  }

  return (
    <main className="space-y-5">
      <FadeIn className="surface-3d space-y-3 p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-section-title tracking-tight md:text-2xl">Ticket #{ticket.id.slice(0, 8)}</h1>
          <p className="status-chip">{ticket.status}</p>
        </div>
        <div className="grid gap-2 text-sm text-soft sm:grid-cols-2">
          <p>
            Priority:{" "}
            <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityClasses(ticket.priority)}`}>
              {ticket.priority}
            </span>
          </p>
          <p>SLA: {new Date(ticket.sla_deadline).toLocaleString()}</p>
        </div>
      </FadeIn>

      <section className="surface space-y-3 p-4 md:p-5">
        <h2 className="text-section-title">Ticket Description</h2>
        <p className="whitespace-pre-wrap text-sm text-text-secondary">{ticket.description}</p>
      </section>

      <section className="surface space-y-3 p-4 md:p-5">
        <h2 className="text-section-title">Activity Chat</h2>
        {canChat ? (
          <form action={postMessage} className="flex flex-col gap-2 sm:flex-row">
            <input name="message" className="input-clean flex-1" maxLength={2000} required placeholder="Send an update to this ticket" />
            <button type="submit" className="btn-brand">
              Send
            </button>
          </form>
        ) : (
          <p className="text-soft text-sm">Chat is available only between the ticket creator/customer and the assigned agent.</p>
        )}
        <ul className="space-y-2">
          {(chatResult.error ? [] : chatResult.data).map((msg) => (
            <li key={msg.id} className="glass p-3">
              <p className="text-xs text-soft">{msg.sender_id}</p>
              <p className="mt-1 text-sm">{msg.message}</p>
            </li>
          ))}
        </ul>
        {!chatResult.error && chatResult.data.length === 0 ? <p className="text-soft text-sm">No chat activity yet.</p> : null}
      </section>
    </main>
  );
}
