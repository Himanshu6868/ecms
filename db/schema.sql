create extension if not exists pgcrypto;

create type role_enum as enum ('CUSTOMER', 'AGENT', 'SENIOR_AGENT', 'MANAGER', 'ADMIN');
create type ticket_status_enum as enum (
  'DRAFT','OTP_VERIFIED','CREATED','ASSIGNED','IN_PROGRESS','SLA_BREACHED','ESCALATED','REASSIGNED','RESOLVED','REOPENED','CLOSED'
);
create type priority_enum as enum ('LOW','MEDIUM','HIGH','CRITICAL');

create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  role role_enum not null default 'CUSTOMER',
  reports_to uuid null,
  area_id uuid null,
  otp_hash text null,
  otp_expires_at timestamptz null,
  otp_retry_count integer not null default 0,
  otp_verified_at timestamptz null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz null
);

alter table users add constraint fk_users_reports_to foreign key (reports_to) references users(id) on delete set null;

create table areas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  zone_code text not null unique,
  created_at timestamptz not null default now(),
  deleted_at timestamptz null
);

alter table users add constraint fk_users_area foreign key (area_id) references areas(id) on delete set null;

create table teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  area_id uuid not null references areas(id) on delete restrict,
  created_at timestamptz not null default now(),
  deleted_at timestamptz null
);

create table team_members (
  user_id uuid not null references users(id) on delete restrict,
  team_id uuid not null references teams(id) on delete cascade,
  hierarchy_level integer not null check (hierarchy_level >= 1),
  created_at timestamptz not null default now(),
  primary key (user_id, team_id)
);

create table tickets (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references users(id) on delete restrict,
  created_by uuid not null references users(id) on delete restrict,
  area_id uuid not null references areas(id) on delete restrict,
  assigned_team_id uuid null references teams(id) on delete set null,
  assigned_agent_id uuid null references users(id) on delete set null,
  status ticket_status_enum not null,
  priority priority_enum not null,
  description text not null,
  sla_deadline timestamptz not null,
  escalation_level integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null
);

create table locations (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references tickets(id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  address text not null,
  zone_id uuid not null,
  created_at timestamptz not null default now()
);

create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references tickets(id) on delete cascade,
  sender_id uuid not null references users(id) on delete restrict,
  message text not null,
  created_at timestamptz not null default now()
);

create table escalation_history (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references tickets(id) on delete cascade,
  from_agent uuid null references users(id) on delete set null,
  to_agent uuid null references users(id) on delete set null,
  level integer not null,
  timestamp timestamptz not null default now()
);

create table ticket_attachments (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references tickets(id) on delete cascade,
  file_url text not null,
  file_name text not null,
  file_type text not null,
  file_size bigint not null check (file_size > 0),
  created_at timestamptz not null default now()
);

create index idx_tickets_customer_status on tickets(customer_id, status);
create index idx_tickets_team_status on tickets(assigned_team_id, status);
create index idx_tickets_agent_open on tickets(assigned_agent_id, status) where deleted_at is null;
create index idx_tickets_sla_status on tickets(sla_deadline, status);
create index idx_locations_zone on locations(zone_id);
create index idx_chat_ticket_created on chat_messages(ticket_id, created_at desc);
create index idx_escalation_ticket_time on escalation_history(ticket_id, timestamp desc);
create index idx_ticket_attachments_ticket_created on ticket_attachments(ticket_id, created_at desc);

create or replace function least_loaded_agent(target_team_id uuid)
returns table (user_id uuid, open_count bigint)
language sql
as $$
  select tm.user_id,
    coalesce(count(t.id), 0) as open_count
  from team_members tm
  left join tickets t on t.assigned_agent_id = tm.user_id
    and t.status in ('CREATED','ASSIGNED','IN_PROGRESS','SLA_BREACHED','ESCALATED','REASSIGNED','REOPENED')
    and t.deleted_at is null
  where tm.team_id = target_team_id
  group by tm.user_id
  order by open_count asc, min(tm.hierarchy_level) asc
  limit 1;
$$;

