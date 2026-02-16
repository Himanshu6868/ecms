import { dbQuery, supabase } from "@/lib/db";
import { assertTransition } from "@/lib/stateMachine";
import { Ticket, TicketAttachment, TicketPriority, TicketStatus, User } from "@/types/domain";
import { INTERNAL_ACTOR_ROLES_BY_EMAIL, normalizeEmail } from "@/lib/internalActors";
import { removeUploadedTicketFiles, uploadTicketFile } from "@/lib/ticketUploads";

const SLA_SECONDS_BY_PRIORITY: Record<TicketPriority, number> = {
  LOW: 30,
  MEDIUM: 15,
  HIGH: 8,
  CRITICAL: 5,
};

function deadlineByPriority(priority: TicketPriority): Date {
  const now = Date.now();
  return new Date(now + SLA_SECONDS_BY_PRIORITY[priority] * 1000);
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

async function resolveAreaIdForUser(user: User): Promise<string> {
  if (user.area_id) {
    return user.area_id;
  }

  const existingAreas = await dbQuery<Array<{ id: string }>>(() =>
    supabase.from("areas").select("id").order("created_at", { ascending: true }).limit(1),
  );

  if (!existingAreas.error && existingAreas.data.length > 0) {
    return existingAreas.data[0].id;
  }

  const createdArea = await dbQuery<{ id: string }>(() =>
    supabase
      .from("areas")
      .insert({ name: "Unassigned Intake", zone_code: "AUTO_DEFAULT" })
      .select("id")
      .single(),
  );
  if (createdArea.error) {
    throw new Error("Unable to resolve default area for ticket creation");
  }
  return createdArea.data.id;
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

async function getOpenCountByAgent(agentIds: string[]): Promise<Record<string, number>> {
  if (agentIds.length === 0) {
    return {};
  }

  const openStatuses: TicketStatus[] = ["CREATED", "ASSIGNED", "IN_PROGRESS", "SLA_BREACHED", "ESCALATED", "REASSIGNED", "REOPENED"];
  const openTickets = await dbQuery<Array<{ assigned_agent_id: string | null }>>(() =>
    supabase.from("tickets").select("assigned_agent_id").in("assigned_agent_id", agentIds).in("status", openStatuses).is("deleted_at", null),
  );

  const counts: Record<string, number> = {};
  for (const id of agentIds) {
    counts[id] = 0;
  }
  if (openTickets.error) {
    return counts;
  }

  for (const ticket of openTickets.data) {
    if (ticket.assigned_agent_id && counts[ticket.assigned_agent_id] !== undefined) {
      counts[ticket.assigned_agent_id] += 1;
    }
  }

  return counts;
}

async function selectNextEscalationAgent(teamId: string, currentAgentId: string | null): Promise<string | null> {
  let currentLevel = 0;
  if (currentAgentId) {
    const currentMember = await dbQuery<{ hierarchy_level: number }>(() =>
      supabase.from("team_members").select("hierarchy_level").eq("team_id", teamId).eq("user_id", currentAgentId).single(),
    );
    if (!currentMember.error) {
      currentLevel = currentMember.data.hierarchy_level;
    }
  }

  const candidates = await dbQuery<Array<{ user_id: string; hierarchy_level: number }>>(() =>
    supabase
      .from("team_members")
      .select("user_id, hierarchy_level")
      .eq("team_id", teamId)
      .gt("hierarchy_level", currentLevel)
      .order("hierarchy_level", { ascending: true }),
  );
  if (candidates.error || candidates.data.length === 0) {
    return null;
  }

  const nextLevel = candidates.data[0].hierarchy_level;
  const nearestCandidates = candidates.data.filter((candidate) => candidate.hierarchy_level === nextLevel);
  const counts = await getOpenCountByAgent(nearestCandidates.map((candidate) => candidate.user_id));

  nearestCandidates.sort((a, b) => (counts[a.user_id] ?? 0) - (counts[b.user_id] ?? 0));
  return nearestCandidates[0].user_id;
}

async function selectSeniorEscalationAgentForUnassigned(teamId: string): Promise<string | null> {
  const members = await dbQuery<Array<{ user_id: string; hierarchy_level: number }>>(() =>
    supabase.from("team_members").select("user_id, hierarchy_level").eq("team_id", teamId).order("hierarchy_level", { ascending: true }),
  );
  if (members.error || members.data.length === 0) {
    return null;
  }

  const baseLevel = members.data[0].hierarchy_level;
  const seniorLevel = members.data.find((member) => member.hierarchy_level > baseLevel)?.hierarchy_level ?? baseLevel;
  const seniorCandidates = members.data.filter((member) => member.hierarchy_level === seniorLevel);
  const counts = await getOpenCountByAgent(seniorCandidates.map((member) => member.user_id));

  seniorCandidates.sort((a, b) => (counts[a.user_id] ?? 0) - (counts[b.user_id] ?? 0));
  return seniorCandidates[0].user_id;
}

async function topLevelAdminId(): Promise<string | null> {
  const configuredAdminEmail = Object.entries(INTERNAL_ACTOR_ROLES_BY_EMAIL).find(([, role]) => role === "ADMIN")?.[0];
  if (configuredAdminEmail) {
    const admin = await dbQuery<{ id: string }>(() =>
      supabase.from("users").select("id").eq("email", normalizeEmail(configuredAdminEmail)).eq("role", "ADMIN").single(),
    );
    if (!admin.error) {
      return admin.data.id;
    }
  }

  const fallback = await dbQuery<{ id: string }>(() =>
    supabase.from("users").select("id").eq("role", "ADMIN").order("created_at", { ascending: true }).limit(1).single(),
  );

  return fallback.error ? null : fallback.data.id;
}

export async function createTicket(input: {
  customerId: string;
  createdBy: string;
  description: string;
  priority: TicketPriority;
  location: { latitude: number; longitude: number; address: string };
  files?: File[];
}): Promise<Ticket & { attachments: Array<TicketAttachment & { signed_url: string }> }> {
  const userResult = await dbQuery<User>(() => supabase.from("users").select("*").eq("id", input.customerId).single());
  if (userResult.error || !userResult.data.otp_verified_at) {
    throw new Error("OTP verification required before ticket creation");
  }
  const areaId = await resolveAreaIdForUser(userResult.data);
  const routing = await selectTeamAndAgent(areaId);
  const ticketId = crypto.randomUUID();

  const payload = {
    id: ticketId,
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

  const uploadedKeys: string[] = [];
  const attachmentPayload: Array<{
    ticket_id: string;
    file_url: string;
    file_name: string;
    file_type: string;
    file_size: number;
  }> = [];
  const signedUrlByObjectKey: Record<string, string> = {};

  try {
    for (const file of input.files ?? []) {
      const uploaded = await uploadTicketFile(ticketId, file);
      uploadedKeys.push(uploaded.objectKey);
      signedUrlByObjectKey[uploaded.objectKey] = uploaded.signedUrl;
      attachmentPayload.push({
        ticket_id: ticketId,
        file_url: uploaded.objectKey,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
      });
    }

    const ticketResult = await dbQuery<Ticket>(() => supabase.from("tickets").insert(payload).select("*").single());
    if (ticketResult.error) {
      throw ticketResult.error;
    }

    const locationInsert = await supabase.from("locations").insert({
      ticket_id: ticketResult.data.id,
      latitude: input.location.latitude,
      longitude: input.location.longitude,
      address: input.location.address,
      zone_id: areaId,
    });

    if (locationInsert.error) {
      throw new Error(locationInsert.error.message);
    }

    let attachments: Array<TicketAttachment & { signed_url: string }> = [];
    if (attachmentPayload.length > 0) {
      const attachmentsResult = await dbQuery<TicketAttachment[]>(() =>
        supabase.from("ticket_attachments").insert(attachmentPayload).select("*"),
      );

      if (attachmentsResult.error) {
        throw attachmentsResult.error;
      }
      attachments = attachmentsResult.data.map((attachment) => ({
        ...attachment,
        signed_url: signedUrlByObjectKey[attachment.file_url] ?? "",
      }));
    }

    return {
      ...ticketResult.data,
      attachments,
    };
  } catch (error) {
    await supabase.from("tickets").delete().eq("id", ticketId);
    await removeUploadedTicketFiles(uploadedKeys);
    throw error;
  }
}

export async function transitionTicket(ticketId: string, next: TicketStatus, options?: { force?: boolean }): Promise<Ticket> {
  const currentResult = await dbQuery<Ticket>(() => supabase.from("tickets").select("*").eq("id", ticketId).single());
  if (currentResult.error) {
    throw currentResult.error;
  }
  if (!options?.force) {
    assertTransition(currentResult.data.status, next);
  }
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
    const ticketTeamId = ticket.assigned_team_id ?? (await selectTeamAndAgent(ticket.area_id)).teamId;
    const nextInHierarchy = ticketTeamId
      ? fromAgent
        ? await selectNextEscalationAgent(ticketTeamId, fromAgent)
        : await selectSeniorEscalationAgentForUnassigned(ticketTeamId)
      : null;
    const agentId = nextInHierarchy ?? (await topLevelAdminId());

    const nextLevel = ticket.escalation_level + 1;

    await supabase
      .from("tickets")
      .update({
        assigned_team_id: ticketTeamId,
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
