import { dbQuery, supabase } from "@/lib/db";
import { assertTransition } from "@/lib/stateMachine";
import { Ticket, TicketPriority, TicketStatus, User } from "@/types/domain";

function deadlineByPriority(priority: TicketPriority): Date {
  const now = Date.now();
  const hours = { LOW: 72, MEDIUM: 24, HIGH: 8, CRITICAL: 2 }[priority];
  return new Date(now + hours * 60 * 60 * 1000);
}

export async function deriveAreaByZone(zoneId: string): Promise<string> {
  const areaResult = await dbQuery<{ id: string }>(() =>
    supabase.from("areas").select("id").eq("zone_code", zoneId).single(),
  );
  if (areaResult.error) {
    throw new Error("Area not found for provided zone");
  }
  return areaResult.data.id;
}

export async function selectTeamAndAgent(areaId: string): Promise<{ teamId: string | null; agentId: string | null }> {
  const teamResult = await dbQuery<{ id: string }>(() =>
    supabase.from("teams").select("id").eq("area_id", areaId).limit(1).single(),
  );
  if (teamResult.error) {
    return { teamId: null, agentId: null };
  }
  const teamId = teamResult.data.id;
  const workloadResult = await dbQuery<Array<{ user_id: string; open_count: number }>>(() =>
    supabase.rpc("least_loaded_agent", { target_team_id: teamId }),
  );
  if (workloadResult.error || workloadResult.data.length === 0) {
    return { teamId, agentId: null };
  }
  return { teamId, agentId: workloadResult.data[0].user_id };
}

export async function createTicket(input: {
  customerId: string;
  createdBy: string;
  description: string;
  priority: TicketPriority;
  location: { latitude: number; longitude: number; address: string; zoneId: string };
}): Promise<Ticket> {
  const userResult = await dbQuery<User>(() => supabase.from("users").select("*").eq("id", input.customerId).single());
  if (userResult.error || !userResult.data.otp_verified_at) {
    throw new Error("OTP verification required before ticket creation");
  }
  const areaId = await deriveAreaByZone(input.location.zoneId);
  const routing = await selectTeamAndAgent(areaId);

  const payload = {
    customer_id: input.customerId,
    created_by: input.createdBy,
    area_id: areaId,
    assigned_team_id: routing.teamId,
    assigned_agent_id: routing.agentId,
    status: routing.agentId ? "ASSIGNED" : "CREATED",
    priority: input.priority,
    description: input.description,
    sla_deadline: deadlineByPriority(input.priority).toISOString(),
    escalation_level: 0,
  };

  const ticketResult = await dbQuery<Ticket>(() => supabase.from("tickets").insert(payload).select("*").single());
  if (ticketResult.error) {
    throw ticketResult.error;
  }

  await supabase.from("locations").insert({
    ticket_id: ticketResult.data.id,
    latitude: input.location.latitude,
    longitude: input.location.longitude,
    address: input.location.address,
    zone_id: input.location.zoneId,
  });

  return ticketResult.data;
}

export async function transitionTicket(ticketId: string, next: TicketStatus): Promise<Ticket> {
  const currentResult = await dbQuery<Ticket>(() => supabase.from("tickets").select("*").eq("id", ticketId).single());
  if (currentResult.error) {
    throw currentResult.error;
  }
  assertTransition(currentResult.data.status, next);
  const updatedResult = await dbQuery<Ticket>(() =>
    supabase.from("tickets").update({ status: next, updated_at: new Date().toISOString() }).eq("id", ticketId).select("*").single(),
  );
  if (updatedResult.error) {
    throw updatedResult.error;
  }
  return updatedResult.data;
}

export async function runSlaMonitor(): Promise<number> {
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .in("status", ["CREATED", "ASSIGNED", "IN_PROGRESS", "REASSIGNED"])
    .lt("sla_deadline", new Date().toISOString());

  if (error || !data) {
    throw new Error(error?.message ?? "Failed SLA query");
  }

  for (const ticket of data as Ticket[]) {
    const fromAgent = ticket.assigned_agent_id;
    await transitionTicket(ticket.id, "SLA_BREACHED");
    await transitionTicket(ticket.id, "ESCALATED");

    const nextLevel = ticket.escalation_level + 1;
    const { teamId, agentId } = await selectTeamAndAgent(ticket.area_id);

    await supabase
      .from("tickets")
      .update({
        assigned_team_id: teamId,
        assigned_agent_id: agentId,
        escalation_level: nextLevel,
        status: "REASSIGNED",
        updated_at: new Date().toISOString(),
      })
      .eq("id", ticket.id);

    await supabase.from("escalation_history").insert({
      ticket_id: ticket.id,
      from_agent: fromAgent,
      to_agent: agentId,
      level: nextLevel,
      timestamp: new Date().toISOString(),
    });
  }

  return data.length;
}
