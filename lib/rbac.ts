import { Role } from "@/types/domain";
import { TicketStatus } from "@/types/domain";

const hierarchy: Role[] = ["CUSTOMER", "AGENT", "SENIOR_AGENT", "MANAGER", "ADMIN"];

export function hasRole(userRole: Role, minimumRole: Role): boolean {
  return hierarchy.indexOf(userRole) >= hierarchy.indexOf(minimumRole);
}

export function canViewAdmin(role: Role): boolean {
  return hasRole(role, "SENIOR_AGENT");
}

export function canManageTicket(role: Role): boolean {
  return hasRole(role, "AGENT");
}

export function canAssignTicket(role: Role): boolean {
  return role === "MANAGER" || role === "ADMIN";
}

export function canTransitionTicketTo(role: Role, nextStatus: TicketStatus): boolean {
  if (role === "ADMIN") {
    return true;
  }

  if (role === "MANAGER" || role === "SENIOR_AGENT") {
    return !["DRAFT", "OTP_VERIFIED"].includes(nextStatus);
  }

  if (role === "AGENT") {
    return ["IN_PROGRESS", "RESOLVED", "CLOSED", "REOPENED"].includes(nextStatus);
  }

  return false;
}
