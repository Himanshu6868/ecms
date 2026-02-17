import crypto from "node:crypto";
import { supabase } from "@/lib/db";

export interface AuditEventInput {
  eventType: string;
  severity?: "INFO" | "WARNING" | "CRITICAL";
  actorId?: string | null;
  actorRole?: string | null;
  ticketId?: string | null;
  resourceType: string;
  resourceId?: string | null;
  action: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}

async function fetchPreviousHash(): Promise<string | null> {
  const { data } = await supabase.from("audit_log_events").select("hash_current").order("created_at", { ascending: false }).limit(1).maybeSingle();
  return data?.hash_current ?? null;
}

export async function appendAuditEvent(input: AuditEventInput): Promise<void> {
  const previousHash = await fetchPreviousHash();
  const hashCurrent = crypto
    .createHash("sha256")
    .update(JSON.stringify({ previousHash, input }))
    .digest("hex");

  const { error } = await supabase.from("audit_log_events").insert({
    event_type: input.eventType,
    severity: input.severity ?? "INFO",
    actor_id: input.actorId ?? null,
    actor_role: input.actorRole ?? null,
    ticket_id: input.ticketId ?? null,
    resource_type: input.resourceType,
    resource_id: input.resourceId ?? null,
    action: input.action,
    metadata: input.metadata ?? {},
    ip_address: input.ipAddress ?? null,
    user_agent: input.userAgent ?? null,
    hash_prev: previousHash,
    hash_current: hashCurrent,
  });

  if (error) {
    throw new Error(`Failed to append audit event: ${error.message}`);
  }
}
