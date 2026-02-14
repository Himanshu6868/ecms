import { Role } from "@/types/domain";

const hierarchy: Role[] = ["CUSTOMER", "AGENT", "SENIOR_AGENT", "MANAGER", "ADMIN"];

export function hasRole(userRole: Role, minimumRole: Role): boolean {
  return hierarchy.indexOf(userRole) >= hierarchy.indexOf(minimumRole);
}

export function canViewAdmin(role: Role): boolean {
  return hasRole(role, "MANAGER");
}

export function canManageTicket(role: Role): boolean {
  return hasRole(role, "AGENT");
}
