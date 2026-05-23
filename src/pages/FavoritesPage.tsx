import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "wouter";
import { BookOpen, ExternalLink, FolderPlus, Heart, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import ConfirmDialog from "@/components/ConfirmDialog";
import ListPicker from "@/components/ListPicker";
import {
  createFavoriteList,
  deleteFavoriteList,
  getFavoriteLists,
  getFavorites,
  removeFavorite,
  renameFavoriteList,
  type FavoriteEntry,
} from "@/lib/storage";

type Filter = "all" | "none" | string;

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);
  const [lists, setLists] = useState<string[]>([]);
  const [activeList, setActiveList] = useState<Filter>("all");

  const [showCreate, setShowCreate] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [renaming, setRenaming] = useState<{ from: string; value: string } | null>(null);
  const [confirmDeleteList, setConfirmDeleteList] = useState<string | null>(null);

  const reload = () => {
    setFavorites(getFavorites());
    setLists(getFavoriteLists());
  };

  useEffect(() => {
    reload();
  }, []);

  const filtered = useMemo(() => {
    return favorites.filter((f) => {
      if (activeList === "all") return true;
      if (activeList === "none") return !f.list;
      return f.list === activeList;
    });
  }, [favorites, activeList]);

  const remove = (pmid: string) => {
    removeFavorite(pmid);
    reload();
    toast.success("Eliminado de favoritos");
  };

  const handleCreateList = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = newListName.trim();
    if (!trimmed) return;
    const ok = createFavoriteList(trimmed);
    if (!ok) {
      toast.error(`Ya existe una lista llamada "${trimmed}"`);
      return;
    }
    reload();
    setShowCreate(false);
    setNewListName("");
    setActiveList(trimmed);
    toast.success(`Lista "${trimmed}" creada`);
  };

  const handleRename = (e: FormEvent) => {
    e.preventDefault();
    if (!renaming) return;
    const ok = renameFavoriteList(renaming.from, renaming.value);
    if (!ok) {
      toast.error("Nombre inválido o ya en uso");
      return;
    }
    if (activeList === renaming.from) setActiveList(renaming.value.trim());
    setRenaming(null);
    reload();
    toast.success("Lista renombrada");
  };

  const handleDeleteList = () => {
    if (!confirmDeleteList) return;
    deleteFavoriteList(confirmDeleteList);
    if (activeList === confirmDeleteList) setActiveList("all");
    setConfirmDeleteList(null);
    reload();
    toast.success("Lista eliminada (los artículos siguen en favoritos)");
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
              {lists.length > 0 && ` · ${lists.length} ${lists.length === 1 ? "lista" : "listas"}`}
            </p>
          </div>
          <Button variant="outline" onClick={() => setShowCreate((s) => !s)}>
            <FolderPlus className="w-4 h-4" />
            Nueva lista
          </Button>
        </div>

        {showCreate && (
          <form
            onSubmit={handleCreateList}
            className="mb-6 flex items-center gap-2 p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] animate-fade-up"
          >
            <input
              autoFocus
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="Nombre de la nueva lista (p. ej. 'Cardiología')"
              maxLength={40}
              className="flex-1 px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)]/50"
            />
            <Button type="submit" disabled={!newListName.trim()}>
              Crear
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowCreate(false);
                setNewListName("");
              }}
            >
              Cancelar
            </Button>
          </form>
        )}

        {(favorites.length > 0 || lists.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-6">
            <FilterChip active={activeList === "all"} onClick={() => setActiveList("all")}>
              Todos ({favorites.length})
            </FilterChip>
            <FilterChip
              active={activeList === "none"}
              onClick={() => setActiveList("none")}
            >
              Sin lista ({favorites.filter((f) => !f.list).length})
            </FilterChip>
            {lists.map((l) => {
              const count = favorites.filter((f) => f.list === l).length;
              const isActive = activeList === l;
              const isRenaming = renaming?.from === l;
              if (isRenaming) {
                return (
                  <form
                    key={l}
                    onSubmit={handleRename}
                    className="flex items-center gap-1"
                  >
                    <input
                      autoFocus
                      type="text"
                      value={renaming.value}
                      onChange={(e) => setRenaming({ from: l, value: e.target.value })}
                      onBlur={() => setRenaming(null)}
                      maxLength={40}
                      className="px-3 py-1.5 text-sm rounded-full border border-[var(--color-primary)] bg-[var(--color-card)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
                    />
                  </form>
                );
              }
              return (
                <div
                  key={l}
                  className={`group inline-flex items-center gap-1 rounded-full border transition-colors ${
                    isActive
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                      : "border-[var(--color-border)] bg-[var(--color-muted)]/30"
                  }`}
                >
                  <button
                    onClick={() => setActiveList(l)}
                    className={`pl-3 pr-1 py-1.5 text-sm ${
                      isActive
                        ? "text-[var(--color-primary)]"
                        : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                    }`}
                  >
                    {l} ({count})
                  </button>
                  <button
                    onClick={() => setRenaming({ from: l, value: l })}
                    title="Renombrar"
                    aria-label={`Renombrar lista ${l}`}
                    className="p-1 rounded-full text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)]"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteList(l)}
                    title="Eliminar lista"
                    aria-label={`Eliminar lista ${l}`}
                    className="p-1 mr-1 rounded-full text-[var(--color-muted-foreground)] hover:text-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
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

        {favorites.length > 0 && filtered.length === 0 && (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/60 p-8 text-center">
            <p className="text-[var(--color-muted-foreground)]">
              Esta lista todavía no tiene artículos. Muévelos aquí desde el icono de carpeta
              en cualquier favorito.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {filtered.map((fav) => (
            <div
              key={fav.pmid}
              className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] hover:border-[var(--color-primary)]/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1 min-w-0">
                  {fav.list && (
                    <Badge variant="outline" className="mb-2 font-mono">
                      {fav.list}
                    </Badge>
                  )}
                  <h3 className="font-serif text-lg font-semibold leading-snug">
                    {fav.article.title}
                  </h3>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <ListPicker
                    pmid={fav.pmid}
                    currentList={fav.list}
                    onChange={reload}
                  />
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
          ))}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDeleteList !== null}
        title="¿Eliminar esta lista?"
        description={
          <>
            Vas a eliminar la lista <strong>"{confirmDeleteList}"</strong>. Los artículos
            que contenía <strong>no se borrarán</strong>: se quedarán en tus favoritos sin
            asignar a ninguna lista.
          </>
        }
        confirmLabel="Sí, eliminar lista"
        cancelLabel="Cancelar"
        destructive
        onCancel={() => setConfirmDeleteList(null)}
        onConfirm={handleDeleteList}
      />
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
