import Link from "next/link";
import { FadeIn } from "@/components/ui/motion";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl px-3 py-4 md:px-6 md:py-6">
      <div className="grid min-h-[calc(100vh-2rem)] gap-4 md:grid-cols-[260px_1fr] md:gap-6">
        <aside className="surface sticky top-4 hidden h-fit p-5 md:block">
          <h2 className="[font-family:var(--font-space)] mb-6 text-xl font-semibold tracking-tight text-brand-700">Geo Ticket</h2>
          <nav className="space-y-2 text-sm">
            <Link className="block rounded-xl px-3 py-2 hover:bg-brand-100" href="/dashboard">
              Dashboard
            </Link>
            <Link className="block rounded-xl px-3 py-2 hover:bg-brand-100" href="/tickets/new">
              Create Ticket
            </Link>
            <Link className="block rounded-xl px-3 py-2 hover:bg-brand-100" href="/admin">
              Admin Cockpit
            </Link>
          </nav>
        </aside>

        <div className="space-y-4">
          <header className="glass flex items-center justify-between px-4 py-3 md:hidden">
            <h2 className="[font-family:var(--font-space)] text-lg font-semibold text-brand-700">Geo Ticket</h2>
            <nav className="flex items-center gap-2 text-xs">
              <Link className="rounded-lg bg-brand-100 px-2 py-1" href="/dashboard">
                Dashboard
              </Link>
              <Link className="rounded-lg bg-brand-100 px-2 py-1" href="/tickets/new">
                New
              </Link>
              <Link className="rounded-lg bg-brand-100 px-2 py-1" href="/admin">
                Admin
              </Link>
            </nav>
          </header>

          <FadeIn className="surface min-h-[70vh] p-4 md:p-6">{children}</FadeIn>
        </div>
      </div>
    </div>
  );
}
