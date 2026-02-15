import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/tickets/new", label: "Create Ticket" },
  { href: "/admin", label: "Admin" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid min-h-screen max-w-7xl gap-4 px-4 py-6 md:grid-cols-[250px_1fr] md:px-6">
      <aside className="app-shell p-5">
        <h2 className="mb-5 text-lg font-semibold">Geo Ticket</h2>
        <nav className="flex flex-col gap-2 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              className="rounded-lg px-3 py-2 font-medium text-zinc-700 transition hover:bg-[var(--brand-green-soft)] hover:text-emerald-900"
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <section className="app-shell p-5 md:p-7">{children}</section>
    </div>
  );
}
