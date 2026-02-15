import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-10 md:px-10">
      <section className="grid w-full gap-8 md:grid-cols-2 md:items-center">
        <div className="space-y-5">
          <span className="inline-flex rounded-full bg-[var(--brand-green-soft)] px-3 py-1 text-sm font-medium text-emerald-900">
            Geo Ticket Platform
          </span>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Welcome back</h1>
          <p className="max-w-md text-sm leading-6 text-[var(--text-muted)] md:text-base">
            Track and resolve service requests quickly with a clean dashboard experience built for support teams and
            administrators.
          </p>
        </div>
        <AuthForm />
      </section>
    </main>
  );
}
