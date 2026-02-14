import { TicketStatus } from "@/types/domain";

const transitions: Record<TicketStatus, readonly TicketStatus[]> = {
  DRAFT: ["OTP_VERIFIED"],
  OTP_VERIFIED: ["CREATED"],
  CREATED: ["ASSIGNED"],
  ASSIGNED: ["IN_PROGRESS"],
  IN_PROGRESS: ["RESOLVED", "SLA_BREACHED"],
  SLA_BREACHED: ["ESCALATED"],
  ESCALATED: ["REASSIGNED"],
  REASSIGNED: ["IN_PROGRESS"],
  RESOLVED: ["CLOSED", "REOPENED"],
  REOPENED: ["IN_PROGRESS"],
  CLOSED: [],
};

export function assertTransition(current: TicketStatus, next: TicketStatus): void {
  if (!transitions[current].includes(next)) {
    throw new Error(`Invalid transition ${current} -> ${next}`);
  }
}
