import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TicketCreateForm } from "@/components/TicketCreateForm";
import { FadeIn } from "@/components/ui/motion";

export default async function NewTicketPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-3xl space-y-5">
      <FadeIn className="space-y-2">
        <p className="status-chip inline-flex">NEW INCIDENT</p>
        <h1 className="[font-family:var(--font-space)] text-2xl font-semibold tracking-tight md:text-3xl">Create Ticket</h1>
        <p className="text-soft text-sm">Provide location and issue details. Routing and SLA are handled automatically.</p>
      </FadeIn>
      <TicketCreateForm />
    </main>
  );
}
