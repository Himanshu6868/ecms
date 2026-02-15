import { z } from "zod";

const envSchema = z.object({
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
});

const resolvedSecret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
const resolvedAuthUrl =
  process.env.NEXTAUTH_URL ??
  process.env.AUTH_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

export const env = envSchema.parse({
  NEXTAUTH_SECRET: resolvedSecret,
  NEXTAUTH_URL: resolvedAuthUrl,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
});
