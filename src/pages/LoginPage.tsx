import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { AlertCircle, ArrowLeft, CheckCircle2, FlaskConical, Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import { useAuth } from "@/lib/auth";

type Mode = "signin" | "signup" | "forgot";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { user, loading, configured, signInWithPassword, signUpWithPassword, signInWithGoogle, resetPassword } = useAuth();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const next = params.get("next") || "/app";

  useEffect(() => {
    if (params.get("confirmed") === "1") {
      setInfo("Tu email se ha confirmado. Ya puedes iniciar sesión.");
    } else if (params.get("reset") === "1") {
      setInfo("Sigue las instrucciones del correo para restablecer tu contraseña.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loading && user) {
      navigate(next, { replace: true });
    }
  }, [user, loading, navigate, next]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!email || (mode !== "forgot" && !password)) {
      setError("Rellena todos los campos");
      return;
    }
    if (mode === "signup" && password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "signin") {
        const { error } = await signInWithPassword(email, password);
        if (error) setError(error);
        else {
          toast.success("Sesión iniciada");
          navigate(next, { replace: true });
        }
      } else if (mode === "signup") {
        const { error, needsConfirmation } = await signUpWithPassword(email, password);
        if (error) setError(error);
        else if (needsConfirmation) {
          setInfo("Te hemos enviado un email. Confirma tu cuenta para continuar.");
          toast.success("Cuenta creada. Revisa tu correo.");
        } else {
          toast.success("¡Bienvenido a Pubdle!");
          navigate(next, { replace: true });
        }
      } else {
        const { error } = await resetPassword(email);
        if (error) setError(error);
        else {
          setInfo("Si la cuenta existe, recibirás un correo con instrucciones.");
          toast.success("Correo enviado");
        }
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setSubmitting(true);
    try {
      const redirectTo = `${window.location.origin}${next}`;
      const { error } = await signInWithGoogle(redirectTo);
      if (error) {
        setError(error);
        setSubmitting(false);
      }
      // En éxito hay redirect del navegador
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al iniciar sesión con Google");
      setSubmitting(false);
    }
  }

  if (!configured) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-amber-400/30 bg-amber-500/5 p-8 text-center">
          <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-4" />
          <h1 className="font-serif text-2xl font-bold mb-3">Auth no configurada</h1>
          <p className="text-[var(--color-muted-foreground)] mb-6 text-sm leading-relaxed">
            Las variables <code className="font-mono text-xs">VITE_SUPABASE_URL</code> y{" "}
            <code className="font-mono text-xs">VITE_SUPABASE_ANON_KEY</code> no están definidas.
            Añádelas a tu <code className="font-mono text-xs">.env</code> y reinicia el servidor.
          </p>
          <Link href="/">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col">
      <header className="container py-5">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/40 flex items-center justify-center">
            <FlaskConical className="w-4 h-4 text-[var(--color-primary)]" />
          </div>
          <span className="font-serif text-xl font-bold gradient-text">Pubdle</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 pb-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
              {mode === "signin" && "Bienvenido de nuevo"}
              {mode === "signup" && "Crea tu cuenta"}
              {mode === "forgot" && "Recuperar contraseña"}
            </h1>
            <p className="text-[var(--color-muted-foreground)] text-sm">
              {mode === "signin" && "Inicia sesión para gestionar tu suscripción y favoritos."}
              {mode === "signup" && "Únete a Pubdle gratis. Solo necesitarás cuenta para suscribirte."}
              {mode === "forgot" && "Te enviaremos un email para que crees una nueva contraseña."}
            </p>
          </div>

          {mode !== "forgot" && (
            <>
              <button
                type="button"
                onClick={handleGoogle}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] hover:bg-[var(--color-muted)] transition-colors text-sm font-medium disabled:opacity-50"
              >
                <GoogleIcon className="w-4 h-4" />
                Continuar con Google
              </button>
              <div className="my-5 flex items-center gap-3">
                <div className="flex-1 h-px bg-[var(--color-border)]" />
                <span className="text-xs text-[var(--color-muted-foreground)] uppercase tracking-wider">o</span>
                <div className="flex-1 h-px bg-[var(--color-border)]" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              icon={Mail}
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={setEmail}
              autoComplete="email"
            />

            {mode !== "forgot" && (
              <Field
                icon={Lock}
                type="password"
                placeholder={mode === "signup" ? "Contraseña (mín. 6 caracteres)" : "Contraseña"}
                value={password}
                onChange={setPassword}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />
            )}

            {error && (
              <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {info && (
              <div className="flex items-start gap-2 text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{info}</span>
              </div>
            )}

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "signin" && "Iniciar sesión"}
              {mode === "signup" && "Crear cuenta"}
              {mode === "forgot" && "Enviar correo"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-[var(--color-muted-foreground)] space-y-2">
            {mode === "signin" && (
              <>
                <p>
                  ¿No tienes cuenta?{" "}
                  <button onClick={() => { setMode("signup"); setError(null); setInfo(null); }} className="text-[var(--color-primary)] hover:underline">
                    Crear cuenta
                  </button>
                </p>
                <p>
                  <button onClick={() => { setMode("forgot"); setError(null); setInfo(null); }} className="hover:text-[var(--color-foreground)]">
                    ¿Olvidaste tu contraseña?
                  </button>
                </p>
              </>
            )}
            {mode === "signup" && (
              <p>
                ¿Ya tienes cuenta?{" "}
                <button onClick={() => { setMode("signin"); setError(null); setInfo(null); }} className="text-[var(--color-primary)] hover:underline">
                  Iniciar sesión
                </button>
              </p>
            )}
            {mode === "forgot" && (
              <p>
                <button onClick={() => { setMode("signin"); setError(null); setInfo(null); }} className="text-[var(--color-primary)] hover:underline">
                  ← Volver a iniciar sesión
                </button>
              </p>
            )}
          </div>

          <p className="mt-8 text-center text-xs text-[var(--color-muted-foreground)]/70">
            Al crear una cuenta aceptas que guardemos tu correo y datos básicos de sesión.
          </p>
        </div>
      </main>
    </div>
  );
}

function Field({
  icon: Icon,
  type,
  placeholder,
  value,
  onChange,
  autoComplete,
}: {
  icon: typeof Mail;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  return (
    <div className="relative">
      <Icon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)]/50"
      />
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}
