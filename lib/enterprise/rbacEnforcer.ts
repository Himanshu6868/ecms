import { Role } from "@/types/domain";

const PERMISSIONS: Record<Role, Set<string>> = {
  CUSTOMER: new Set(["ticket:create", "ticket:read:own", "chat:write:own"]),
  AGENT: new Set(["ticket:read:team", "ticket:update:assigned", "chat:write:assigned"]),
  SENIOR_AGENT: new Set(["ticket:read:team", "ticket:update:team", "ticket:escalate"]),
  MANAGER: new Set(["ticket:read:team", "ticket:assign:team", "ticket:update:team", "report:read:team"]),
  ADMIN: new Set(["*"]),
};

export function enforcePermission(role: Role, permission: string): void {
  const policy = PERMISSIONS[role];
  if (policy.has("*") || policy.has(permission)) {
    return;
  }
  throw new Error(`RBAC_DENY:${role}:${permission}`);
}
