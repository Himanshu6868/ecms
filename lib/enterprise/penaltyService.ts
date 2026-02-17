import { supabase } from "@/lib/db";

export async function calculatePenalty(ticketId: string, delayMinutes: number, idempotencyKey: string): Promise<number> {
  const { data: rule } = await supabase
    .from("penalty_rules")
    .select("id, max_penalty")
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!rule) {
    return 0;
  }

  const derived = Math.min(delayMinutes * 2, Number(rule.max_penalty));
  await supabase.from("penalty_events").upsert({
    ticket_id: ticketId,
    rule_id: rule.id,
    delay_minutes: delayMinutes,
    penalty_amount: derived,
    idempotency_key: idempotencyKey,
  });

  return derived;
}
