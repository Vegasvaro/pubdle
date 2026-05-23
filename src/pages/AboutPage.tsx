import { Link } from "wouter";
import { FlaskConical, ExternalLink, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Navbar />

      <section className="py-16 md:py-24">
        <div className="container max-w-3xl">
          <Badge variant="outline" className="mb-6 border-[var(--color-primary)]/30 text-[var(--color-primary)] bg-[var(--color-primary)]/10">
            Sobre Pubdle
          </Badge>

          <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
            Un <span className="gradient-text">artículo científico</span> cada día.
          </h1>
          <p className="text-lg text-[var(--color-muted-foreground)] leading-relaxed mb-8">
            Pubdle es una forma sencilla de mantenerte al día en ciencias de la salud.
            Cada día seleccionamos un artículo científico de PubMed/NCBI{" "}
            <strong>con acceso completo y gratuito</strong>, para que construyas el
            hábito de leer ciencia sin saturarte con la avalancha de publicaciones.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/30 flex items-center justify-center mb-4">
                <FlaskConical className="w-5 h-5 text-[var(--color-primary)]" />
              </div>
              <h3 className="font-semibold mb-2">Datos de PubMed</h3>
              <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
                Todos los abstracts y metadatos provienen de PubMed/NCBI a través de su API
                pública E-utilities. Solo seleccionamos artículos con <em>Free full text</em>
                para que puedas leer el paper completo sin barreras.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-secondary)]/15 border border-[var(--color-secondary)]/30 flex items-center justify-center mb-4">
                <FlaskConical className="w-5 h-5 text-[var(--color-secondary)]" />
              </div>
              <h3 className="font-semibold mb-2">25 especialidades</h3>
              <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
                Desde cardiología hasta enfermedades infecciosas, mapeadas a términos MeSH
                para obtener resultados relevantes.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 mb-10">
            <h3 className="font-serif text-xl font-semibold mb-3">¿Cómo funciona?</h3>
            <ol className="space-y-3 text-sm text-[var(--color-foreground)]/85">
              <li className="flex gap-3">
                <span className="font-mono text-[var(--color-primary)] flex-shrink-0">01.</span>
                <span>Cada día buscamos un PMID en PubMed según tu plan y tema.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-[var(--color-primary)] flex-shrink-0">02.</span>
                <span>Te mostramos el título y el abstract traducidos al español.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-[var(--color-primary)] flex-shrink-0">03.</span>
                <span>Reacciona, comenta y guarda los que te interesen en favoritos.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-[var(--color-primary)] flex-shrink-0">04.</span>
                <span>Mañana, otro artículo. Construye el hábito.</span>
              </li>
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/app">
              <Button size="lg" className="glow-emerald">
                Comenzar ahora
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href="https://pubmed.ncbi.nlm.nih.gov" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline">
                <ExternalLink className="w-4 h-4" />
                Visitar PubMed
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
