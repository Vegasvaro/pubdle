import { useEffect, useRef, useState, type FormEvent } from "react";
import { Check, FolderOpen, FolderPlus, Inbox, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import {
  createFavoriteList,
  getFavoriteLists,
  setFavoriteList,
} from "@/lib/storage";

interface Props {
  /** PMID del favorito al que vamos a asignar (o desasignar) una lista. */
  pmid: string;
  /** Lista actual del favorito (si la tiene). */
  currentList?: string;
  /** Callback tras cualquier cambio (asignar, crear, quitar). */
  onChange?: () => void;
  /** Clases extras para el botón disparador. */
  triggerClassName?: string;
}

/**
 * Botón con icono de carpeta que despliega un menú con las listas del usuario.
 * - Si hay listas: las muestra como botones, marcando la actual con un check.
 * - Si no hay listas: muestra un mensaje y la opción de crear la primera.
 * - Siempre permite "Sin lista" y "+ Nueva lista..." (campo inline).
 */
export default function ListPicker({ pmid, currentList, onChange, triggerClassName }: Props) {
  const [open, setOpen] = useState(false);
  const [lists, setLists] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setLists(getFavoriteLists());

    function onClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
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
  }, [open]);

  useEffect(() => {
    if (creating) inputRef.current?.focus();
  }, [creating]);

  function refresh() {
    setLists(getFavoriteLists());
    onChange?.();
  }

  function assign(list: string | undefined) {
    setBusy(true);
    try {
      setFavoriteList(pmid, list);
      refresh();
      if (list) toast.success(`Movido a "${list}"`);
      else toast.message("Sin lista");
      setOpen(false);
    } finally {
      setBusy(false);
    }
  }

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    setBusy(true);
    try {
      const ok = createFavoriteList(trimmed);
      if (!ok) {
        toast.error(`Ya existe una lista llamada "${trimmed}"`);
        return;
      }
      // Asignar el artículo a esta lista recién creada.
      setFavoriteList(pmid, trimmed);
      toast.success(`Lista "${trimmed}" creada`);
      setNewName("");
      setCreating(false);
      refresh();
      setOpen(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Añadir a una lista"
        title="Añadir a una lista"
        className={cn(
          "p-2 rounded-lg text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] hover:bg-[var(--color-muted)] transition-colors",
          open && "bg-[var(--color-muted)] text-[var(--color-primary)]",
          triggerClassName
        )}
      >
        <FolderPlus className="w-4 h-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-xl z-40 animate-fade-up overflow-hidden"
        >
          <div className="px-3 py-2 border-b border-[var(--color-border)]">
            <p className="text-xs uppercase tracking-wider font-mono text-[var(--color-muted-foreground)]">
              Mover a lista
            </p>
          </div>

          <div className="p-1 max-h-72 overflow-y-auto">
            {/* Opción: quitar de cualquier lista */}
            <MenuRow
              icon={<Inbox className="w-4 h-4" />}
              label="Sin lista"
              active={!currentList}
              busy={busy}
              onClick={() => assign(undefined)}
            />

            {lists.length === 0 && !creating && (
              <div className="px-3 py-4 text-center">
                <p className="text-sm text-[var(--color-muted-foreground)] mb-3">
                  Aún no has creado ninguna lista.
                </p>
                <button
                  type="button"
                  onClick={() => setCreating(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary)]/90"
                >
                  <FolderPlus className="w-4 h-4" />
                  Crear primera lista
                </button>
              </div>
            )}

            {lists.length > 0 &&
              lists.map((list) => (
                <MenuRow
                  key={list}
                  icon={<FolderOpen className="w-4 h-4" />}
                  label={list}
                  active={list === currentList}
                  busy={busy}
                  onClick={() => assign(list)}
                />
              ))}
          </div>

          {/* Pie con "+ Nueva lista" o el formulario inline */}
          {(lists.length > 0 || creating) && (
            <div className="border-t border-[var(--color-border)] p-1">
              {creating ? (
                <form onSubmit={handleCreate} className="flex items-center gap-1.5 p-1.5">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nombre de la lista"
                    maxLength={40}
                    className="flex-1 min-w-0 px-2 py-1.5 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)]/50"
                  />
                  <button
                    type="submit"
                    disabled={busy || !newName.trim()}
                    className="px-2.5 py-1.5 text-xs font-medium rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary)]/90 disabled:opacity-50"
                  >
                    {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Crear"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCreating(false);
                      setNewName("");
                    }}
                    className="px-2 py-1.5 text-xs rounded-md text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]"
                  >
                    Cancelar
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setCreating(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors text-left"
                >
                  <FolderPlus className="w-4 h-4" />
                  Nueva lista...
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MenuRow({
  icon,
  label,
  active,
  busy,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  busy: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors disabled:opacity-50",
        active
          ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)]"
          : "hover:bg-[var(--color-muted)]"
      )}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {active && <Check className="w-4 h-4 flex-shrink-0" />}
    </button>
  );
}
