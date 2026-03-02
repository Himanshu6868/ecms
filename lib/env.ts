import { z } from "zod";

const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  SUPABASE_STORAGE_BUCKET: z.string().min(3),
  TICKET_UPLOAD_MAX_BYTES: z.coerce.number().int().positive().default(5 * 1024 * 1024),
  TICKET_UPLOAD_SIGNED_URL_TTL_SECONDS: z.coerce.number().int().positive().default(3600),
});

export const env = envSchema.parse({
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET,
  TICKET_UPLOAD_MAX_BYTES: process.env.TICKET_UPLOAD_MAX_BYTES,
  TICKET_UPLOAD_SIGNED_URL_TTL_SECONDS: process.env.TICKET_UPLOAD_SIGNED_URL_TTL_SECONDS,
});
