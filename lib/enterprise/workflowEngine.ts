import { supabase } from "@/lib/db";
import { appendAuditEvent } from "@/lib/enterprise/auditLogService";

export async function advanceWorkflow(input: {
  ticketId: string;
  workflowInstanceId: string;
  fromState: string;
  toState: string;
  actorId?: string;
  source: "SYSTEM" | "USER" | "API" | "CRON" | "QUEUE";
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const { error: transitionError } = await supabase.from("workflow_history").insert({
    workflow_instance_id: input.workflowInstanceId,
    ticket_id: input.ticketId,
    from_state_key: input.fromState,
    to_state_key: input.toState,
    actor_id: input.actorId ?? null,
    event_source: input.source,
    metadata: input.metadata ?? {},
  });

  if (transitionError) {
    throw new Error(`Workflow history insert failed: ${transitionError.message}`);
  }

  const { error: updateError } = await supabase
    .from("workflow_instances")
    .update({ current_state_key: input.toState, updated_at: new Date().toISOString() })
    .eq("id", input.workflowInstanceId);

  if (updateError) {
    throw new Error(`Workflow update failed: ${updateError.message}`);
  }

  await appendAuditEvent({
    eventType: "WORKFLOW_TRANSITION",
    ticketId: input.ticketId,
    actorId: input.actorId,
    resourceType: "WORKFLOW_INSTANCE",
    resourceId: input.workflowInstanceId,
    action: `${input.fromState}->${input.toState}`,
    metadata: input.metadata,
  });
}
