import { supabase } from "@/lib/db";
import { queueNotification } from "@/lib/enterprise/notificationOrchestrator";
import { appendAuditEvent } from "@/lib/enterprise/auditLogService";

export async function createEscalationEvent(input: {
  ticketId: string;
  fromAgent?: string | null;
  toAgent?: string | null;
  previousLevel: number;
  newLevel: number;
  reason: string;
  correlationId: string;
  ruleId?: string | null;
  timerId?: string | null;
}): Promise<void> {
  const { error } = await supabase.from("escalation_events").insert({
    ticket_id: input.ticketId,
    sla_timer_id: input.timerId ?? null,
    rule_id: input.ruleId ?? null,
    from_agent: input.fromAgent ?? null,
    to_agent: input.toAgent ?? null,
    previous_level: input.previousLevel,
    new_level: input.newLevel,
    reason: input.reason,
    status: "SUCCESS",
    correlation_id: input.correlationId,
  });

  if (error && !error.message.includes("duplicate")) {
    throw new Error(`Failed to persist escalation event: ${error.message}`);
  }

  await appendAuditEvent({
    eventType: "SLA_ESCALATION",
    ticketId: input.ticketId,
    actorId: input.toAgent ?? undefined,
    resourceType: "TICKET",
    resourceId: input.ticketId,
    action: "ESCALATED",
    metadata: input,
    severity: "WARNING",
  });

  if (input.toAgent) {
    await queueNotification({
      ticketId: input.ticketId,
      recipientUserId: input.toAgent,
      channel: "IN_APP",
      templateKey: "ticket-escalated",
      payload: { ticketId: input.ticketId, reason: input.reason, escalationLevel: input.newLevel },
      idempotencyKey: `${input.correlationId}:notify`,
    });
  }
}
