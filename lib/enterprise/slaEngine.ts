import { supabase } from "@/lib/db";
import { createEscalationEvent } from "@/lib/enterprise/escalationEngine";

export async function evaluateDueSlaTimers(nowIso: string = new Date().toISOString()): Promise<number> {
  const { data, error } = await supabase
    .from("sla_timers")
    .select("id, ticket_id, due_at")
    .eq("status", "RUNNING")
    .lt("due_at", nowIso)
    .limit(500);

  if (error) {
    throw new Error(`Failed to query SLA timers: ${error.message}`);
  }

  for (const timer of data ?? []) {
    const correlationId = `sla-breach:${timer.id}`;
    await supabase
      .from("sla_timers")
      .update({ status: "BREACHED", breached_at: nowIso, last_evaluated_at: nowIso, retry_count: 0 })
      .eq("id", timer.id)
      .eq("status", "RUNNING");

    await createEscalationEvent({
      ticketId: timer.ticket_id,
      previousLevel: 0,
      newLevel: 1,
      reason: `Timer breached at ${timer.due_at}`,
      correlationId,
      timerId: timer.id,
    });
  }

  return data?.length ?? 0;
}
