# ECMS - Escalation & Complaint Management System

A production-style ticketing platform built with **Next.js App Router + Supabase** that supports:

- OTP login (currently shown on-screen for development)
- External and internal login flows
- Role-based operations (member, manager, super admin)
- SLA-based escalation
- Team-scoped assignment
- Chat between ticket creator/customer and assigned agent
- Modern UI using shadcn-style components + motion

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Current Product Scope](#current-product-scope)
3. [Role & Hierarchy Model](#role--hierarchy-model)
4. [Authentication & OTP Flow](#authentication--otp-flow)
5. [Ticket Flow](#ticket-flow)
6. [Chat Flow](#chat-flow)
7. [SLA & Escalation Flow](#sla--escalation-flow)
8. [Admin User-Creation Flow](#admin-user-creation-flow)
9. [Access Control Matrix](#access-control-matrix)
10. [Project Structure](#project-structure)
11. [Environment Variables](#environment-variables)
12. [Database Setup](#database-setup)
13. [Run Locally](#run-locally)
14. [Vercel Deployment](#vercel-deployment)
15. [API Summary](#api-summary)
16. [Known Notes / Next Improvements](#known-notes--next-improvements)

---

## Tech Stack

- **Framework**: Next.js 16 (App Router, Server Actions, Route Handlers)
- **Language**: TypeScript
- **Auth**: NextAuth (Credentials + OTP verification)
- **Database**: Supabase Postgres (`@supabase/supabase-js`)
- **Validation**: Zod
- **UI**: Tailwind CSS v4 + shadcn-style UI primitives + Radix Select/Label
- **Motion**: Framer Motion

---

## Current Product Scope

- Separate login entry points:
  - `/login/external` for customer/external users
  - `/login/internal` for internal support hierarchy
- External users can create tickets and see their own ticket space.
- Internal users can operate tickets via dashboard tabs and status/assignment controls based on role.
- Super admin can create internal users with reporting hierarchy from the admin panel.

---

## Role & Hierarchy Model

Roles used in app:

- `CUSTOMER`
- `AGENT` (support member)
- `SENIOR_AGENT`
- `MANAGER` (admin level, team-scoped assignment)
- `ADMIN` (super admin / top level)

Configured internal actor mapping file:

- `lib/internalActors.ts`

Reporting hierarchy is stored in DB:

- `users.reports_to`

---

## Authentication & OTP Flow

### Login routes

- `/login` -> flow selector
- `/login/external` -> external flow
- `/login/internal` -> internal flow

### OTP behavior (current)

1. User enters email and requests OTP.
2. Backend validates flow + role access.
3. OTP is generated, hashed (`bcrypt`), expiry set (5 mins), retry count incremented.
4. OTP is returned to UI (development mode) and shown in status text.
5. On sign-in, OTP hash is verified and `otp_verified_at` is set.

> Production email/SMS providers are not active yet.

---

## Ticket Flow

1. Logged-in user creates ticket from `/tickets/new`.
2. Location is auto-captured from browser geolocation (no manual lat/long input).
3. Ticket is inserted with SLA deadline based on priority.
4. If team/agent is available, ticket can be assigned; otherwise it stays open for internal handling.
5. External users see their own ticket scope, internal users get operational board access.

---

## Chat Flow

Chat is restricted to ticket participants only:

- Ticket customer/creator
- Currently assigned agent

Enforced in:

- `app/api/tickets/[id]/chat/route.ts`
- `app/tickets/[id]/page.tsx` (UI + server action)

If user is not a participant, chat read/write is blocked (`403` or hidden input UI).

---

## SLA & Escalation Flow

SLA is priority-based (currently shortened for testing in `lib/ticketService.ts`).

When SLA breaches:

1. Ticket is escalated level-by-level using team hierarchy (`team_members.hierarchy_level`).
2. Next higher member is selected (least-loaded among same next level).
3. If no higher member found, fallback to top admin.
4. Escalation history is written to `escalation_history`.

SLA monitor endpoint:

- `GET /api/cron/sla`

---

## Admin User-Creation Flow

Super admin-only feature in `/admin`:

- Create **Member**, **Manager**, or **Super Admin**
- Required reporting logic:
  - Member -> must select reporting manager
  - Manager -> must select reporting super admin
  - Super admin -> no reporting user

API:

- `GET /api/admin/users` (fetch managers/super-admins for dropdowns)
- `POST /api/admin/users` (create internal user with hierarchy validation)

UI component:

- `components/AdminUserCreator.tsx`

---

## Access Control Matrix

### Super Admin (`ADMIN`)

- Full ticket status control
- Assign any ticket to any member
- Create internal users (member/manager/super admin)

### Manager (`MANAGER`)

- Ticket assignment allowed only within own team membership
- Broader transition permissions than member

### Member (`AGENT` internal)

- Can update status only for tickets assigned to them
- In dashboard:
  - `All Tickets` tab -> view only (no status controls)
  - `Assigned to Me` tab -> status controls enabled

### External User (`CUSTOMER` / external `AGENT`)

- Own ticket space only
- Create tickets
- Can participate in chat only if ticket participant

---

## Project Structure

```text
app/
  (auth)/login/...
  (dashboard)/...
  admin/page.tsx
  tickets/new/page.tsx
  tickets/[id]/page.tsx
  api/
    otp/request
    otp/verify
    tickets/
    admin/users
    cron/sla
components/
  AuthForm.tsx
  TicketCreateForm.tsx
  TicketTable.tsx
  InternalTicketBoard.tsx
  AdminCockpit.tsx
  AdminUserCreator.tsx
  ui/
lib/
  auth.ts
  db.ts
  env.ts
  internalActors.ts
  rbac.ts
  stateMachine.ts
  ticketService.ts
  validations.ts
db/
  schema.sql
```

---

## Environment Variables

Create `ecms/.env.local` (or set in Vercel):

```env
NEXTAUTH_SECRET=replace_with_32_plus_char_secret
NEXTAUTH_URL=http://localhost:3000
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

`lib/env.ts` includes fallbacks for deploy environments:

- `AUTH_SECRET` fallback for secret
- `AUTH_URL` / `VERCEL_URL` fallback for auth URL

---

## Database Setup

1. Open Supabase SQL Editor.
2. Run full `db/schema.sql`.
3. Ensure this migration exists for hierarchy:

```sql
alter table users add column if not exists reports_to uuid null;
alter table users
  add constraint fk_users_reports_to
  foreign key (reports_to) references users(id) on delete set null;
```

4. Ensure team data exists (`teams`, `team_members`) for assignment/escalation behavior.

---

## Run Locally

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run lint
npm run build
```

---

## Vercel Deployment

1. Import repo to Vercel.
2. Set environment variables in project settings.
3. Recommended production values:
   - `NEXTAUTH_URL=https://<your-domain>`
   - `NEXTAUTH_SECRET=<secure-secret>`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Add cron (optional): call `/api/cron/sla` on schedule.
5. Deploy.

---

## API Summary

### Auth/OTP

- `POST /api/otp/request`
- `POST /api/otp/verify`
- `GET/POST /api/auth/[...nextauth]`

### Tickets

- `GET /api/tickets`
- `POST /api/tickets`
- `POST /api/tickets/[id]/transition`
- `POST /api/tickets/[id]/assign`
- `GET/POST /api/tickets/[id]/chat`

### Admin

- `GET /api/admin/users`
- `POST /api/admin/users`

### SLA

- `GET /api/cron/sla`

---

## Known Notes / Next Improvements

- OTP delivery is currently UI-visible for dev; integrate email/SMS provider for production.
- Add richer audit logs for assignment/transition actor metadata.
- Add pagination + server filters in internal board tables.
- Add explicit “chat participant” labels (customer vs assigned agent) in UI.
