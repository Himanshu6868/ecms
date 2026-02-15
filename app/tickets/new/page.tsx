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
    <main className="space-y-6">
      <FadeIn className="space-y-2">
        <p className="status-chip inline-flex">NEW TICKET</p>
        <h1 className="[font-family:var(--font-space)] text-2xl font-semibold tracking-tight md:text-3xl">Ticket Creation</h1>
        <p className="text-soft text-sm md:text-base">Capture issue details once and let routing plus SLA policies handle the rest.</p>
      </FadeIn>

      <section className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
        <TicketCreateForm />

        <aside className="space-y-4">
          <article className="surface p-4">
            <h2 className="text-base font-semibold">Submission tips</h2>
            <ul className="text-soft mt-2 space-y-1 text-sm">
              <li>• Include clear impact in the description.</li>
              <li>• Verify coordinates for field requests.</li>
              <li>• Use HIGH/CRITICAL only for urgent issues.</li>
            </ul>
          </article>
          <article className="surface p-4">
            <h2 className="text-base font-semibold">SLA guidance</h2>
            <p className="text-soft mt-2 text-sm">Priority and area decide assignment queue and escalation timers automatically.</p>
          </article>
        </aside>
      </section>
    </main>
  );
}
