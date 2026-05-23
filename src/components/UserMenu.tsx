import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { History, LogIn, LogOut, Loader2, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./Button";
import { getDisplayName, getInitials, useAuth } from "@/lib/auth";

export default function UserMenu() {
  const [location] = useLocation();
  const { user, loading, configured, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  if (loading) {
    return (
      <div className="w-9 h-9 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] flex items-center justify-center">
        <Loader2 className="w-4 h-4 animate-spin text-[var(--color-muted-foreground)]" />
      </div>
    );
  }

  if (!user) {
    const nextParam = encodeURIComponent(location || "/app");
    return (
      <Link href={`/login?next=${nextParam}`}>
        <Button variant="default" size="sm" title={configured ? "Iniciar sesión" : "Auth no configurada"}>
          <LogIn className="w-4 h-4" />
          Iniciar sesión
        </Button>
      </Link>
    );
  }

  const initials = getInitials(user);
  const name = getDisplayName(user);

  async function handleSignOut() {
    setOpen(false);
    await signOut();
    toast.success("Sesión cerrada");
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Cuenta"
        title={user.email ?? "Cuenta"}
        className="w-9 h-9 rounded-full border border-[var(--color-primary)]/40 bg-gradient-to-br from-[var(--color-primary)]/30 to-[var(--color-secondary)]/30 flex items-center justify-center text-sm font-semibold text-[var(--color-primary)] hover:from-[var(--color-primary)]/40 hover:to-[var(--color-secondary)]/40 transition-colors"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-xl overflow-hidden z-50 animate-fade-up">
          <div className="px-4 py-3 border-b border-[var(--color-border)]">
            <p className="text-sm font-semibold truncate">{name}</p>
            <p className="text-xs text-[var(--color-muted-foreground)] truncate">{user.email}</p>
          </div>
          <div className="p-1">
            <Link href="/favorites" onClick={() => setOpen(false)}>
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-[var(--color-muted)] transition-colors text-left">
                <UserIcon className="w-4 h-4" />
                Mis favoritos
              </button>
            </Link>
            <Link href="/history" onClick={() => setOpen(false)}>
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-[var(--color-muted)] transition-colors text-left">
                <History className="w-4 h-4" />
                Historial
              </button>
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-[var(--color-muted)] transition-colors text-left text-red-400"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
