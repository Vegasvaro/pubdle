import { useEffect, useState } from "react";
import { MessageCircle, Trash2 } from "lucide-react";
import { Button } from "./Button";

interface Comment {
  id: string;
  pmid: string;
  author: string;
  content: string;
  createdAt: number;
}

const KEY = "pubdle:comments";

function readAll(): Comment[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeAll(c: Comment[]) {
  localStorage.setItem(KEY, JSON.stringify(c));
}

function getName(): string {
  let name = localStorage.getItem("pubdle:name");
  if (!name) {
    name = "Lector " + Math.floor(Math.random() * 9000 + 1000);
    localStorage.setItem("pubdle:name", name);
  }
  return name;
}

export default function CommentsSection({ pmid }: { pmid: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [input, setInput] = useState("");
  const name = getName();

  useEffect(() => {
    setComments(readAll().filter((c) => c.pmid === pmid));
  }, [pmid]);

  const submit = () => {
    const content = input.trim();
    if (!content) return;
    const all = readAll();
    const newC: Comment = {
      id: crypto.randomUUID(),
      pmid,
      author: name,
      content,
      createdAt: Date.now(),
    };
    all.push(newC);
    writeAll(all);
    setComments(all.filter((c) => c.pmid === pmid));
    setInput("");
  };

  const remove = (id: string) => {
    const all = readAll().filter((c) => c.id !== id);
    writeAll(all);
    setComments(all.filter((c) => c.pmid === pmid));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-foreground)]">
        <MessageCircle className="w-4 h-4 text-[var(--color-primary)]" />
        Comentarios ({comments.length})
      </div>

      <div className="space-y-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Comparte tu opinión sobre este artículo..."
          rows={3}
          className="w-full px-3 py-2 rounded-lg bg-[var(--color-input)] border border-[var(--color-border)] text-sm placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:border-[var(--color-primary)]"
        />
        <div className="flex justify-between items-center">
          <span className="text-xs text-[var(--color-muted-foreground)]">Comentas como <span className="text-[var(--color-foreground)]">{name}</span></span>
          <Button size="sm" onClick={submit} disabled={!input.trim()}>
            Publicar
          </Button>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        {comments.length === 0 && (
          <p className="text-sm text-[var(--color-muted-foreground)] italic">
            Aún no hay comentarios. Sé el primero.
          </p>
        )}
        {comments
          .slice()
          .sort((a, b) => b.createdAt - a.createdAt)
          .map((c) => (
            <div
              key={c.id}
              className="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/20"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono text-[var(--color-primary)]">{c.author}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--color-muted-foreground)]">
                    {new Date(c.createdAt).toLocaleString("es-ES")}
                  </span>
                  {c.author === name && (
                    <button
                      onClick={() => remove(c.id)}
                      className="text-[var(--color-muted-foreground)] hover:text-[var(--color-destructive)]"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-[var(--color-foreground)]/90 whitespace-pre-wrap">{c.content}</p>
            </div>
          ))}
      </div>
    </div>
  );
}
