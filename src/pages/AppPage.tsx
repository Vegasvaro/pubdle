import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import { Clock, FlaskConical, Lock, RefreshCw, Zap } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import ArticleCard from "@/components/ArticleCard";
import DailySlots from "@/components/DailySlots";
import TopicSelector from "@/components/TopicSelector";
import { Button } from "@/components/Button";
import {
  getArticleForTopic,
  getDailyTopicSlug,
  getDeterministicDailyArticle,
  type PubMedArticle,
} from "@/lib/pubmed";
import { TOPICS } from "@/lib/topics";
import {
  TIER_LIMITS,
  getReadsToday,
  getTier,
  isAdmin,
  pushHistory,
  recordRead,
  resetDailySimulation,
  todayKey,
  type Tier,
} from "@/lib/storage";

interface DailyState {
  article: PubMedArticle;
  topic: string;
}

const DAILY_KEY = "pubdle:daily";

function getStoredDaily(): (DailyState & { date: string }) | null {
  try {
    const raw = localStorage.getItem(DAILY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.date !== todayKey()) return null;
    if (!parsed.article?.pmid || !parsed.article?.title || !parsed.article?.abstract) return null;
    if (parsed.topic !== getDailyTopicSlug(todayKey(), TOPICS)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function setStoredDaily(state: DailyState) {
  localStorage.setItem(DAILY_KEY, JSON.stringify({ ...state, date: todayKey() }));
}

function CountdownTimer() {
  const [left, setLeft] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const m = new Date();
      m.setHours(24, 0, 0, 0);
      const diff = m.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const min = Math.floor((diff % 3600000) / 60000);
      const sec = Math.floor((diff % 60000) / 1000);
      setLeft(`${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center justify-center gap-2 text-[var(--color-muted-foreground)]">
      <Clock className="w-4 h-4" />
      <span className="font-mono text-sm">
        Nuevo artículo en <span className="text-[var(--color-foreground)] font-semibold">{left}</span>
      </span>
    </div>
  );
}

export default function AppPage() {
  const [tier, setTierState] = useState<Tier>(getTier());
  const [article, setArticle] = useState<PubMedArticle | null>(null);
  const [topic, setTopic] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [showTopic, setShowTopic] = useState(false);
  const [reads, setReads] = useState<string[]>([]);

  const limit = TIER_LIMITS[tier];
  const readCount = reads.length;
  const remaining = Math.max(0, limit - readCount);
  const limitReached = remaining <= 0 && tier !== "pro";

  const refreshState = useCallback(() => {
    setTierState(getTier());
    setReads(getReadsToday());
  }, []);

  useEffect(() => {
    let lastDay = todayKey();
    const tick = () => {
      const key = todayKey();
      if (key !== lastDay) {
        lastDay = key;
        if (tier === "free") {
          setArticle(null);
          setTopic("");
          setAnimate(false);
        }
      }
      refreshState();
    };
    tick();
    const onFocus = () => tick();
    window.addEventListener("focus", onFocus);
    const interval = setInterval(tick, 1500);
    return () => {
      window.removeEventListener("focus", onFocus);
      clearInterval(interval);
    };
  }, [refreshState, tier]);

  const loadFreeDaily = useCallback(async (force = false) => {
    if (!force) {
      const stored = getStoredDaily();
      if (stored) {
        setArticle(stored.article);
        setTopic(stored.topic);
        return;
      }
    }
    setLoading(true);
    setArticle(null);
    setTopic("");
    try {
      const result = await getDeterministicDailyArticle(todayKey(), TOPICS);
      if (!result) {
        toast.error("No se pudo obtener el artículo del día. Inténtalo más tarde.");
        return;
      }
      setStoredDaily({ article: result.article, topic: result.topicSlug });
      setArticle(result.article);
      setTopic(result.topicSlug);
      setAnimate(true);
      recordRead(result.article.pmid);
      pushHistory(result.article);
      refreshState();
    } catch (e) {
      console.error("[PubMed]", e);
      toast.error("Error al consultar PubMed: " + (e instanceof Error ? e.message : "desconocido"));
    } finally {
      setLoading(false);
    }
  }, [refreshState]);

  const restartSimulation = useCallback(async () => {
    resetDailySimulation();
    setArticle(null);
    setTopic("");
    setAnimate(false);
    setShowTopic(false);
    refreshState();
    toast.message("Reiniciando simulación…");
    if (tier === "free") {
      await loadFreeDaily(true);
    }
  }, [tier, loadFreeDaily, refreshState]);

  useEffect(() => {
    if (tier === "free" && !article && !loading) {
      loadFreeDaily();
    }
  }, [tier, article, loading, loadFreeDaily]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("reset") === "1") {
      window.history.replaceState({}, "", "/app");
      void restartSimulation();
    }
    // Solo al montar /app con ?reset=1
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePickTopic = async (slug: string) => {
    if (limitReached) {
      toast.error("Has alcanzado el límite diario.");
      setShowTopic(false);
      return;
    }
    setShowTopic(false);
    setLoading(true);
    setAnimate(false);
    try {
      const fetched = await getArticleForTopic(slug, reads);
      if (!fetched) {
        toast.error("No se encontraron artículos para este tema. Prueba con otro.");
        return;
      }
      setArticle(fetched);
      setTopic(slug);
      setAnimate(true);
      recordRead(fetched.pmid);
      pushHistory(fetched);
      refreshState();
    } catch (e) {
      console.error("[PubMed]", e);
      toast.error("Error al obtener el artículo: " + (e instanceof Error ? e.message : "desconocido"));
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (tier === "free") return;
    setShowTopic(true);
  };

  const [dateLabel, setDateLabel] = useState(() =>
    new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })
  );

  useEffect(() => {
    const update = () => {
      setDateLabel(
        new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })
      );
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Navbar />

      <div className="container py-8 max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold">Artículo del día</h1>
            <p className="text-[var(--color-muted-foreground)] text-sm mt-1 capitalize">{dateLabel}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <DailySlots readCount={readCount} limit={limit} tier={tier} />
            {isAdmin() && (
              <Button
                variant="outline"
                size="sm"
                onClick={restartSimulation}
                disabled={loading}
                className="text-xs border-[var(--color-border)]"
                title="Solo visible para admin"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                Nueva simulación
              </Button>
            )}
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-8">
            <div className="h-1 bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-primary)]/50 -mx-8 -mt-8 mb-8 rounded-t-2xl" />
            <div className="h-6 w-24 mb-4 bg-[var(--color-muted)] rounded animate-pulse" />
            <div className="h-8 w-full mb-2 bg-[var(--color-muted)] rounded animate-pulse" />
            <div className="h-8 w-3/4 mb-6 bg-[var(--color-muted)] rounded animate-pulse" />
            <div className="space-y-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-4 w-full bg-[var(--color-muted)] rounded animate-pulse" />
              ))}
            </div>
            <p className="mt-4 text-xs text-[var(--color-muted-foreground)] text-center">
              Buscando un artículo relevante en PubMed...
            </p>
          </div>
        )}

        {!loading && article && (
          <div className="animate-fade-up">
            <ArticleCard article={article} topic={topic} animate={animate} />
          </div>
        )}

        {!loading && !article && tier !== "free" && (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/40 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
              <FlaskConical className="w-8 h-8 text-[var(--color-primary)]" />
            </div>
            <h2 className="font-serif text-2xl font-bold mb-3">¿Qué quieres descubrir hoy?</h2>
            <p className="text-[var(--color-muted-foreground)] mb-8 max-w-sm mx-auto">
              Elige un tema y te mostraremos un artículo científico relevante de PubMed.
            </p>
            <Button size="lg" onClick={() => setShowTopic(true)} className="glow-emerald">
              <Zap className="w-4 h-4" />
              Elegir tema
            </Button>
          </div>
        )}

        {!loading && article && (
          <div className="mt-6 space-y-4">
            {remaining > 0 && tier !== "free" && (
              <Button onClick={handleNext} size="lg" className="w-full">
                Siguiente artículo →
                <span className="ml-2 text-xs opacity-70">({remaining} restantes)</span>
              </Button>
            )}

            {limitReached && (
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]/50 p-6 text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-[var(--color-muted-foreground)]">
                  <Lock className="w-5 h-5" />
                  <span className="font-medium">Has alcanzado tu límite diario</span>
                </div>
                <CountdownTimer />

                {tier === "free" && (
                  <div className="pt-2 border-t border-[var(--color-border)]">
                    <p className="text-sm text-[var(--color-muted-foreground)] mb-3">
                      Mejora tu plan para leer más artículos cada día.
                    </p>
                    <Link href="/pricing">
                      <Button>Ver planes →</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <TopicSelector
        open={showTopic && (tier === "basic" || tier === "pro")}
        onClose={() => setShowTopic(false)}
        onSelect={handlePickTopic}
        tier={tier === "pro" ? "pro" : "basic"}
      />
    </div>
  );
}
