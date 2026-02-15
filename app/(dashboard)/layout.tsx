import Link from "next/link";
import { redirect } from "next/navigation";
import { FadeIn } from "@/components/ui/motion";
import { auth } from "@/lib/auth";
import { canViewAdmin } from "@/lib/rbac";
import { UserNavActions } from "@/components/UserNavActions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const showAdmin = canViewAdmin(session.user.role);

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl px-3 py-4 md:px-6 md:py-6">
      <div className="grid min-h-[calc(100vh-2rem)] gap-4 md:grid-cols-[240px_1fr] md:gap-6">
        <aside className="surface sticky top-4 hidden h-fit p-5 md:block">
          <h2 className="[font-family:var(--font-space)] mb-6 text-xl font-semibold tracking-tight text-ink-900">ECMS</h2>
          <nav className="space-y-2 text-sm">
            <Link className="block rounded-xl px-3 py-2 hover:bg-brand-100" href="/dashboard">
              Dashboard
            </Link>
            <Link className="block rounded-xl px-3 py-2 hover:bg-brand-100" href="/tickets/new">
              Create Ticket
            </Link>
            {showAdmin ? (
              <Link className="block rounded-xl px-3 py-2 hover:bg-brand-100" href="/admin">
                Admin Dashboard
              </Link>
            ) : null}
          </nav>
          <div className="mt-6 border-t border-brand-200 pt-4">
            <UserNavActions />
          </div>
        </aside>

        <div className="space-y-4">
          <header className="surface flex items-center justify-between px-4 py-3 md:hidden">
            <h2 className="[font-family:var(--font-space)] text-lg font-semibold text-ink-900">ECMS</h2>
            <nav className="flex items-center gap-2 text-xs">
              <Link className="rounded-lg bg-brand-100 px-2 py-1" href="/dashboard">
                Dashboard
              </Link>
              <Link className="rounded-lg bg-brand-100 px-2 py-1" href="/tickets/new">
                New
              </Link>
              {showAdmin ? (
                <Link className="rounded-lg bg-brand-100 px-2 py-1" href="/admin">
                  Admin
                </Link>
              ) : null}
            </nav>
          </header>

          <div className="flex justify-end md:hidden">
            <UserNavActions />
          </div>

          <FadeIn className="surface min-h-[70vh] p-4 md:p-6">{children}</FadeIn>
        </div>
      </div>
    </div>
  );
}
