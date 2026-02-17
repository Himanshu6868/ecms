import { supabase } from "@/lib/db";
import { appendAuditEvent } from "@/lib/enterprise/auditLogService";

export async function scheduleRetention(resourceType: string, resourceId: string): Promise<void> {
  const { data: policies, error } = await supabase
    .from("compliance_retention_policies")
    .select("id, retention_days")
    .eq("resource_type", resourceType);

  if (error) {
    throw new Error(`Failed to load retention policies: ${error.message}`);
  }

  for (const policy of policies ?? []) {
    const dueAt = new Date(Date.now() + policy.retention_days * 24 * 60 * 60 * 1000).toISOString();
    await supabase.from("data_retention_jobs").upsert({
      policy_id: policy.id,
      resource_type: resourceType,
      resource_id: resourceId,
      due_at: dueAt,
      status: "SCHEDULED",
    });
  }

  await appendAuditEvent({
    eventType: "RETENTION_SCHEDULED",
    resourceType,
    resourceId,
    action: "SCHEDULE",
  });
}
