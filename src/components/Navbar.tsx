import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { BookOpen, FlaskConical, Heart, History, LogIn, Menu, Shield, X } from "lucide-react";
import { Button } from "./Button";
import UserMenu from "./UserMenu";
import { getTier, isAdmin, setTier, type Tier } from "@/lib/storage";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/cn";

const TIER_BADGES: Record<Tier, { label: string; cls: string }> = {
  free: { label: "Gratis", cls: "border-[var(--color-border)] bg-[var(--color-muted)]/50 text-[var(--color-muted-foreground)]" },
  basic: { label: "Basic", cls: "border-blue-400/40 bg-blue-400/10 text-blue-400" },
  pro: { label: "Pro", cls: "border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10 text-[var(--color-primary)]" },
};

export default function Navbar() {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [tier, setTierState] = useState<Tier>(getTier());
  const [admin, setAdminState] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setAdminState(isAdmin());
    const onFocus = () => {
      setAdminState(isAdmin());
      setTierState(getTier());
    };
    window.addEventListener("focus", onFocus);
    const id = setInterval(onFocus, 1500);
    return () => {
      window.removeEventListener("focus", onFocus);
      clearInterval(id);
    };
  }, []);

  const cycleTier = () => {
    if (!admin) return;
    const next: Tier = tier === "free" ? "basic" : tier === "basic" ? "pro" : "free";
    setTier(next);
    setTierState(next);
  };

  const links = [
    { href: "/app", label: "Hoy", icon: BookOpen },
    { href: "/history", label: "Historial", icon: History },
    { href: "/favorites", label: "Favoritos", icon: Heart },
    { href: "/pricing", label: "Planes", icon: null },
    { href: "/about", label: "Sobre Pubdle", icon: null },
  ];

  const badge = TIER_BADGES[tier];

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-background)]/90 backdrop-blur-md">
      <div className="container flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/40 flex items-center justify-center group-hover:bg-[var(--color-primary)]/30 transition-colors">
            <FlaskConical className="w-4 h-4 text-[var(--color-primary)]" />
          </div>
          <span className="font-serif text-xl font-bold gradient-text">Pubdle</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  location === link.href && "text-[var(--color-primary)] bg-[var(--color-primary)]/10"
                )}
              >
                {link.icon && <link.icon className="w-4 h-4" />}
                {link.label}
              </Button>
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {admin && (
            <Link href="/admin">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "text-[var(--color-primary)]",
                  location === "/admin" && "bg-[var(--color-primary)]/10"
                )}
              >
                <Shield className="w-4 h-4" />
                Admin
              </Button>
            </Link>
          )}
          <button
            onClick={cycleTier}
            title={admin ? "Cambiar plan (admin)" : "Tu plan actual"}
            disabled={!admin}
            className={cn(
              "text-xs font-mono font-semibold px-2 py-0.5 rounded-full border transition-colors",
              admin ? "hover:opacity-80 cursor-pointer" : "cursor-default",
              badge.cls
            )}
          >
            {badge.label}
          </button>
          <UserMenu />
        </div>

        <div className="md:hidden flex items-center gap-2">
          <UserMenu />
          <button
            className="p-2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-background)]/95 backdrop-blur-md px-4 py-4 space-y-2 animate-fade-up">
          {links.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                  location === link.href
                    ? "text-[var(--color-primary)] bg-[var(--color-primary)]/10"
                    : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)]"
                )}
              >
                {link.icon && <link.icon className="w-4 h-4" />}
                {link.label}
              </div>
            </Link>
          ))}
          {admin && (
            <Link href="/admin" onClick={() => setMenuOpen(false)}>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--color-primary)]">
                <Shield className="w-4 h-4" />
                Admin
              </div>
            </Link>
          )}
          {!user && (
            <Link href="/login" onClick={() => setMenuOpen(false)}>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-[var(--color-primary)]/15 text-[var(--color-primary)]">
                <LogIn className="w-4 h-4" />
                Iniciar sesión
              </div>
            </Link>
          )}
          <div
            className={cn(
              "w-full text-left text-xs font-mono font-semibold px-3 py-2 rounded-lg border",
              badge.cls
            )}
          >
            Plan actual: {badge.label}
            {admin && (
              <button onClick={cycleTier} className="ml-2 underline">
                cambiar
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
