import { redirect } from "next/navigation";
import { FadeIn } from "@/components/ui/motion";
import { auth } from "@/lib/auth";
import { canViewAdmin } from "@/lib/rbac";
import { UserNavActions } from "@/components/UserNavActions";
import { AppShellNav } from "@/components/ui/app-shell";
import Link from "next/link";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const showAdmin = canViewAdmin(session.user.role);

  return (
    <div className="mx-auto min-h-screen w-full max-w-[1480px] px-3 py-4 md:px-6 md:py-6">
      <div className="grid min-h-[calc(100vh-2rem)] gap-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-6">
        <aside className="surface sidebar-scrollbar sticky top-4 hidden h-[calc(100vh-2.5rem)] overflow-y-auto bg-bg-sidebar p-5 lg:block">
          <div className="mb-6 space-y-1 border-b border-border-subtle pb-5">
            <h2 className="text-section-title text-ink-900">ECMS Console</h2>
            <p className="text-meta text-soft">Ticketing and escalation command center</p>
          </div>

          <AppShellNav showAdmin={showAdmin} />

          <div className="mt-6 border-t border-border-subtle pt-4">
            <UserNavActions />
          </div>
        </aside>

        <div className="min-w-0 space-y-4">
          <header className="surface flex flex-wrap items-center justify-between gap-3 px-4 py-3 lg:hidden">
            <div>
              <h2 className="text-section-title text-ink-900">ECMS Console</h2>
              <p className="text-meta text-soft">Operations</p>
            </div>
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
              <Link className="text-label rounded-lg border border-border-subtle bg-bg-elevated px-2.5 py-1.5" href="/dashboard">Dashboard</Link>
              <Link className="text-label rounded-lg border border-border-subtle bg-bg-elevated px-2.5 py-1.5" href="/tickets/new">Create</Link>
              {showAdmin ? <Link className="text-label rounded-lg border border-border-subtle bg-bg-elevated px-2.5 py-1.5" href="/admin">Admin</Link> : null}
              <UserNavActions />
            </div>
          </header>

          <FadeIn className="surface min-h-[70vh] bg-bg-surface p-4 md:p-6">{children}</FadeIn>
        </div>
      </div>
    </div>
  );
}
