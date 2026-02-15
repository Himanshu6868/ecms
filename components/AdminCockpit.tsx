"use client";

import { motion } from "framer-motion";
import { FadeIn, HoverLift } from "@/components/ui/motion";

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
          <h1 className="[font-family:var(--font-space)] mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Operations Overview</h1>
          <p className="text-soft mt-1 text-sm">Monitor ticket volume, workload balance, and system health from one place.</p>
        </div>
      </FadeIn>

      <motion.section variants={container} initial="hidden" animate="show" className="grid gap-4 md:gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <motion.div variants={item}>
          <HoverLift className="surface-3d p-4">
            <p className="text-soft text-xs uppercase">Total Tickets</p>
            <p className="mt-2 text-2xl font-semibold">{totalTickets}</p>
          </HoverLift>
        </motion.div>
        <motion.div variants={item}>
          <HoverLift className="surface-3d p-4">
            <p className="text-soft text-xs uppercase">Open Tickets</p>
            <p className="mt-2 text-2xl font-semibold">{openTickets}</p>
          </HoverLift>
        </motion.div>
        <motion.div variants={item}>
          <HoverLift className="surface-3d p-4">
            <p className="text-soft text-xs uppercase">Total Users</p>
            <p className="mt-2 text-2xl font-semibold">{totalUsers}</p>
          </HoverLift>
        </motion.div>
        <motion.div variants={item}>
          <HoverLift className="surface-3d p-4">
            <p className="text-soft text-xs uppercase">Status Buckets</p>
            <p className="mt-2 text-2xl font-semibold">{analytics.length}</p>
          </HoverLift>
        </motion.div>
      </motion.section>

      <section className="surface space-y-5 p-5 md:p-6">
        <div className="flex flex-wrap gap-2">
          <button className="btn-muted text-sm">Date Range</button>
          <button className="btn-muted text-sm">Status</button>
          <button className="btn-muted text-sm">Assignee</button>
          <button className="btn-brand text-sm">Apply Filters</button>
        </div>

        <div className="overflow-hidden rounded-xl border border-brand-200">
          <table className="w-full text-sm">
            <thead className="bg-brand-100 text-left text-gray-700">
              <tr>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Count</th>
                <th className="px-4 py-3">Progress</th>
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
      </section>
    </div>
  );
}
