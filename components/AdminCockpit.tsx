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
    <div className="space-y-6">
      <FadeIn className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="status-chip inline-flex">ADMIN FLOW</p>
          <h1 className="[font-family:var(--font-space)] mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Operations Cockpit</h1>
          <p className="text-soft mt-1 text-sm">System-wide visibility for workload, rules, and escalations.</p>
        </div>
      </FadeIn>

      <motion.section variants={container} initial="hidden" animate="show" className="grid gap-3 sm:grid-cols-3">
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
      </motion.section>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <section className="surface p-4 md:p-5">
          <h2 className="[font-family:var(--font-space)] mb-4 text-lg font-semibold">Ticket Distribution</h2>
          <motion.ul variants={container} initial="hidden" animate="show" className="space-y-3">
            {analytics.map((entry) => {
              const widthPct = Math.max(8, Math.round((entry.count / maxCount) * 100));
              return (
                <motion.li key={entry.status} variants={item} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{entry.status}</span>
                    <span className="text-soft">{entry.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-brand-100">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-300"
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                </motion.li>
              );
            })}
          </motion.ul>
        </section>

        <section className="surface space-y-4 p-4 md:p-5">
          <h2 className="[font-family:var(--font-space)] text-lg font-semibold">Runbook</h2>
          <article className="glass p-3">
            <h3 className="font-semibold">SLA Guard</h3>
            <p className="text-soft mt-1 text-sm">Priority-based SLA checks run in cron and escalation service.</p>
          </article>
          <article className="glass p-3">
            <h3 className="font-semibold">Area Routing</h3>
            <p className="text-soft mt-1 text-sm">Ticket zone maps to area and team assignment automatically.</p>
          </article>
          <article className="glass p-3">
            <h3 className="font-semibold">Audit Trail</h3>
            <p className="text-soft mt-1 text-sm">Chat and escalation history are append-only for traceability.</p>
          </article>
        </section>
      </div>
    </div>
  );
}
