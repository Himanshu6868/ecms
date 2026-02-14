# Geo-based Ticket Tracking System

Production-ready SSR-first ticket tracking system using Next.js App Router, Tailwind CSS, NextAuth credentials OTP flow, and Supabase PostgreSQL.

## Architecture

- `app/(auth)` - OTP login UI
- `app/(dashboard)` - protected dashboard
- `app/tickets` - ticket create and detail SSR pages
- `app/admin` - RBAC-protected admin panel
- `app/api` - route handlers for OTP, tickets, chat, transitions, and SLA cron
- `lib/db.ts` - centralized database utility
- `lib/auth.ts` - NextAuth configuration
- `lib/validations.ts` - zod schemas
- `lib/rbac.ts` - role checks
- `lib/stateMachine.ts` - strict ticket transition validation
- `lib/ticketService.ts` - business rules and escalation engine
- `middleware.ts` - role-aware edge middleware protection
- `db/schema.sql` - Supabase PostgreSQL schema and SQL functions

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Add `.env.local`:
   ```bash
   NEXTAUTH_SECRET=replace_with_32_plus_char_secret
   NEXTAUTH_URL=http://localhost:3000
   SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
   ```
3. Apply SQL schema in Supabase SQL editor using `db/schema.sql`.
4. Start app:
   ```bash
   npm run dev
   ```

## Vercel Deployment

- Import repository into Vercel.
- Set all environment variables in Project Settings.
- Configure Vercel Cron to call `/api/cron/sla` on schedule.
- Deploy.

## Security + Rules

- OTP validity: 5 minutes, retry limit 5.
- Ticket creation blocked until OTP verification.
- Strict state machine enforcement for all transitions.
- RBAC enforced in middleware, API handlers, and UI routes.
- Immutable audit trail via append-only `chat_messages` and `escalation_history`.
- Soft delete fields (`deleted_at`) included for retention and no hard-deletes.
