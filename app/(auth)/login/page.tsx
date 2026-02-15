import { AuthForm } from "@/components/AuthForm";
import { FadeIn } from "@/components/ui/motion";

export default function LoginPage() {
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-8 px-4 py-10 md:px-8 lg:grid-cols-2">
      <FadeIn className="surface space-y-6 p-8 md:p-10">
        <p className="status-chip inline-flex">ECMS PORTAL</p>
        <div className="space-y-3">
          <h1 className="[font-family:var(--font-space)] text-3xl leading-tight font-semibold tracking-tight text-ink-900 md:text-5xl">
            Manage support tickets with confidence.
          </h1>
          <p className="max-w-xl text-base text-soft md:text-lg">
            Faster triage, clear SLA visibility, and one workspace for agents, technicians, and admins.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-brand-200 bg-brand-100/60 px-4 py-3 text-sm">OTP-secured access</div>
          <div className="rounded-xl border border-brand-200 bg-brand-100/60 px-4 py-3 text-sm">Ticket routing</div>
          <div className="rounded-xl border border-brand-200 bg-brand-100/60 px-4 py-3 text-sm">Audit friendly</div>
        </div>
      </FadeIn>

      <div className="mx-auto w-full max-w-lg">
        <AuthForm />
      </div>
    </main>
  );
}
