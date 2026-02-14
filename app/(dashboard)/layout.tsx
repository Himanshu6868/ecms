import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-[240px_1fr]">
      <aside className="border-r bg-white p-4">
        <h2 className="mb-4 font-semibold">Geo Ticket</h2>
        <nav className="space-y-2 text-sm">
          <Link className="block rounded px-2 py-1 hover:bg-zinc-100" href="/dashboard">
            Dashboard
          </Link>
          <Link className="block rounded px-2 py-1 hover:bg-zinc-100" href="/tickets/new">
            Create Ticket
          </Link>
          <Link className="block rounded px-2 py-1 hover:bg-zinc-100" href="/admin">
            Admin
          </Link>
        </nav>
      </aside>
      <section className="p-6">{children}</section>
    </div>
  );
}