create or replace function ticket_status_analytics()
returns table (status text, count bigint)
language sql
as $$
  select status::text, count(*)
  from tickets
  where deleted_at is null
  group by status;
$$;

-- Enterprise extensions for workflow, SLA automation, compliance, and auditability.
create type workflow_event_source_enum as enum ('SYSTEM','USER','API','CRON','QUEUE');
create type sla_timer_status_enum as enum ('RUNNING','PAUSED','BREACHED','COMPLETED','CANCELLED');
create type escalation_status_enum as enum ('PENDING','IN_PROGRESS','SUCCESS','FAILED','EXHAUSTED');
create type notification_channel_enum as enum ('EMAIL','SMS','PUSH','WEBHOOK','IN_APP');
create type notification_status_enum as enum ('QUEUED','DISPATCHED','FAILED','DEAD_LETTER');
create type audit_severity_enum as enum ('INFO','WARNING','CRITICAL');
create type retention_action_enum as enum ('ARCHIVE','PURGE','ANONYMIZE');
create type incident_status_enum as enum ('OPEN','INVESTIGATING','MITIGATED','CLOSED');

create table workflow_definitions (
  id uuid primary key default gen_random_uuid(),
  workflow_key text not null unique,
  name text not null,
  version integer not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table workflow_states (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references workflow_definitions(id) on delete cascade,
  state_key text not null,
  is_terminal boolean not null default false,
  sla_policy_id uuid null,
  unique (workflow_id, state_key)
);

create table workflow_transitions (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references workflow_definitions(id) on delete cascade,
  from_state_key text not null,
  to_state_key text not null,
  required_role role_enum null,
  requires_approval boolean not null default false,
  created_at timestamptz not null default now(),
  unique (workflow_id, from_state_key, to_state_key)
);

create table workflow_instances (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null unique references tickets(id) on delete cascade,
  workflow_id uuid not null references workflow_definitions(id) on delete restrict,
  current_state_key text not null,
  version integer not null default 1,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table workflow_history (
  id uuid primary key default gen_random_uuid(),
  workflow_instance_id uuid not null references workflow_instances(id) on delete cascade,
  ticket_id uuid not null references tickets(id) on delete cascade,
  from_state_key text not null,
  to_state_key text not null,
  actor_id uuid null references users(id) on delete set null,
  event_source workflow_event_source_enum not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table sla_policies (
  id uuid primary key default gen_random_uuid(),
  policy_key text not null unique,
  priority priority_enum not null,
  response_target_seconds integer not null check (response_target_seconds > 0),
  resolution_target_seconds integer not null check (resolution_target_seconds > 0),
  breach_threshold_seconds integer not null check (breach_threshold_seconds > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table sla_timers (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references tickets(id) on delete cascade,
  workflow_instance_id uuid null references workflow_instances(id) on delete set null,
  policy_id uuid not null references sla_policies(id) on delete restrict,
  timer_name text not null,
  status sla_timer_status_enum not null default 'RUNNING',
  started_at timestamptz not null default now(),
  due_at timestamptz not null,
  breached_at timestamptz null,
  completed_at timestamptz null,
  last_evaluated_at timestamptz null,
  retry_count integer not null default 0,
  idempotency_key text not null unique
);

create table escalation_rules (
  id uuid primary key default gen_random_uuid(),
  rule_key text not null unique,
  priority priority_enum null,
  min_escalation_level integer not null default 1,
  max_escalation_level integer not null default 10,
  target_role role_enum null,
  notify_channels notification_channel_enum[] not null default '{EMAIL,IN_APP}',
  cooldown_seconds integer not null default 300,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table escalation_events (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references tickets(id) on delete cascade,
  sla_timer_id uuid null references sla_timers(id) on delete set null,
  rule_id uuid null references escalation_rules(id) on delete set null,
  from_agent uuid null references users(id) on delete set null,
  to_agent uuid null references users(id) on delete set null,
  previous_level integer not null,
  new_level integer not null,
  status escalation_status_enum not null default 'PENDING',
  reason text not null,
  correlation_id text not null,
  created_at timestamptz not null default now(),
  unique (correlation_id)
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid null references tickets(id) on delete cascade,
  recipient_user_id uuid null references users(id) on delete cascade,
  channel notification_channel_enum not null,
  template_key text not null,
  payload jsonb not null,
  status notification_status_enum not null default 'QUEUED',
  retries integer not null default 0,
  next_retry_at timestamptz null,
  idempotency_key text not null unique,
  created_at timestamptz not null default now(),
  dispatched_at timestamptz null
);

create table audit_log_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  severity audit_severity_enum not null default 'INFO',
  actor_id uuid null references users(id) on delete set null,
  actor_role role_enum null,
  ticket_id uuid null references tickets(id) on delete set null,
  resource_type text not null,
  resource_id text null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  ip_address inet null,
  user_agent text null,
  hash_prev text null,
  hash_current text not null,
  created_at timestamptz not null default now()
);

create table compliance_retention_policies (
  id uuid primary key default gen_random_uuid(),
  policy_key text not null unique,
  resource_type text not null,
  retention_days integer not null check (retention_days > 0),
  action retention_action_enum not null,
  legal_hold_supported boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table data_retention_jobs (
  id uuid primary key default gen_random_uuid(),
  policy_id uuid not null references compliance_retention_policies(id) on delete restrict,
  resource_type text not null,
  resource_id text not null,
  due_at timestamptz not null,
  status text not null default 'SCHEDULED',
  executed_at timestamptz null,
  result jsonb null,
  created_at timestamptz not null default now(),
  unique (policy_id, resource_type, resource_id)
);

create table consent_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  consent_type text not null,
  consent_version text not null,
  granted boolean not null,
  captured_at timestamptz not null default now(),
  revoked_at timestamptz null,
  metadata jsonb not null default '{}'::jsonb
);

create table incidents (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid null references tickets(id) on delete set null,
  incident_key text not null unique,
  title text not null,
  description text not null,
  severity audit_severity_enum not null,
  status incident_status_enum not null default 'OPEN',
  owner_id uuid null references users(id) on delete set null,
  detected_at timestamptz not null default now(),
  resolved_at timestamptz null
);

create table penalty_rules (
  id uuid primary key default gen_random_uuid(),
  rule_key text not null unique,
  priority priority_enum null,
  delay_threshold_minutes integer not null,
  formula text not null,
  max_penalty numeric(12,2) not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table penalty_events (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references tickets(id) on delete cascade,
  rule_id uuid not null references penalty_rules(id) on delete restrict,
  delay_minutes integer not null,
  penalty_amount numeric(12,2) not null,
  calculated_at timestamptz not null default now(),
  idempotency_key text not null unique
);

create table system_configurations (
  id uuid primary key default gen_random_uuid(),
  config_key text not null unique,
  config_value jsonb not null,
  updated_by uuid null references users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table case_metrics_daily (
  metric_date date not null,
  total_created bigint not null default 0,
  total_closed bigint not null default 0,
  sla_breached bigint not null default 0,
  avg_resolution_seconds bigint not null default 0,
  primary key (metric_date)
);

create index idx_workflow_instances_ticket on workflow_instances(ticket_id, current_state_key);
create index idx_workflow_history_ticket_created on workflow_history(ticket_id, created_at desc);
create index idx_sla_timers_due_status on sla_timers(status, due_at);
create index idx_escalation_events_ticket_created on escalation_events(ticket_id, created_at desc);
create index idx_notifications_status_retry on notifications(status, next_retry_at);
create index idx_audit_ticket_created on audit_log_events(ticket_id, created_at desc);
create index idx_retention_jobs_due_status on data_retention_jobs(status, due_at);
create index idx_incidents_status_detected on incidents(status, detected_at desc);
create index idx_tickets_status_created_at on tickets(status, created_at desc);
create index idx_tickets_priority_deadline on tickets(priority, sla_deadline) where deleted_at is null;

create or replace function prevent_audit_log_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'audit_log_events is immutable';
end;
$$;

create trigger trg_audit_log_no_update
before update or delete on audit_log_events
for each row execute procedure prevent_audit_log_mutation();
