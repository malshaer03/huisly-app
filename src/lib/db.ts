import { createClient } from "@supabase/supabase-js";

let supabase: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

    if (!url || !key) {
      throw new Error(
        "Missing Supabase configuration. Set NEXT_PUBLIC_SUPABASE_URL and either SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY",
      );
    }

    supabase = createClient(url, key);
  }
  return supabase;
}
