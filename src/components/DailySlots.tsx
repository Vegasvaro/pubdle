import { CheckCircle2, Lock } from "lucide-react";
import type { Tier } from "@/lib/storage";
import { cn } from "@/lib/cn";

interface Props {
  readCount: number;
  limit: number;
  tier: Tier;
}

const TIER_COLORS: Record<Tier, string> = {
  free: "border-[var(--color-muted-foreground)]/40 bg-[var(--color-muted-foreground)]/20",
  basic: "border-blue-400/60 bg-blue-400/20",
  pro: "border-[var(--color-primary)]/60 bg-[var(--color-primary)]/20",
};

const TIER_ACTIVE: Record<Tier, string> = {
  free: "border-[var(--color-muted-foreground)] bg-[var(--color-muted-foreground)]/60",
  basic: "border-blue-400 bg-blue-400/60",
  pro: "border-[var(--color-primary)] bg-[var(--color-primary)]/60",
};

export default function DailySlots({ readCount, limit, tier }: Props) {
  const display = tier === "pro" ? Math.max(readCount + 1, 5) : limit;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5">
        {Array.from({ length: display }).map((_, i) => {
          const isRead = i < readCount;
          const isLocked = tier === "pro" ? false : i >= limit;

          return (
            <div
              key={i}
              title={
                isRead
                  ? `Artículo ${i + 1} leído`
                  : isLocked
                    ? "Mejora tu plan para desbloquear"
                    : `Artículo ${i + 1} disponible`
              }
              className={cn(
                "relative w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-300",
                isRead
                  ? TIER_ACTIVE[tier]
                  : isLocked
                    ? "border-[var(--color-border)]/30 bg-[var(--color-muted)]/20 opacity-40"
                    : TIER_COLORS[tier]
              )}
              style={{
                animation: isRead ? `reveal-tile 0.4s ease ${i * 80}ms both` : undefined,
              }}
            >
              {isRead ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-foreground)]/80" />
              ) : isLocked ? (
                <Lock className="w-3 h-3 text-[var(--color-muted-foreground)]/40" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-current opacity-30" />
              )}
            </div>
          );
        })}

        {tier === "pro" && (
          <span className="text-xs text-[var(--color-primary)] font-mono ml-1">∞</span>
        )}
      </div>

      <span className="text-xs text-[var(--color-muted-foreground)] font-mono">
        {tier === "pro" ? `${readCount} leídos hoy` : `${readCount}/${limit}`}
      </span>
    </div>
  );
}
