import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** True si las dos variables de entorno están configuradas. */
export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * Cliente de Supabase. Si las variables de entorno no están definidas se devuelve
 * `null` y la UI muestra el aviso correspondiente en lugar de fallar.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "pubdle:auth",
      },
    })
  : null;
