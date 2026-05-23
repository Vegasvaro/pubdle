import { Link } from "wouter";
import {
  BookOpen,
  Check,
  ChevronRight,
  FlaskConical,
  Heart,
  Shield,
  Star,
  Users,
  Zap,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";

const FEATURES = [
  {
    icon: BookOpen,
    title: "Artículos reales de PubMed",
    description: "Cada artículo proviene de la base de datos PubMed/NCBI, con abstract completo y enlace al original.",
  },
  {
    icon: Zap,
    title: "Revelación diaria",
    description: "Un artículo nuevo cada día con animación de revelación. Construye el hábito de leer ciencia.",
  },
  {
    icon: Heart,
    title: "Guarda tus favoritos",
    description: "Organiza los artículos que más te interesan en listas personalizadas.",
  },
  {
    icon: Users,
    title: "Comunidad científica",
    description: "Comenta y reacciona a cada artículo junto a otros profesionales de la salud.",
  },
  {
    icon: Shield,
    title: "25 especialidades médicas",
    description: "Desde cardiología hasta enfermedades infecciosas. Elige los temas que más te interesan.",
  },
  {
    icon: Star,
    title: "Tres planes",
    description: "Gratis, Basic y Pro. Empieza sin tarjeta y mejora cuando necesites más.",
  },
];

const PLANS = [
  {
    name: "Gratis",
    price: "0€",
    period: "/mes",
    color: "border-[var(--color-border)]",
    badge: null,
    features: [
      "1 artículo al día",
      "Tema asignado por el sistema",
      "Favoritos y comentarios",
      "Historial de lecturas",
    ],
    cta: "Comenzar gratis",
    href: "/app",
  },
  {
    name: "Basic",
    price: "2,99€",
    period: "/mes",
    color: "border-blue-400/40",
    badge: "Popular",
    features: [
      "5 artículos al día",
      "Elige entre 5 temas",
      "Historial de lecturas",
      "Sin anuncios",
    ],
    cta: "Empezar Basic",
    href: "/pricing",
  },
  {
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
    cta: "Empezar Pro",
    href: "/pricing",
  },
];

const TILES = [
  { letter: "P", state: "correct" },
  { letter: "U", state: "correct" },
  { letter: "B", state: "present" },
  { letter: "D", state: "correct" },
  { letter: "L", state: "absent" },
  { letter: "E", state: "correct" },
] as const;

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Navbar />

      <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[var(--color-primary)]/5 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-[var(--color-secondary)]/5 rounded-full blur-3xl" />
        </div>

        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-mono font-semibold mb-8">
              <FlaskConical className="w-3.5 h-3.5" />
              Artículos de PubMed/NCBI · Ciencias de la salud
            </div>

            <div className="flex justify-center gap-2 mb-8">
              {TILES.map((tile, i) => (
                <div
                  key={i}
                  className={`w-9 h-9 md:w-11 md:h-11 rounded-lg border-2 flex items-center justify-center font-mono font-bold text-sm md:text-base ${
                    tile.state === "correct"
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/20 text-[var(--color-primary)]"
                      : tile.state === "present"
                        ? "border-yellow-400 bg-yellow-400/20 text-yellow-400"
                        : "border-[var(--color-border)] bg-[var(--color-muted)]/30 text-[var(--color-muted-foreground)]"
                  }`}
                  style={{ animation: `reveal-tile 0.6s ease ${i * 80}ms both` }}
                >
                  {tile.letter}
                </div>
              ))}
            </div>

            <h1 className="font-serif text-4xl md:text-6xl font-bold leading-tight mb-6">
              Descubre ciencia <span className="gradient-text">cada día</span>
            </h1>
            <p className="text-lg md:text-xl text-[var(--color-muted-foreground)] leading-relaxed mb-10 max-w-2xl mx-auto">
              Pubdle te trae un artículo científico de ciencias de la salud cada día,
              siempre con acceso completo y gratuito. Construye el hábito de leer ciencia.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/app">
                <Button size="lg" className="glow-emerald">
                  Comenzar gratis
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline">
                  Ver planes
                </Button>
              </Link>
            </div>

            <p className="text-xs text-[var(--color-muted-foreground)] mt-4">
              Sin tarjeta de crédito · Plan gratuito siempre disponible
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-[var(--color-border)]">
        <div className="container">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4 border-[var(--color-primary)]/30 text-[var(--color-primary)] bg-[var(--color-primary)]/10">
              Funcionalidades
            </Badge>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Todo lo que necesitas para mantenerte al día
            </h2>
            <p className="text-[var(--color-muted-foreground)] max-w-xl mx-auto">
              Diseñado para profesionales de la salud que quieren ampliar sus conocimientos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)]/5 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/30 flex items-center justify-center mb-4 group-hover:bg-[var(--color-primary)]/25 transition-colors">
                  <f.icon className="w-5 h-5 text-[var(--color-primary)]" />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-[var(--color-border)]">
        <div className="container">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4 border-[var(--color-primary)]/30 text-[var(--color-primary)] bg-[var(--color-primary)]/10">
              Planes
            </Badge>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">Simple y transparente</h2>
            <p className="text-[var(--color-muted-foreground)] max-w-xl mx-auto">
              Empieza gratis. Mejora cuando necesites más.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {PLANS.map((plan, i) => (
              <div
                key={i}
                className={`relative p-6 rounded-2xl border-2 bg-[var(--color-card)] flex flex-col ${plan.color}`}
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

                <Link href={plan.href}>
                  <Button className="w-full" variant={i === 0 ? "outline" : "default"}>
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-[var(--color-border)]">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/40 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
              <FlaskConical className="w-8 h-8 text-[var(--color-primary)]" />
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">Empieza hoy, gratis</h2>
            <p className="text-[var(--color-muted-foreground)] mb-8 leading-relaxed">
              Únete a Pubdle y descubre un nuevo artículo científico cada día.
            </p>
            <Link href="/app">
              <Button size="lg" className="glow-emerald">
                Comenzar ahora →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--color-border)] py-10">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-[var(--color-primary)]" />
            <span className="font-serif font-bold gradient-text">Pubdle</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-[var(--color-muted-foreground)]">
            <Link href="/about" className="hover:text-[var(--color-foreground)] transition-colors">Sobre Pubdle</Link>
            <Link href="/pricing" className="hover:text-[var(--color-foreground)] transition-colors">Planes</Link>
            <a href="https://pubmed.ncbi.nlm.nih.gov" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-foreground)] transition-colors">
              PubMed/NCBI
            </a>
          </div>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            Datos: PubMed/NCBI · {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
