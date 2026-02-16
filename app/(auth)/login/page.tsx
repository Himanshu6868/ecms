import Link from "next/link";
import { FadeIn } from "@/components/ui/motion";
import { ShieldCheck, UserRound } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 md:px-8">
      <section className="grid w-full gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <FadeIn className="surface space-y-5 p-7 md:p-9">
          <p className="status-chip inline-flex">ECMS AUTH</p>
          <h1 className="[font-family:var(--font-space)] text-3xl font-semibold tracking-tight md:text-5xl">Secure access for every workflow</h1>
          <p className="max-w-xl text-sm text-soft md:text-base">
            Enterprise OTP authentication with separate flows for external users and internal operations teams.
          </p>
        </FadeIn>

        <div className="grid gap-4">
          <section className="surface-muted p-6">
            <div className="inline-flex rounded-lg bg-brand-100 p-2 text-ink-700">
              <UserRound className="h-5 w-5" />
            </div>
            <p className="status-chip mt-4 inline-flex">NORMAL FLOW</p>
            <h2 className="[font-family:var(--font-space)] mt-3 text-2xl font-semibold">Customer / Agent</h2>
            <p className="mt-2 text-sm text-soft">For self-service customers and external agents creating tickets on behalf of users.</p>
            <Link href="/login/external" className="btn-brand mt-5 inline-flex">
              Continue
            </Link>
          </section>

          <section className="surface-muted p-6">
            <div className="inline-flex rounded-lg bg-brand-100 p-2 text-ink-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <p className="status-chip mt-4 inline-flex">INTERNAL FLOW</p>
            <h2 className="[font-family:var(--font-space)] mt-3 text-2xl font-semibold">Internal Team</h2>
            <p className="mt-2 text-sm text-soft">For area support, escalation teams, managers, and admins handling operational workflows.</p>
            <Link href="/login/internal" className="btn-brand mt-5 inline-flex">
              Continue
            </Link>
          </section>
        </div>
      </section>
    </main>
  );
}
