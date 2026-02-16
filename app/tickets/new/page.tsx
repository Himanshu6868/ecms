import { TicketCreateForm } from "@/components/TicketCreateForm";
import { FadeIn } from "@/components/ui/motion";
import { auth } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function NewTicketPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto w-full max-w-[1400px] space-y-6 px-2 py-2 sm:px-4 sm:py-3 md:space-y-7 md:px-6 md:py-4">
      <FadeIn className="space-y-3">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center">
          <div className="justify-self-start">
            <Link href="/dashboard" className="group inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-ink-900">
              <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
              Back to Dashboard
            </Link>
          </div>
          <p className="status-chip inline-flex justify-self-center">NEW TICKET</p>
          <div />
        </div>
        <div className="text-center">
          <h1 className="[font-family:var(--font-space)] text-3xl font-semibold tracking-tight md:text-4xl">Ticket Creation</h1>
          <p className="mx-auto max-w-3xl text-sm text-soft md:text-base">
            Capture issue details once and let routing plus SLA policies handle assignment and escalation automatically.
          </p>
        </div>
      </FadeIn>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.55fr]">
        <TicketCreateForm />

        <aside className="space-y-4 xl:pt-1">
          <section className="surface-muted p-5">
            <h2 className="[font-family:var(--font-space)] text-lg font-semibold">Submission Quality</h2>
            <ul className="mt-3 space-y-2 text-sm text-soft">
              <li>- Mention impact and urgency in one sentence.</li>
              <li>- Capture browser location before submit.</li>
              <li>- Use HIGH/CRITICAL only when SLA risk is immediate.</li>
            </ul>
          </section>

          <section className="surface-muted p-5">
            <h2 className="[font-family:var(--font-space)] text-lg font-semibold">Routing Logic</h2>
            <p className="mt-2 text-sm text-soft">User area mapping drives team queue assignment. Location is captured automatically from the browser.</p>
          </section>

          <section className="surface-muted p-5">
            <h2 className="[font-family:var(--font-space)] text-lg font-semibold">SLA Window</h2>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between rounded-lg bg-brand-50 px-3 py-2">
                <span>LOW/MEDIUM</span>
                <span className="font-semibold">24-48h</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-brand-50 px-3 py-2">
                <span>HIGH</span>
                <span className="font-semibold">8h</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-brand-50 px-3 py-2">
                <span>CRITICAL</span>
                <span className="font-semibold">4h</span>
              </div>
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
