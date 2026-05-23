import type { PubMedArticle } from "./pubmed";

const KEYS = {
  reads: "pubdle:reads",
  favorites: "pubdle:favorites",
  lists: "pubdle:lists",
  history: "pubdle:history",
  reactions: "pubdle:reactions",
  tier: "pubdle:tier",
  admin: "pubdle:isAdmin",
} as const;

// Migración suave de las claves antiguas "articled:*" a "pubdle:*" (una sola vez).
(function migrateLegacyKeys() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem("pubdle:migrated") === "1") return;
  const map: Record<string, string> = {
    "articled:reads": KEYS.reads,
    "articled:favorites": KEYS.favorites,
    "articled:history": KEYS.history,
    "articled:reactions": KEYS.reactions,
    "articled:tier": KEYS.tier,
    "articled:isAdmin": KEYS.admin,
    "articled:daily": "pubdle:daily",
    "articled:comments": "pubdle:comments",
    "articled:name": "pubdle:name",
    "articled:translations": "pubdle:translations",
  };
  for (const [old, next] of Object.entries(map)) {
    const v = localStorage.getItem(old);
    if (v !== null && localStorage.getItem(next) === null) {
      localStorage.setItem(next, v);
    }
    localStorage.removeItem(old);
  }
  // Limpieza de claves obsoletas (funcionalidad "ver anuncio" eliminada).
  localStorage.removeItem("articled:bonus");
  localStorage.removeItem("pubdle:bonus");
  localStorage.setItem("pubdle:migrated", "1");
})();

export type Tier = "free" | "basic" | "pro";

export const TIER_LIMITS: Record<Tier, number> = {
  free: 1,
  basic: 5,
  pro: 999,
};

export const TIER_TOPIC_CHOICES: Record<Tier, number> = {
  free: 0,
  basic: 5,
  pro: 10,
};

/** Fecha local del usuario (YYYY-MM-DD), alineada con medianoche del contador. */
export function todayKey(): string {
  return new Date().toLocaleDateString("en-CA");
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota */
  }
}

interface DailyReadEntry {
  date: string;
  pmids: string[];
}

export function getReadsToday(): string[] {
  const all = readJson<DailyReadEntry[]>(KEYS.reads, []);
  const today = todayKey();
  return all.find((r) => r.date === today)?.pmids ?? [];
}

export function recordRead(pmid: string) {
  const all = readJson<DailyReadEntry[]>(KEYS.reads, []);
  const today = todayKey();
  let entry = all.find((r) => r.date === today);
  if (!entry) {
    entry = { date: today, pmids: [] };
    all.push(entry);
  }
  if (!entry.pmids.includes(pmid)) entry.pmids.push(pmid);
  const recent = all.slice(-30);
  writeJson(KEYS.reads, recent);
}

/** Reinicia lecturas del día y artículo guardado (mantiene favoritos, plan y comentarios). */
export function resetDailySimulation() {
  localStorage.removeItem("pubdle:daily");

  const today = todayKey();
  const all = readJson<DailyReadEntry[]>(KEYS.reads, []);
  writeJson(
    KEYS.reads,
    all.filter((r) => r.date !== today)
  );
}

export function getTier(): Tier {
  const t = (localStorage.getItem(KEYS.tier) as Tier | null) ?? "free";
  return t === "free" || t === "basic" || t === "pro" ? t : "free";
}

export function setTier(tier: Tier) {
  localStorage.setItem(KEYS.tier, tier);
}

export function isAdmin(): boolean {
  return localStorage.getItem(KEYS.admin) === "1";
}

export function setAdmin(value: boolean) {
  if (value) localStorage.setItem(KEYS.admin, "1");
  else localStorage.removeItem(KEYS.admin);
}

export interface FavoriteEntry {
  pmid: string;
  savedAt: number;
  article: PubMedArticle;
  list?: string;
}

export function getFavorites(): FavoriteEntry[] {
  return readJson<FavoriteEntry[]>(KEYS.favorites, []);
}

export function isFavorite(pmid: string): boolean {
  return getFavorites().some((f) => f.pmid === pmid);
}

export function addFavorite(article: PubMedArticle, list?: string) {
  const favs = getFavorites();
  if (favs.some((f) => f.pmid === article.pmid)) return;
  favs.unshift({ pmid: article.pmid, savedAt: Date.now(), article, list });
  writeJson(KEYS.favorites, favs);
}

export function removeFavorite(pmid: string) {
  const favs = getFavorites().filter((f) => f.pmid !== pmid);
  writeJson(KEYS.favorites, favs);
}

