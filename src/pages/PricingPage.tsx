import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Check, ExternalLink, FlaskConical, Lock, Shield } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import ConfirmDialog from "@/components/ConfirmDialog";
import { setTier, getTier, isAdmin, type Tier } from "@/lib/storage";
import { STRIPE_PAYMENT_LINKS } from "@/lib/config";
import { useAuth } from "@/lib/auth";

const PLANS: Array<{
  id: Tier;
  name: string;
  price: string;
  period: string;
  color: string;
  badge: string | null;
  features: string[];
}> = [
  {
    id: "free",
    name: "Gratis",
    price: "0€",
    period: "/mes",
    color: "border-[var(--color-border)]",
    badge: null,
    features: [
      "1 artículo al día (compartido)",
      "Tema asignado por el sistema",
      "Favoritos y comentarios",
      "Historial de lecturas",
    ],
  },
  {
    id: "basic",
    name: "Basic",
    price: "2,99€",
    period: "/mes",
    color: "border-blue-400/40",
    badge: "Popular",
    features: [
      "5 artículos al día",
      "Elige entre 5 temas",
      "Historial completo",
      "Sin anuncios",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "5,99€",
    period: "/mes",
    color: "border-[var(--color-primary)]/60",
    badge: "Mejor valor",
    features: [
      "Artículos ilimitados",
      "Elige entre 10 temas",
      "Acceso prioritario",
      "Sin anuncios",
    ],
  },
];

export default function PricingPage() {
  const [active, setActive] = useState<Tier>(getTier());
  const [admin, setAdmin] = useState(false);
  const [confirmDowngrade, setConfirmDowngrade] = useState(false);
  const { user, configured } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    setAdmin(isAdmin());
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      const plan = params.get("plan") as Tier | null;
      if (plan === "basic" || plan === "pro") {
        setTier(plan);
        setActive(plan);
        toast.success(`¡Bienvenido al plan ${plan === "basic" ? "Basic" : "Pro"}!`);
      }
      window.history.replaceState({}, "", "/pricing");
    } else if (params.get("payment") === "cancelled") {
      toast.message("Pago cancelado. Sigues en tu plan actual.");
      window.history.replaceState({}, "", "/pricing");
    }
  }, []);

  const applyFree = () => {
    setTier("free");
    setActive("free");
    toast.success(
      admin
        ? "Plan Gratis activado (admin)"
        : "Plan Gratis activado. Para volver a Basic/Pro tendrás que suscribirte de nuevo."
    );
  };

  const handleSelect = (plan: Tier) => {
    if (plan === "free") {
      if (active === "free") return;
      setConfirmDowngrade(true);
      return;
    }

    if (admin) {
      setTier(plan);
      setActive(plan);
      toast.success(`Plan ${plan === "basic" ? "Basic" : "Pro"} activado (admin)`);
      return;
    }

    if (!configured) {
      toast.error("La autenticación no está configurada. Avisa al administrador.");
      return;
    }

    if (!user) {
      toast.message("Crea una cuenta o inicia sesión para suscribirte.");
      navigate(`/login?next=${encodeURIComponent("/pricing")}`);
      return;
    }

    const url = STRIPE_PAYMENT_LINKS[plan];
    if (!url || url.includes("REEMPLAZAR")) {
      toast.error("Stripe no está configurado todavía. Avisa al administrador.");
      return;
    }

    // Stripe Payment Links aceptan client_reference_id y prefilled_email como
    // parámetros. Usamos el id del usuario para poder asociar el pago en webhooks.
    const params = new URLSearchParams({
      client_reference_id: `pubdle:${user.id}:${plan}`,
    });
    if (user.email) params.set("prefilled_email", user.email);
    window.location.href = `${url}?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Navbar />

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-mono font-semibold mb-6">
              <FlaskConical className="w-3.5 h-3.5" />
              Planes
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              Planes para cada <span className="gradient-text">lector</span>
            </h1>
            <p className="text-[var(--color-muted-foreground)] max-w-xl mx-auto">
              Empieza gratis con un artículo diario compartido por toda la comunidad.
              Mejora a Basic o Pro para elegir tus temas.
            </p>
            {admin && (
              <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-mono">
                <Shield className="w-3.5 h-3.5" />
                Modo admin: el cambio de plan no llama a Stripe
              </div>
            )}
            {!admin && !user && (
              <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-300 text-xs">
                <Lock className="w-3.5 h-3.5" />
                Necesitas iniciar sesión para suscribirte a Basic o Pro
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {PLANS.map((plan) => {
              const isActive = active === plan.id;
              return (
                <div
                  key={plan.id}
                  className={`relative p-6 rounded-2xl border-2 bg-[var(--color-card)] flex flex-col ${plan.color} ${
                    isActive ? "ring-2 ring-[var(--color-primary)]/40" : ""
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge
                        className={
                          plan.badge === "Mejor valor"
                            ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] border-transparent"
                            : "bg-blue-500 text-white border-transparent"
                        }
                      >
                        {plan.badge}
                      </Badge>
                    </div>
                  )}

                  <div className="mb-5">
                    <h3 className="font-semibold text-lg mb-1">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="font-serif text-3xl font-bold">{plan.price}</span>
                      <span className="text-[var(--color-muted-foreground)] text-sm">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-2.5 mb-6 flex-1">
                    {plan.features.map((feat, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
                        <span className="text-[var(--color-foreground)]/80">{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSelect(plan.id)}
                    variant={plan.id === "free" ? "outline" : "default"}
                    className={plan.id === "pro" && !isActive ? "glow-emerald" : undefined}
                    disabled={isActive}
                  >
                    {isActive ? (
                      "Plan activo"
                    ) : plan.id === "free" || admin ? (
                      "Activar plan"
                    ) : !user ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        Inicia sesión para suscribirte
                      </>
                    ) : (
                      <>
                        Suscribirse
                        <ExternalLink className="w-3.5 h-3.5" />
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <p className="text-xs text-[var(--color-muted-foreground)] mb-3">
              Los pagos se procesan de forma segura en Stripe.
            </p>
            <Link href="/app">
              <Button variant="ghost">Ir al artículo del día →</Button>
            </Link>
          </div>
        </div>
      </section>

      <ConfirmDialog
        open={confirmDowngrade}
        title="¿Volver al plan Gratis?"
        description={
          <>
            Vas a cancelar tu plan <strong>{active === "basic" ? "Basic" : active === "pro" ? "Pro" : "actual"}</strong>{" "}
            y volver al plan Gratis. Perderás el acceso a tus artículos extra, a la selección
            de temas y al historial completo.
            <br />
            <br />
            Para volver a Basic o Pro tendrás que suscribirte de nuevo desde esta página.
            {!admin && (
              <>
                <br />
                <br />
                <em className="text-amber-300/90 not-italic">
                  Importante: si tienes una suscripción activa en Stripe, debes cancelarla
                  también desde el portal de Stripe (en el correo de confirmación) o no se
                  detendrán los cobros.
                </em>
              </>
            )}
          </>
        }
        confirmLabel="Sí, volver a Gratis"
        cancelLabel="Cancelar"
        destructive
        onCancel={() => setConfirmDowngrade(false)}
        onConfirm={() => {
          setConfirmDowngrade(false);
          applyFree();
        }}
      />
    </div>
  );
}

