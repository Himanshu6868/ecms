const z = require('zod');
require('dotenv').config({ path: '.env' });
const envSchema = z.object({
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  SUPABASE_STORAGE_BUCKET: z.string().min(3),
  TICKET_UPLOAD_MAX_BYTES: z.coerce.number().int().positive().default(5 * 1024 * 1024),
  TICKET_UPLOAD_SIGNED_URL_TTL_SECONDS: z.coerce.number().int().positive().default(3600),
});
const res = envSchema.safeParse(process.env);
if (!res.success) {
  console.error('validation failed', res.error.format());
  process.exit(1);
}
console.log('parsed env okay');
