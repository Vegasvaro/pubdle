import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Heart, FolderPlus, Trash2, ExternalLink, BookOpen } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import {
  getFavorites,
  getFavoriteLists,
  removeFavorite,
  setFavoriteList,
  type FavoriteEntry,
} from "@/lib/storage";
import { TOPICS } from "@/lib/topics";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);
  const [activeList, setActiveList] = useState<string | "all" | "none">("all");

  const reload = () => {
    setFavorites(getFavorites());
  };

  useEffect(() => {
    reload();
  }, []);

  const lists = useMemo(() => getFavoriteLists(), [favorites]);

  const filtered = favorites.filter((f) => {
    if (activeList === "all") return true;
    if (activeList === "none") return !f.list;
    return f.list === activeList;
  });

  const createList = () => {
    const name = prompt("Nombre de la nueva lista:");
    if (!name) return;
    const fav = favorites[0];
    if (!fav) {
      toast.error("Añade al menos un favorito antes de crear una lista.");
      return;
    }
    setFavoriteList(fav.pmid, name);
    reload();
    setActiveList(name);
    toast.success(`Lista “${name}” creada`);
  };

  const remove = (pmid: string) => {
    removeFavorite(pmid);
    reload();
    toast.success("Eliminado de favoritos");
  };

  const moveToList = (pmid: string) => {
    const all = ["(sin lista)", ...lists, "+ Nueva..."];
    const choice = prompt("Mover a lista:\n" + all.map((l, i) => `${i + 1}. ${l}`).join("\n"));
    if (!choice) return;
    const idx = parseInt(choice, 10) - 1;
    if (Number.isNaN(idx) || idx < 0 || idx >= all.length) return;
    if (idx === 0) {
      setFavoriteList(pmid, undefined);
    } else if (idx === all.length - 1) {
      const name = prompt("Nombre de la nueva lista:");
      if (!name) return;
      setFavoriteList(pmid, name);
    } else {
      setFavoriteList(pmid, all[idx]);
    }
    reload();
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Navbar />

      <div className="container py-8 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Heart className="w-6 h-6 text-[var(--color-primary)]" />
              Favoritos
            </h1>
            <p className="text-[var(--color-muted-foreground)] text-sm mt-1">
              {favorites.length} {favorites.length === 1 ? "artículo guardado" : "artículos guardados"}
            </p>
          </div>
          <Button variant="outline" onClick={createList}>
            <FolderPlus className="w-4 h-4" />
            Nueva lista
          </Button>
        </div>

        {favorites.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <FilterChip active={activeList === "all"} onClick={() => setActiveList("all")}>
              Todos ({favorites.length})
            </FilterChip>
            <FilterChip active={activeList === "none"} onClick={() => setActiveList("none")}>
              Sin lista ({favorites.filter((f) => !f.list).length})
            </FilterChip>
            {lists.map((l) => (
              <FilterChip key={l} active={activeList === l} onClick={() => setActiveList(l)}>
                {l} ({favorites.filter((f) => f.list === l).length})
              </FilterChip>
            ))}
          </div>
        )}

        {favorites.length === 0 && (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/40 flex items-center justify-center mx-auto mb-6">
              <Heart className="w-8 h-8 text-[var(--color-primary)]" />
            </div>
            <h2 className="font-serif text-2xl font-bold mb-3">Aún no tienes favoritos</h2>
            <p className="text-[var(--color-muted-foreground)] mb-6 max-w-sm mx-auto">
              Guarda artículos desde la página de lectura diaria para encontrarlos aquí.
            </p>
            <Link href="/app">
              <Button>
                <BookOpen className="w-4 h-4" />
                Ir al artículo del día
              </Button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {filtered.map((fav) => {
            const topicLabel = TOPICS.find((t) => t.slug === fav.list)?.label;
            return (
              <div
                key={fav.pmid}
                className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] hover:border-[var(--color-primary)]/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1 min-w-0">
                    {fav.list && (
                      <Badge variant="outline" className="mb-2 font-mono">
                        {topicLabel ?? fav.list}
                      </Badge>
                    )}
                    <h3 className="font-serif text-lg font-semibold leading-snug">{fav.article.title}</h3>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => moveToList(fav.pmid)}
                      title="Mover a lista"
                      className="p-2 rounded-lg text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] hover:bg-[var(--color-muted)]"
                    >
                      <FolderPlus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => remove(fav.pmid)}
                      title="Eliminar"
                      className="p-2 rounded-lg text-[var(--color-muted-foreground)] hover:text-[var(--color-destructive)] hover:bg-[var(--color-muted)]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-[var(--color-muted-foreground)] line-clamp-3 mb-3">
                  {fav.article.abstract}
                </p>
                <div className="flex items-center justify-between text-xs text-[var(--color-muted-foreground)]">
                  <span className="italic truncate max-w-[60%]">
                    {fav.article.journal}
                    {fav.article.year && ` · ${fav.article.year}`}
                  </span>
                  <a
                    href={fav.article.pubmedUrl}
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
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
        active
          ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
          : "border-[var(--color-border)] bg-[var(--color-muted)]/30 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
      }`}
    >
      {children}
    </button>
  );
}
