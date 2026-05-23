import { useEffect, useState } from "react";
import { getReactions, toggleReaction, type ReactionEmoji } from "@/lib/storage";
import { cn } from "@/lib/cn";

const EMOJIS: Array<{ key: ReactionEmoji; char: string; label: string }> = [
  { key: "fire", char: "🔥", label: "Interesante" },
  { key: "thinking", char: "🤔", label: "Pensativo" },
  { key: "thumbsup", char: "👍", label: "Útil" },
  { key: "heart", char: "❤️", label: "Me encanta" },
  { key: "shocked", char: "😲", label: "Sorprendente" },
];

export default function ReactionsBar({ pmid }: { pmid: string }) {
  const [state, setState] = useState(() => getReactions(pmid));

  useEffect(() => {
    setState(getReactions(pmid));
  }, [pmid]);

  const handle = (emoji: ReactionEmoji) => {
    setState(toggleReaction(pmid, emoji));
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {EMOJIS.map((e) => {
        const count = state.counts[e.key];
        const active = state.mine === e.key;
        return (
          <button
            key={e.key}
            onClick={() => handle(e.key)}
            title={e.label}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-sm transition-colors",
              active
                ? "border-[var(--color-primary)] bg-[var(--color-primary)]/15 text-[var(--color-primary)]"
                : "border-[var(--color-border)] bg-[var(--color-muted)]/30 text-[var(--color-foreground)]/80 hover:bg-[var(--color-muted)]"
            )}
          >
            <span>{e.char}</span>
            {count > 0 && <span className="text-xs font-mono">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
