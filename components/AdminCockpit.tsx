"use client";

import { motion } from "framer-motion";
import { Activity, Layers2, Ticket, Users } from "lucide-react";
import { FadeIn } from "@/components/ui/motion";
import { KpiCard } from "@/components/ui/kpi-card";
import { FilterBar } from "@/components/ui/filter-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

interface Analytics {
  status: string;
  count: number;
}

interface AdminCockpitProps {
  analytics: Analytics[];
  totalTickets: number;
  totalUsers: number;
  openTickets: number;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export function AdminCockpit({ analytics, totalTickets, totalUsers, openTickets }: AdminCockpitProps) {
  const maxCount = Math.max(1, ...analytics.map((entry) => entry.count));

  return (
    <div className="space-y-7 md:space-y-8">
      <FadeIn className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="status-chip inline-flex">ADMIN DASHBOARD</p>
          <h1 className="mt-2 text-page-title">Operations Overview</h1>
          <p className="mt-1 text-body text-soft">Monitor ticket volume, workload balance, and system health from one place.</p>
        </div>
      </FadeIn>

      <motion.section variants={container} initial="hidden" animate="show" className="grid gap-4 md:gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <motion.div variants={item}><KpiCard label="Total Tickets" value={totalTickets} icon={Ticket} trend="Overall volume" /></motion.div>
        <motion.div variants={item}><KpiCard label="Open Tickets" value={openTickets} icon={Layers2} trend="Needs active handling" /></motion.div>
        <motion.div variants={item}><KpiCard label="Total Users" value={totalUsers} icon={Users} trend="Licensed operators" /></motion.div>
        <motion.div variants={item}><KpiCard label="Status Buckets" value={analytics.length} icon={Activity} trend="Workflow health signal" /></motion.div>
      </motion.section>

      <section className="surface space-y-5 p-5 md:p-6">
        <FilterBar searchPlaceholder="Search status buckets">
          <button className="btn-muted text-label">Date Range</button>
          <button className="btn-muted text-label">Status</button>
          <button className="btn-muted text-label">Assignee</button>
          <button className="btn-brand text-label">Apply Filters</button>
        </FilterBar>

        {!analytics.length ? (
          <>
            <div className="grid gap-2">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </div>
            <EmptyState title="No analytics data" description="Status insights will appear once ticket activity is available." />
          </>
        ) : (
          <div className="overflow-hidden rounded-xl border border-brand-200">
            <table className="w-full text-sm">
              <thead className="bg-brand-100/75 text-left text-ink-700">
                <tr>
                  <th className="px-4 py-3 text-table-header">Status</th>
                  <th className="px-4 py-3 text-table-header">Count</th>
                  <th className="px-4 py-3 text-table-header">Progress</th>
                </tr>
              </thead>
              <tbody>
                {analytics.map((entry) => {
                  const widthPct = Math.max(8, Math.round((entry.count / maxCount) * 100));
                  return (
                    <tr key={entry.status} className="border-t border-brand-100">
                      <td className="px-4 py-3 font-medium">{entry.status}</td>
                      <td className="px-4 py-3 text-soft">{entry.count}</td>
                      <td className="px-4 py-3">
                        <div className="h-2 rounded-full bg-brand-100">
                          <div className="h-full rounded-full bg-brand-500" style={{ width: `${widthPct}%` }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
