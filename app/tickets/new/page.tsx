import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TicketCreateForm } from "@/components/TicketCreateForm";

export default async function NewTicketPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="space-y-5">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Create Ticket</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Submit issue details, select priority, and provide location data for accurate routing.
        </p>
      </header>
      <TicketCreateForm />
    </main>
  );
}
