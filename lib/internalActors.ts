import { Role } from "@/types/domain";

export const INTERNAL_ACTOR_ROLES_BY_EMAIL: Record<string, Role> = {
  "himanshuyadav@gmail.com": "AGENT",
  "himanshu@gmail.com": "SENIOR_AGENT",
  "himanshuyadav3519@gmail.com": "ADMIN",
  "support.member1.demo@gmail.com": "AGENT",
  "": "AGENT",
  "support.lead1.demo@gmail.com": "SENIOR_AGENT",
  "admin.ops1.demo@gmail.com": "MANAGER",
  "super.admin1.demo@gmail.com": "ADMIN",
};

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function roleForInternalActorEmail(email: string): Role | null {
  const normalized = normalizeEmail(email);
  return INTERNAL_ACTOR_ROLES_BY_EMAIL[normalized] ?? null;
}

export function isInternalActorEmail(email: string): boolean {
  return roleForInternalActorEmail(email) !== null;
}

export const INTERNAL_UPPER_ROLES: Role[] = ["SENIOR_AGENT", "MANAGER", "ADMIN"];

export function isInternalUserContext(input: { email: string; role: Role; reportsTo: string | null }): boolean {
  if (["SENIOR_AGENT", "MANAGER", "ADMIN"].includes(input.role)) {
    return true;
  }

  if (input.role === "AGENT") {
    return Boolean(input.reportsTo) || isInternalActorEmail(input.email);
  }

  return false;
}
