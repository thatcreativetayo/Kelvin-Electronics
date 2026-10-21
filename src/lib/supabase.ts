import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseEnv } from "@/lib/env";

/**
 * Browser-safe client. Only used for public reads (published products, stock).
 * Row level security must allow those reads and nothing else.
 */
export function createPublicClient(): SupabaseClient | null {
  if (!supabaseEnv.url || !supabaseEnv.anonKey) return null;
  return createClient(supabaseEnv.url, supabaseEnv.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Service-role client. Never import this from a client component.
 * Privileged operations (orders, stock movements, totals) live server-side only.
 */
export function createAdminClient(): SupabaseClient | null {
  if (!supabaseEnv.url || !supabaseEnv.serviceRoleKey) return null;
  return createClient(supabaseEnv.url, supabaseEnv.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
