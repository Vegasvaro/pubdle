const CACHE_KEY = "pubdle:translations";
const SUPPORTED = new Set(["es", "fr", "de", "it", "pt", "ca", "gl", "eu", "nl", "pl", "ru", "ja", "ko", "zh", "ar", "tr"]);

export function detectUserLang(): string {
  if (typeof navigator === "undefined") return "en";
  const raw = (navigator.language || "en").toLowerCase();
  const code = raw.split("-")[0];
  return SUPPORTED.has(code) ? code : "en";
}

interface CacheShape {
  [key: string]: { text: string; ts: number };
}

function readCache(): CacheShape {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeCache(c: CacheShape) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(c));
  } catch {
    /* quota */
  }
}

function cacheKey(text: string, targetLang: string): string {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  return `${targetLang}:${h >>> 0}`;
}

/**
 * Traduce `text` al `targetLang` usando MyMemory (gratis, sin API key, CORS abierto).
 * Devuelve el texto original si la traducción falla o si el idioma destino es inglés.
 */
export async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || targetLang === "en") return text;

  const key = cacheKey(text, targetLang);
  const cache = readCache();
  if (cache[key]) return cache[key].text;

  const chunks = chunkText(text, 480);
  const translated: string[] = [];

  for (const chunk of chunks) {
    try {
      const url = new URL("https://api.mymemory.translated.net/get");
      url.searchParams.set("q", chunk);
      url.searchParams.set("langpair", `en|${targetLang}`);
      url.searchParams.set("de", "pubdle@example.com");

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("translate http " + res.status);
      const data = await res.json();
      const out = data?.responseData?.translatedText;
      if (typeof out === "string" && out.trim().length > 0) {
        translated.push(decodeEntities(out));
      } else {
        translated.push(chunk);
      }
    } catch (err) {
      console.warn("[translate]", err);
      translated.push(chunk);
    }
  }

  const result = translated.join(" ");
  cache[key] = { text: result, ts: Date.now() };
  pruneCache(cache);
  writeCache(cache);
  return result;
}

function chunkText(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text];
  const sentences = text.split(/(?<=[.!?])\s+/);
  const out: string[] = [];
  let buf = "";
  for (const s of sentences) {
    if ((buf + " " + s).length > maxChars) {
      if (buf) out.push(buf);
      buf = s;
    } else {
      buf = buf ? buf + " " + s : s;
    }
  }
  if (buf) out.push(buf);
  return out;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

function pruneCache(c: CacheShape) {
  const keys = Object.keys(c);
  if (keys.length <= 200) return;
  const sorted = keys.sort((a, b) => c[a].ts - c[b].ts);
  for (let i = 0; i < keys.length - 200; i++) delete c[sorted[i]];
}
