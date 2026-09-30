import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./config";

let client: SupabaseClient | undefined;
export const SUPABASE_AUTH_OPTIONS = { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } as const;

export function createClient() {
  if (client) return client;
  const { url, publishableKey } = getSupabaseConfig();
  client = createSupabaseClient(url, publishableKey, {
    auth: SUPABASE_AUTH_OPTIONS,
  });
  return client;
}
