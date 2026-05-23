import { Link } from "wouter";
import { FlaskConical, Home } from "lucide-react";
import { Button } from "@/components/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/40 flex items-center justify-center mb-6 animate-pulse-glow">
        <FlaskConical className="w-8 h-8 text-[var(--color-primary)]" />
      </div>
      <h1 className="font-serif text-5xl font-bold mb-3 gradient-text">404</h1>
      <p className="text-[var(--color-muted-foreground)] mb-8 max-w-sm">
        La página que buscas no existe o se ha movido.
      </p>
      <Link href="/">
        <Button size="lg">
          <Home className="w-4 h-4" />
          Volver al inicio
        </Button>
      </Link>
    </div>
  );
}
