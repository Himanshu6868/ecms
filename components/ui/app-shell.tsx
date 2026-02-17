"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PlusCircle, Shield, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  section: "workspace" | "settings";
}

export function AppShellNav({ showAdmin }: { showAdmin: boolean }) {
  const pathname = usePathname();
  const navItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, section: "workspace" },
    { href: "/tickets/new", label: "Create Ticket", icon: PlusCircle, section: "workspace" },
    ...(showAdmin ? [{ href: "/admin", label: "Admin Cockpit", icon: Shield, section: "settings" as const }] : []),
  ];

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <p className="text-table-header px-3">Workspace</p>
        {navItems.filter((item) => item.section === "workspace").map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-label relative flex items-center gap-2.5 rounded-md border border-transparent px-3 py-2.5 text-ink-700 transition hover:bg-bg-hover hover:text-ink-900",
                active && "border-border-default bg-bg-active text-ink-900 before:absolute before:bottom-1 before:left-0 before:top-1 before:w-0.5 before:rounded-r before:bg-theme-primary",
              )}
            >
              <item.icon className={cn("h-4 w-4 text-ink-600", active && "text-theme-primary")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {showAdmin ? (
        <div className="space-y-1.5">
          <p className="text-table-header px-3">Administration</p>
          {navItems.filter((item) => item.section === "settings").map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-label relative flex items-center gap-2.5 rounded-md border border-transparent px-3 py-2.5 text-ink-700 transition hover:bg-bg-hover hover:text-ink-900",
                  active && "border-border-default bg-bg-active text-ink-900 before:absolute before:bottom-1 before:left-0 before:top-1 before:w-0.5 before:rounded-r before:bg-theme-primary",
                )}
              >
                <item.icon className={cn("h-4 w-4 text-ink-600", active && "text-theme-primary")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
