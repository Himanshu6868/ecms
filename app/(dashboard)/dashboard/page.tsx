import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { dbQuery, supabase } from "@/lib/db";
import { Ticket } from "@/types/domain";
import { TicketTable } from "@/components/TicketTable";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const query = supabase.from("tickets").select("*").order("created_at", { ascending: false }).limit(20);
  const guarded = session.user.role === "CUSTOMER" ? query.eq("customer_id", session.user.id) : query;

  const result = await dbQuery<Ticket[]>(() => guarded);
  const tickets = result.error ? [] : result.data;

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-sm text-zinc-600">Role: {session.user.role}</p>
      <TicketTable tickets={tickets} />
    </main>
  );
}
