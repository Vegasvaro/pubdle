import { useMemo, useState, useEffect } from "react";
import { FlaskConical, Sparkles, X } from "lucide-react";
import { TOPICS } from "@/lib/topics";
import { Button } from "./Button";
import type { Tier } from "@/lib/storage";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (slug: string) => void;
  tier: Tier;
}

export default function TopicSelector({ open, onClose, onSelect, tier }: Props) {
  const count = tier === "pro" ? 10 : 5;
  const [selected, setSelected] = useState<string | null>(null);

  const random = useMemo(() => {
    if (!open) return [] as typeof TOPICS;
    return [...TOPICS].sort(() => Math.random() - 0.5).slice(0, count);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, count]);

  useEffect(() => {
    if (!open) setSelected(null);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-up"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md mx-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)]"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/40 flex items-center justify-center">
            <FlaskConical className="w-4 h-4 text-[var(--color-primary)]" />
          </div>
          <h3 className="font-serif text-xl font-semibold">Elige tu tema</h3>
        </div>
        <p className="text-sm text-[var(--color-muted-foreground)] mb-4">
          Selecciona uno de los {count} temas disponibles.
          {tier === "pro" && <span className="ml-1 text-[var(--color-primary)] font-medium">Plan Pro — 10 temas</span>}
          {tier === "basic" && <span className="ml-1 text-blue-400 font-medium">Plan Basic — 5 temas</span>}
        </p>

        <div className="grid grid-cols-1 gap-2 my-4 max-h-72 overflow-y-auto">
          {random.map((topic) => (
            <button
              key={topic.slug}
              onClick={() => setSelected(topic.slug)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-200 ${
                selected === topic.slug
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/15 text-[var(--color-primary)]"
                  : "border-[var(--color-border)] bg-[var(--color-muted)]/20 text-[var(--color-foreground)] hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary)]/10"
              }`}
            >
              <Sparkles className={`w-4 h-4 flex-shrink-0 ${selected === topic.slug ? "text-[var(--color-primary)]" : "text-[var(--color-muted-foreground)]"}`} />
              <span className="text-sm font-medium">{topic.label}</span>
            </button>
          ))}
        </div>

        <Button
          onClick={() => selected && onSelect(selected)}
          disabled={!selected}
          className="w-full glow-emerald"
        >
          Obtener artículo →
        </Button>
      </div>
    </div>
  );
}
