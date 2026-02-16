export type Role = "CUSTOMER" | "AGENT" | "SENIOR_AGENT" | "MANAGER" | "ADMIN";

export type TicketStatus =
  | "DRAFT"
  | "OTP_VERIFIED"
  | "CREATED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "SLA_BREACHED"
  | "ESCALATED"
  | "REASSIGNED"
  | "RESOLVED"
  | "REOPENED"
  | "CLOSED";

export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  reports_to: string | null;
  area_id: string | null;
  otp_hash: string | null;
  otp_expires_at: string | null;
  otp_retry_count: number;
  otp_verified_at: string | null;
  created_at: string;
}

export interface Ticket {
  id: string;
  customer_id: string;
  created_by: string;
  area_id: string;
  assigned_team_id: string | null;
  assigned_agent_id: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  description: string;
  sla_deadline: string;
  escalation_level: number;
  created_at: string;
  updated_at: string;
}

export interface Area {
  id: string;
  name: string;
  zone_code: string;
}

export interface Team {
  id: string;
  name: string;
  area_id: string;
}

export interface TeamMember {
  user_id: string;
  team_id: string;
  hierarchy_level: number;
}

export interface Location {
  id: string;
  ticket_id: string;
  latitude: number;
  longitude: number;
  address: string;
  zone_id: string;
}

export interface ChatMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

export interface EscalationHistory {
  id: string;
  ticket_id: string;
  from_agent: string | null;
  to_agent: string | null;
  level: number;
  timestamp: string;
}

export interface TicketAttachment {
  id: string;
  ticket_id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  created_at: string;
}
