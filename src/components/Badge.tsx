import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "default" | "outline";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants: Record<Variant, string> = {
    default: "bg-[var(--color-primary)]/20 text-[var(--color-primary)] border border-[var(--color-primary)]/30",
    outline: "border border-[var(--color-border)] text-[var(--color-foreground)]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
