import { AuthForm } from "@/components/AuthForm";
import { FadeIn, ScaleIn } from "@/components/ui/motion";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 md:px-8">
      <section className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <FadeIn className="space-y-5 self-center">
          <p className="status-chip inline-flex">ECMS PORTAL</p>
          <h2 className="[font-family:var(--font-space)] text-4xl leading-tight font-semibold tracking-tight text-brand-800 md:text-6xl">
            Smart field support with faster escalation.
          </h2>
          <p className="max-w-xl text-base text-soft md:text-lg">
            Lightweight ticket operations for teams with area-based assignment, OTP access, and real-time action tracking.
          </p>
          <div className="grid max-w-xl gap-3 sm:grid-cols-3">
            <div className="surface px-4 py-3 text-sm">Secure OTP auth</div>
            <div className="surface px-4 py-3 text-sm">Geo-aware routing</div>
            <div className="surface px-4 py-3 text-sm">SLA escalation</div>
          </div>
        </FadeIn>
        <ScaleIn className="mx-auto w-full max-w-lg">
          <AuthForm />
        </ScaleIn>
      </section>
    </main>
  );
}
