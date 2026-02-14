import { auth } from "@/lib/auth";
import { dbQuery, supabase } from "@/lib/db";
import { ChatMessage, Ticket } from "@/types/domain";
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
  }

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold">Ticket {ticketResult.data.id}</h1>
      <p>Status: {ticketResult.data.status}</p>
      <p>Priority: {ticketResult.data.priority}</p>
      <section className="space-y-2 rounded border bg-white p-4">
        <h2 className="font-semibold">Chat</h2>
        <form action={postMessage} className="flex gap-2">
          <input name="message" className="flex-1 rounded border px-3 py-2" maxLength={2000} required />
          <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
            Send
          </button>
        </form>
        <ul className="space-y-2">
          {(chatResult.error ? [] : chatResult.data).map((msg) => (
            <li key={msg.id} className="rounded bg-zinc-100 p-2">
              <p className="text-xs text-zinc-500">{msg.sender_id}</p>
              <p>{msg.message}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
