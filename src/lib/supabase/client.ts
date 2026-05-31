import { createClient as _create } from "@supabase/supabase-js";

// Singleton — one shared instance per browser session.
// Uses localStorage for session persistence (no cookie/SSR complexity).
let _instance: ReturnType<typeof _create> | null = null;

export function createClient() {
  if (typeof window === "undefined") {
    // Server context — return a one-off (never used for auth)
    return _create(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  if (!_instance) {
    _instance = _create(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          storageKey: "baii-auth",
          storage: window.localStorage,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }
    );
  }
  return _instance;
}