export function setFavoriteList(pmid: string, list: string | undefined) {
  const favs = getFavorites().map((f) => (f.pmid === pmid ? { ...f, list } : f));
  writeJson(KEYS.favorites, favs);
  if (list) ensureListExists(list);
}

/**
 * Listas son una entidad propia: viven en KEYS.lists incluso cuando están vacías.
 * Se devuelven combinadas con las listas implícitas que pudieran aparecer en
 * favoritos antiguos (migración suave).
 */
export function getFavoriteLists(): string[] {
  const explicit = readJson<string[]>(KEYS.lists, []);
  const implicit = new Set<string>();
  for (const f of getFavorites()) {
    if (f.list) implicit.add(f.list);
  }
  const merged = new Set<string>([...explicit, ...implicit]);
  return Array.from(merged).sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
}

function ensureListExists(name: string) {
  const current = readJson<string[]>(KEYS.lists, []);
  if (current.includes(name)) return;
  writeJson(KEYS.lists, [...current, name]);
}

/**
 * Crea una lista vacía. Devuelve true si se creó, false si ya existía
 * (case-insensitive).
 */
export function createFavoriteList(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed) return false;
  const current = readJson<string[]>(KEYS.lists, []);
  const collision = current.some((l) => l.toLowerCase() === trimmed.toLowerCase());
  if (collision) return false;
  writeJson(KEYS.lists, [...current, trimmed]);
  return true;
}

/**
 * Renombra una lista. Actualiza también el campo `list` de todos los favoritos
 * que la usaran. Devuelve false si el nuevo nombre ya existe.
 */
export function renameFavoriteList(oldName: string, newName: string): boolean {
  const trimmed = newName.trim();
  if (!trimmed || trimmed === oldName) return false;
  const current = readJson<string[]>(KEYS.lists, []);
  if (current.some((l) => l !== oldName && l.toLowerCase() === trimmed.toLowerCase())) {
    return false;
  }
  writeJson(
    KEYS.lists,
    current.map((l) => (l === oldName ? trimmed : l))
  );
  const favs = getFavorites().map((f) =>
    f.list === oldName ? { ...f, list: trimmed } : f
  );
  writeJson(KEYS.favorites, favs);
  return true;
}

/**
 * Elimina una lista. Los favoritos que estaban en ella pasan a "sin lista"
 * (no se borran los artículos, solo la asignación).
 */
export function deleteFavoriteList(name: string) {
  const current = readJson<string[]>(KEYS.lists, []);
  writeJson(KEYS.lists, current.filter((l) => l !== name));
  const favs = getFavorites().map((f) => (f.list === name ? { ...f, list: undefined } : f));
  writeJson(KEYS.favorites, favs);
}

export interface HistoryEntry {
  pmid: string;
  readAt: number;
  article: PubMedArticle;
}

export function pushHistory(article: PubMedArticle) {
  const hist = readJson<HistoryEntry[]>(KEYS.history, []);
  const filtered = hist.filter((h) => h.pmid !== article.pmid);
  filtered.unshift({ pmid: article.pmid, readAt: Date.now(), article });
  writeJson(KEYS.history, filtered.slice(0, 100));
}

export function getHistory(): HistoryEntry[] {
  return readJson<HistoryEntry[]>(KEYS.history, []);
}

export type ReactionEmoji = "fire" | "thinking" | "thumbsup" | "heart" | "shocked";

interface ReactionState {
  counts: Record<ReactionEmoji, number>;
  mine: ReactionEmoji | null;
}

function defaultReactions(): ReactionState {
  return {
    counts: { fire: 0, thinking: 0, thumbsup: 0, heart: 0, shocked: 0 },
    mine: null,
  };
}

export function getReactions(pmid: string): ReactionState {
  const all = readJson<Record<string, ReactionState>>(KEYS.reactions, {});
  return all[pmid] ?? defaultReactions();
}

export function toggleReaction(pmid: string, emoji: ReactionEmoji): ReactionState {
  const all = readJson<Record<string, ReactionState>>(KEYS.reactions, {});
  const state = all[pmid] ?? defaultReactions();
  if (state.mine === emoji) {
    state.counts[emoji] = Math.max(0, state.counts[emoji] - 1);
    state.mine = null;
  } else {
    if (state.mine) state.counts[state.mine] = Math.max(0, state.counts[state.mine] - 1);
    state.counts[emoji] = (state.counts[emoji] ?? 0) + 1;
    state.mine = emoji;
  }
  all[pmid] = state;
  writeJson(KEYS.reactions, all);
  return state;
}
