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
  area_id uuid null,
  otp_hash text null,
  otp_expires_at timestamptz null,
  otp_retry_count integer not null default 0,
  otp_verified_at timestamptz null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz null
);

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

create index idx_tickets_customer_status on tickets(customer_id, status);
create index idx_tickets_team_status on tickets(assigned_team_id, status);
create index idx_tickets_agent_open on tickets(assigned_agent_id, status) where deleted_at is null;
create index idx_tickets_sla_status on tickets(sla_deadline, status);
create index idx_locations_zone on locations(zone_id);
create index idx_chat_ticket_created on chat_messages(ticket_id, created_at desc);
create index idx_escalation_ticket_time on escalation_history(ticket_id, timestamp desc);

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
  order by open_count asc, tm.hierarchy_level asc
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
