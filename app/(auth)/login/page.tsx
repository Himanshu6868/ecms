import Link from "next/link";
import { FadeIn, HoverLift } from "@/components/ui/motion";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 md:px-8">
      <section className="grid w-full gap-6 lg:grid-cols-2">
        <FadeIn className="surface space-y-5 p-7 md:p-9">
          <p className="status-chip inline-flex">ECMS AUTH</p>
          <h1 className="[font-family:var(--font-space)] text-3xl font-semibold tracking-tight md:text-5xl">
            Choose your login flow
          </h1>
          <p className="text-soft max-w-xl text-sm md:text-base">
            External users and internal teams have separate OTP access paths with role-based validation.
          </p>
        </FadeIn>

        <div className="grid gap-4">
          <HoverLift className="surface-3d p-6">
            <p className="status-chip inline-flex">NORMAL FLOW</p>
            <h2 className="[font-family:var(--font-space)] mt-3 text-2xl font-semibold">Customer / Agent</h2>
            <p className="text-soft mt-2 text-sm">
              For self-service customers and external agents creating tickets on behalf of users.
            </p>
            <Link href="/login/external" className="btn-brand mt-5 inline-flex">
              Continue
            </Link>
          </HoverLift>

          <HoverLift className="surface-3d p-6">
            <p className="status-chip inline-flex">INTERNAL FLOW</p>
            <h2 className="[font-family:var(--font-space)] mt-3 text-2xl font-semibold">Internal Team</h2>
            <p className="text-soft mt-2 text-sm">
              For area support, escalation teams, managers, and admins handling operational workflows.
            </p>
            <Link href="/login/internal" className="btn-brand mt-5 inline-flex">
              Continue
            </Link>
          </HoverLift>
        </div>
      </section>
    </main>
  );
}
