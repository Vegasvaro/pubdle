import { useEffect, useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Calendar,
  ExternalLink,
  Info,
  Languages,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "./Badge";
import { Button } from "./Button";
import ReactionsBar from "./ReactionsBar";
import CommentsSection from "./CommentsSection";
import { addFavorite, isFavorite, removeFavorite } from "@/lib/storage";
import { TOPICS } from "@/lib/topics";
import type { PubMedArticle } from "@/lib/pubmed";
import { translateText } from "@/lib/translate";
import { cn } from "@/lib/cn";

const TARGET_LANG = "es";

interface Props {
  article: PubMedArticle;
  topic?: string;
  animate?: boolean;
}

export default function ArticleCard({ article, topic, animate = false }: Props) {
  const [favorited, setFavorited] = useState(() => isFavorite(article.pmid));
  const [showComments, setShowComments] = useState(false);
  const [translatedTitle, setTranslatedTitle] = useState<string | null>(null);
  const [translatedAbstract, setTranslatedAbstract] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    setFavorited(isFavorite(article.pmid));
  }, [article.pmid]);

  useEffect(() => {
    setTranslatedTitle(null);
    setTranslatedAbstract(null);
    setShowOriginal(false);

    let cancelled = false;
    setTranslating(true);

    Promise.all([
      translateText(article.title, TARGET_LANG),
      translateText(article.abstract, TARGET_LANG),
    ])
      .then(([t, a]) => {
        if (cancelled) return;
        setTranslatedTitle(t);
        setTranslatedAbstract(a);
      })
      .catch((e) => console.warn("[translate]", e))
      .finally(() => {
        if (!cancelled) setTranslating(false);
      });

    return () => {
      cancelled = true;
    };
  }, [article.pmid, article.title, article.abstract]);

  const topicLabel = TOPICS.find((t) => t.slug === topic)?.label ?? "";
  const displayedTitle =
    showOriginal || !translatedTitle ? article.title : translatedTitle;
  const displayedAbstract =
    showOriginal || !translatedAbstract ? article.abstract : translatedAbstract;
  const isTranslated =
    (translatedTitle !== null && translatedTitle !== article.title) ||
    (translatedAbstract !== null && translatedAbstract !== article.abstract);

  const toggleFavorite = () => {
    if (favorited) {
      removeFavorite(article.pmid);
      setFavorited(false);
      toast.success("Eliminado de favoritos");
    } else {
      addFavorite(article, topic);
      setFavorited(true);
      toast.success("Guardado en favoritos");
    }
  };

  return (
    <div
      className={cn(
        "relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden",
        animate && "animate-flip-in"
      )}
    >
      <div className="h-1 bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-primary)]/50" />

      <div className="p-6 md:p-8">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex-1 min-w-0">
            {topicLabel && (
              <Badge variant="outline" className="mb-3 font-mono border-[var(--color-primary)]/40 text-[var(--color-primary)] bg-[var(--color-primary)]/10">
                {topicLabel}
              </Badge>
            )}
            <h2 className="font-serif text-xl md:text-2xl font-semibold leading-snug">
              {displayedTitle}
            </h2>
            {isTranslated && !showOriginal && displayedTitle !== article.title && (
              <p className="mt-2 text-xs text-[var(--color-muted-foreground)]/80 italic">
                {article.title}
              </p>
            )}
          </div>
          <button
            onClick={toggleFavorite}
            title={favorited ? "Quitar de favoritos" : "Guardar en favoritos"}
            className="p-2 rounded-lg hover:bg-[var(--color-muted)] transition-colors text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] flex-shrink-0"
          >
            {favorited ? (
              <BookmarkCheck className="w-5 h-5 text-[var(--color-primary)]" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-5 text-sm text-[var(--color-muted-foreground)]">
          {article.authors.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>
                {article.authors.slice(0, 3).join(", ")}
                {article.authors.length > 3 ? ` +${article.authors.length - 3}` : ""}
              </span>
            </div>
          )}
          {article.journal && (
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span className="italic">{article.journal}</span>
            </div>
          )}
          {article.year && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{article.year}</span>
            </div>
          )}
        </div>

        <div className="relative">
          {translating && !translatedAbstract && (
            <div className="absolute right-0 top-0 flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)]">
              <Languages className="w-3.5 h-3.5 animate-pulse" />
              Traduciendo al español...
            </div>
          )}
          <p className="text-[var(--color-foreground)]/85 leading-relaxed text-sm md:text-base whitespace-pre-line">
            {displayedAbstract}
          </p>
          {isTranslated && (
            <button
              onClick={() => setShowOriginal((v) => !v)}
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
            >
              <Languages className="w-3.5 h-3.5" />
              {showOriginal ? "Ver traducción al español" : "Ver original en inglés"}
            </button>
          )}
        </div>

        <div className="mt-4 flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)]/60">
          <Info className="w-3 h-3" />
          <span>
            Fuente: PubMed/NCBI · Abstracts de acceso público
            {isTranslated && !showOriginal && " · Traducción automática"}
          </span>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 pt-5 border-t border-[var(--color-border)]">
          <a
            href={article.pubmedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Ver en PubMed
          </a>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments((s) => !s)}
            className="ml-auto"
          >
            {showComments ? "Ocultar comentarios" : "Ver comentarios"}
          </Button>
        </div>

        <div className="mt-4">
          <ReactionsBar pmid={article.pmid} />
        </div>

        {showComments && (
          <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
            <CommentsSection pmid={article.pmid} />
          </div>
        )}
      </div>
    </div>
  );
}
