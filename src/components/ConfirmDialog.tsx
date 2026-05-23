import { useEffect, useRef, type ReactNode } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "./Button";

interface Props {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Modal de confirmación accesible (cierre con Escape, foco inicial en "Cancelar",
 * bloqueo de scroll del body, click fuera = cancelar).
 */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  destructive = false,
  onConfirm,
  onCancel,
}: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-up"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cerrar"
          className="absolute top-3 right-3 p-1.5 rounded-lg text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 md:p-7">
          <div className="flex items-start gap-4">
            <div
              className={
                destructive
                  ? "w-10 h-10 rounded-full bg-amber-500/15 border border-amber-400/30 flex items-center justify-center flex-shrink-0"
                  : "w-10 h-10 rounded-full bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/30 flex items-center justify-center flex-shrink-0"
              }
            >
              <AlertTriangle
                className={destructive ? "w-5 h-5 text-amber-400" : "w-5 h-5 text-[var(--color-primary)]"}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 id="confirm-dialog-title" className="font-serif text-lg font-semibold leading-snug mb-2">
                {title}
              </h2>
              <div className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
                {description}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button
              ref={cancelRef}
              type="button"
              variant="outline"
              onClick={onCancel}
              className="sm:min-w-[110px]"
            >
              {cancelLabel}
            </Button>
            <Button
              type="button"
              variant={destructive ? "destructive" : "default"}
              onClick={onConfirm}
              className="sm:min-w-[110px]"
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
