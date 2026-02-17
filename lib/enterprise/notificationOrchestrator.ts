import { supabase } from "@/lib/db";
import { queueAdapter } from "@/lib/enterprise/queue";

export interface NotificationRequest {
  ticketId?: string;
  recipientUserId?: string;
  channel: "EMAIL" | "SMS" | "PUSH" | "WEBHOOK" | "IN_APP";
  templateKey: string;
  payload: Record<string, unknown>;
  idempotencyKey: string;
}

export async function queueNotification(request: NotificationRequest): Promise<void> {
  const { error } = await supabase.from("notifications").insert({
    ticket_id: request.ticketId ?? null,
    recipient_user_id: request.recipientUserId ?? null,
    channel: request.channel,
    template_key: request.templateKey,
    payload: request.payload,
    idempotency_key: request.idempotencyKey,
  });
  if (error && !error.message.includes("duplicate")) {
    throw new Error(`Failed to queue notification: ${error.message}`);
  }

  await queueAdapter.enqueue({
    queue: "notifications",
    name: "dispatch-notification",
    payload: request,
    idempotencyKey: request.idempotencyKey,
  });
}
