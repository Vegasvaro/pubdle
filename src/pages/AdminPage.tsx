import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Lock, LogOut, Shield } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { isAdmin, setAdmin, setTier, getTier, type Tier } from "@/lib/storage";
import { verifyAdminPassword, ADMIN_PASSWORD_HASH } from "@/lib/config";

export default function AdminPage() {
  const [, navigate] = useLocation();
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [tier, setTierState] = useState<Tier>(getTier());

  useEffect(() => {
    setAuthed(isAdmin());
  }, []);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ADMIN_PASSWORD_HASH) {
      toast.error("Admin no configurado. Define ADMIN_PASSWORD_HASH en src/lib/config.ts.");
      return;
    }
    setSubmitting(true);
    try {
      const ok = await verifyAdminPassword(password);
      if (ok) {
        setAdmin(true);
        setAuthed(true);
        toast.success("Acceso admin concedido");
      } else {
        toast.error("Contraseña incorrecta");
      }
    } finally {
      setSubmitting(false);
      setPassword("");
    }
  };

  const onLogout = () => {
    setAdmin(false);
    setAuthed(false);
    toast.message("Sesión admin cerrada");
    navigate("/");
  };

  const changeTier = (next: Tier) => {
    setTier(next);
    setTierState(next);
    toast.success(`Plan cambiado a ${next === "free" ? "Gratis" : next === "basic" ? "Basic" : "Pro"}`);
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <Navbar />
        <div className="container py-16 max-w-md mx-auto">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-8">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/40 flex items-center justify-center mb-6 animate-pulse-glow">
              <Lock className="w-6 h-6 text-[var(--color-primary)]" />
            </div>
            <h1 className="font-serif text-2xl font-bold mb-2">Acceso restringido</h1>
            <p className="text-sm text-[var(--color-muted-foreground)] mb-6">
              Introduce la contraseña de administrador para acceder al panel.
            </p>
            <form onSubmit={onLogin} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña admin"
                autoFocus
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-input)] border border-[var(--color-border)] text-sm placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:border-[var(--color-primary)]"
              />
              <Button type="submit" disabled={!password || submitting} className="w-full">
                {submitting ? "Verificando..." : "Entrar"}
              </Button>
            </form>
            <p className="mt-4 text-xs text-[var(--color-muted-foreground)] text-center">
              <Link href="/" className="hover:text-[var(--color-foreground)] transition-colors">
                ← Volver al inicio
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Navbar />

      <div className="container py-8 max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-[var(--color-primary)]" />
              <Badge variant="outline" className="border-[var(--color-primary)]/40 text-[var(--color-primary)] bg-[var(--color-primary)]/10">
                Admin
              </Badge>
            </div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6" />
              Panel de administración
            </h1>
          </div>
          <Button variant="outline" onClick={onLogout} className="text-xs">
            <LogOut className="w-3.5 h-3.5" />
            Cerrar sesión
          </Button>
        </div>

        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 mb-6">
          <h2 className="font-serif text-lg font-semibold mb-1">Cambiar plan (sin pago)</h2>
          <p className="text-sm text-[var(--color-muted-foreground)] mb-5">
            Como admin puedes saltarte Stripe y activar cualquier plan directamente para
            probar las funcionalidades.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(["free", "basic", "pro"] as const).map((t) => (
              <Button
                key={t}
                variant={tier === t ? "default" : "outline"}
                onClick={() => changeTier(t)}
                className={tier === t ? "glow-emerald" : ""}
              >
                {t === "free" ? "Gratis" : t === "basic" ? "Basic" : "Pro"}
                {tier === t && <span className="text-xs opacity-70 ml-1">(activo)</span>}
              </Button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 mb-6">
          <h2 className="font-serif text-lg font-semibold mb-3">Accesos rápidos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link href="/app">
              <Button variant="outline" className="w-full">Artículo del día</Button>
            </Link>
            <Link href="/favorites">
              <Button variant="outline" className="w-full">Favoritos</Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="w-full">Planes (vista usuario)</Button>
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6">
          <h2 className="font-serif text-lg font-semibold mb-3">Mantenimiento</h2>
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm("¿Borrar TODOS los datos locales (artículos, favoritos, comentarios)? El plan y el acceso admin se mantienen.")) {
                const keep = {
                  tier: localStorage.getItem("pubdle:tier"),
                  admin: localStorage.getItem("pubdle:isAdmin"),
                  migrated: localStorage.getItem("pubdle:migrated"),
                };
                localStorage.clear();
                if (keep.tier) localStorage.setItem("pubdle:tier", keep.tier);
                if (keep.admin) localStorage.setItem("pubdle:isAdmin", keep.admin);
                if (keep.migrated) localStorage.setItem("pubdle:migrated", keep.migrated);
                toast.success("Datos locales borrados");
              }
            }}
          >
            Borrar datos locales
          </Button>
        </section>
      </div>
    </div>
  );
}
