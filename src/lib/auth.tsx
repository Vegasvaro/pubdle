import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "./supabase";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  configured: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithPassword: (email: string, password: string) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  signInWithGoogle: (redirectTo?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: "Auth no configurada" };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUpWithPassword = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: "Auth no configurada", needsConfirmation: false };
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login?confirmed=1`,
      },
    });
    if (error) return { error: error.message, needsConfirmation: false };
    // Cuando "Confirm email" está activado en Supabase, session viene a null.
    const needsConfirmation = !data.session;
    return { error: null, needsConfirmation };
  }, []);

  const signInWithGoogle = useCallback(async (redirectTo?: string) => {
    if (!supabase) return { error: "Auth no configurada" };
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectTo ?? `${window.location.origin}/app`,
      },
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!supabase) return { error: "Auth no configurada" };
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login?reset=1`,
    });
    return { error: error?.message ?? null };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      configured: isSupabaseConfigured,
      signInWithPassword,
      signUpWithPassword,
      signInWithGoogle,
      signOut,
      resetPassword,
    }),
    [session, loading, signInWithPassword, signUpWithPassword, signInWithGoogle, signOut, resetPassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}

/** Helper para mostrar las iniciales en el avatar. */
export function getInitials(user: User | null | undefined): string {
  if (!user) return "?";
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const name = (meta.full_name || meta.name) as string | undefined;
  if (name && typeof name === "string") {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const second = parts[1]?.[0] ?? "";
    return (first + second).toUpperCase() || (user.email?.[0] ?? "?").toUpperCase();
  }
  return (user.email?.[0] ?? "?").toUpperCase();
}

/** Nombre amigable para mostrar (full_name si existe, si no la parte local del email). */
export function getDisplayName(user: User | null | undefined): string {
  if (!user) return "";
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const name = (meta.full_name || meta.name) as string | undefined;
  if (name && typeof name === "string") return name;
  return user.email?.split("@")[0] ?? "Usuario";
}
