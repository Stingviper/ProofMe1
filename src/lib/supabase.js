import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes("YOUR_PROJECT") &&
    !supabaseAnonKey.includes("YOUR_SUPABASE") &&
    supabaseUrl.startsWith("http")
);

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.warn(
    "[ProofMe] Supabase is not configured. Copy .env.example → .env.local and set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY."
  );
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
