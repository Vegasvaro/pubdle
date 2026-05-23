import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  BookOpen,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  History as HistoryIcon,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/Button";
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  addFavorite,
  getHistory,
  isFavorite,
  removeFavorite,
  type HistoryEntry,
} from "@/lib/storage";

const HISTORY_KEY = "pubdle:history";

function clearAllHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

function removeOne(pmid: string) {
  const list = getHistory().filter((h) => h.pmid !== pmid);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
}

function groupByDate(entries: HistoryEntry[]): { dateLabel: string; items: HistoryEntry[] }[] {
  const groups = new Map<string, HistoryEntry[]>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  for (const e of entries) {
    const d = new Date(e.readAt);
    d.setHours(0, 0, 0, 0);
    let key: string;
    if (d.getTime() === today.getTime()) key = "Hoy";
    else if (d.getTime() === yesterday.getTime()) key = "Ayer";
    else
      key = d.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: d.getFullYear() === today.getFullYear() ? undefined : "numeric",
      });
    const arr = groups.get(key) ?? [];
    arr.push(e);
    groups.set(key, arr);
  }
  return Array.from(groups.entries()).map(([dateLabel, items]) => ({ dateLabel, items }));
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [query, setQuery] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  const reload = () => setHistory(getHistory());

  useEffect(() => {
    reload();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return history;
    return history.filter(
      (h) =>
        h.article.title.toLowerCase().includes(q) ||
        h.article.abstract.toLowerCase().includes(q) ||
        h.article.journal?.toLowerCase().includes(q) ||
        h.article.authors?.some((a) => a.toLowerCase().includes(q))
    );
  }, [history, query]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  const total = history.length;

  const handleClearAll = () => {
    clearAllHistory();
    setHistory([]);
    setConfirmClear(false);
    toast.success("Historial vaciado");
  };

  const handleRemoveOne = (pmid: string) => {
    removeOne(pmid);
    reload();
    toast.message("Eliminado del historial");
  };

  const toggleFav = (entry: HistoryEntry) => {
    if (isFavorite(entry.pmid)) {
      removeFavorite(entry.pmid);
      toast.success("Eliminado de favoritos");
    } else {
      addFavorite(entry.article);
      toast.success("Guardado en favoritos");
    }
    reload();
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Navbar />

      <div className="container py-8 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold flex items-center gap-2">
              <HistoryIcon className="w-6 h-6 text-[var(--color-primary)]" />
              Historial
            </h1>
            <p className="text-[var(--color-muted-foreground)] text-sm mt-1">
              {total === 0
                ? "Sin artículos leídos todavía"
                : total === 1
                  ? "1 artículo leído"
                  : `${total} artículos leídos`}
              {total > 0 && " · se guardan los últimos 100"}
            </p>
          </div>
          {total > 0 && (
            <Button
              variant="outline"
              onClick={() => setConfirmClear(true)}
              className="text-red-400 border-red-500/30 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4" />
              Vaciar historial
            </Button>
          )}
        </div>

        {total > 0 && (
          <div className="relative mb-6">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por título, autor, revista o palabras del abstract..."
              className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)]/50"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Limpiar búsqueda"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {total === 0 && (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/40 flex items-center justify-center mx-auto mb-6">
              <HistoryIcon className="w-8 h-8 text-[var(--color-primary)]" />
            </div>
            <h2 className="font-serif text-2xl font-bold mb-3">Aún no has leído nada</h2>
            <p className="text-[var(--color-muted-foreground)] mb-6 max-w-sm mx-auto">
              Cada artículo que se te presente en Pubdle aparecerá aquí para que puedas volver a él cuando quieras.
            </p>
            <Link href="/app">
              <Button>
                <BookOpen className="w-4 h-4" />
                Ir al artículo del día
              </Button>
            </Link>
          </div>
        )}

        {total > 0 && filtered.length === 0 && (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/60 p-8 text-center">
            <p className="text-[var(--color-muted-foreground)]">
              Ningún artículo coincide con <strong className="text-[var(--color-foreground)]">"{query}"</strong>.
            </p>
          </div>
        )}

        {grouped.map(({ dateLabel, items }) => (
          <section key={dateLabel} className="mb-8">
            <h2 className="text-xs uppercase tracking-wider font-mono text-[var(--color-muted-foreground)] mb-3 first-letter:uppercase">
              {dateLabel}
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {items.map((entry) => {
                const fav = isFavorite(entry.pmid);
                const time = new Date(entry.readAt).toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <div
                    key={entry.pmid + ":" + entry.readAt}
                    className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] hover:border-[var(--color-primary)]/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 text-xs text-[var(--color-muted-foreground)] font-mono">
                          <span>{time}</span>
                          <span>·</span>
                          <span className="truncate">PMID {entry.pmid}</span>
                        </div>
                        <h3 className="font-serif text-base md:text-lg font-semibold leading-snug">
                          {entry.article.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => toggleFav(entry)}
                          title={fav ? "Quitar de favoritos" : "Guardar en favoritos"}
                          className="p-2 rounded-lg text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] hover:bg-[var(--color-muted)]"
                        >
                          {fav ? (
                            <BookmarkCheck className="w-4 h-4 text-[var(--color-primary)]" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleRemoveOne(entry.pmid)}
                          title="Eliminar del historial"
                          className="p-2 rounded-lg text-[var(--color-muted-foreground)] hover:text-[var(--color-destructive)] hover:bg-[var(--color-muted)]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-[var(--color-muted-foreground)] line-clamp-2">
                      {entry.article.abstract}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs text-[var(--color-muted-foreground)]">
                      <span className="italic truncate max-w-[60%]">
                        {entry.article.journal}
                        {entry.article.year && ` · ${entry.article.year}`}
                      </span>
                      <a
                        href={entry.article.pubmedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:text-[var(--color-primary)]/80"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        PubMed
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <ConfirmDialog
        open={confirmClear}
        title="¿Vaciar todo el historial?"
        description={
          <>
            Vas a borrar <strong>{total}</strong> {total === 1 ? "artículo" : "artículos"} del historial.
            Esta acción no se puede deshacer, pero tus <strong>favoritos no se verán afectados</strong>.
          </>
        }
        confirmLabel="Sí, vaciar"
        cancelLabel="Cancelar"
        destructive
        onCancel={() => setConfirmClear(false)}
        onConfirm={handleClearAll}
      />
    </div>
  );
}
