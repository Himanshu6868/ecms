import { supabase } from "@/lib/db";

export async function openIncident(input: {
  ticketId?: string;
  title: string;
  description: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  ownerId?: string;
}): Promise<string> {
  const incidentKey = `INC-${Date.now()}`;
  const { data, error } = await supabase
    .from("incidents")
    .insert({
      ticket_id: input.ticketId ?? null,
      incident_key: incidentKey,
      title: input.title,
      description: input.description,
      severity: input.severity,
      owner_id: input.ownerId ?? null,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to open incident: ${error.message}`);
  }
  return data.id;
}
