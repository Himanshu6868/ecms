import { auth } from "@/lib/auth";
import { dbQuery, supabase } from "@/lib/db";
import { ChatMessage, Ticket } from "@/types/domain";
import { FadeIn } from "@/components/ui/motion";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

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

  const chatResult = await dbQuery<ChatMessage[]>(() =>
    supabase.from("chat_messages").select("*").eq("ticket_id", routeParams.id).order("created_at", { ascending: false }).limit(30),
  );

  async function postMessage(formData: FormData) {
    "use server";
    const activeSession = await auth();
    if (!activeSession?.user) {
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
          <h1 className="[font-family:var(--font-space)] text-xl font-semibold tracking-tight md:text-2xl">Ticket #{ticketResult.data.id.slice(0, 8)}</h1>
          <p className="status-chip">{ticketResult.data.status}</p>
        </div>
        <div className="grid gap-2 text-sm text-soft sm:grid-cols-2">
          <p>Priority: {ticketResult.data.priority}</p>
          <p>SLA: {new Date(ticketResult.data.sla_deadline).toLocaleString()}</p>
        </div>
      </FadeIn>

      <section className="surface space-y-3 p-4 md:p-5">
        <h2 className="[font-family:var(--font-space)] text-lg font-semibold">Activity Chat</h2>
        <form action={postMessage} className="flex flex-col gap-2 sm:flex-row">
          <input name="message" className="input-clean flex-1" maxLength={2000} required placeholder="Send an update to this ticket" />
          <button type="submit" className="btn-brand">
            Send
          </button>
        </form>
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
