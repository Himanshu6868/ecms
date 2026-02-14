import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

type QueryResult<T> = { data: T; error: null } | { data: null; error: Error };

export async function dbQuery<T>(executor: () => Promise<{ data: T | null; error: { message: string } | null }>): Promise<QueryResult<T>> {
  const { data, error } = await executor();
  if (error || !data) {
    return { data: null, error: new Error(error?.message ?? "Database operation failed") };
  }
  return { data, error: null };
}
