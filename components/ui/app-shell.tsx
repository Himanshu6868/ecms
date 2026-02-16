import Link from "next/link";
import { LayoutDashboard, PlusCircle, Shield, type LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export function AppShellNav({ showAdmin }: { showAdmin: boolean }) {
  const navItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/tickets/new", label: "Create Ticket", icon: PlusCircle },
    ...(showAdmin ? [{ href: "/admin", label: "Admin Cockpit", icon: Shield }] : []),
  ];

  return (
    <nav className="space-y-1.5 text-sm">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="group flex items-center gap-2.5 rounded-xl px-3 py-2.5 font-medium text-ink-700 transition hover:bg-brand-100/80 hover:text-ink-900"
        >
          <item.icon className="h-4 w-4 text-ink-600 transition group-hover:text-ink-900" />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
