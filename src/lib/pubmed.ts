import { getTopicByslug } from "./topics";

// Llamamos a nuestro proxy serverless `/api/pubmed`, que reenvía la petición
// a NCBI E-utilities añadiendo la API key del lado servidor. Así la clave
// nunca queda expuesta en el bundle del navegador. En desarrollo, el proxy
// de Vite hace lo mismo (ver vite.config.ts).
const PROXY = "/api/pubmed";

function buildProxyUrl(
  endpoint: "esearch" | "efetch",
  params: URLSearchParams
): string {
  params.set("endpoint", endpoint);
  return `${PROXY}?${params.toString()}`;
}

// Tipos de publicación vetados. Todos son [Publication Type] válidos en PubMed
// EXCEPTO "Books and Documents", que se gestiona como subset filter (ver abajo).
const EXCLUDED_TYPES = [
  "Letter",
  "Biography",
  "Lecture",
  "News",
  "Published Erratum",
  "Conference Proceedings",
  "Editorial",
  "Interview",
  "Video-Audio Media",
  "Webcast",
  "Expression of Concern",
  "Retraction Notice",
  "Retracted Publication",
  "Festschrift",
  "Preprint",
];

export interface PubMedArticle {
  pmid: string;
  title: string;
  authors: string[];
  journal: string;
  year: string;
  abstract: string;
  pubmedUrl: string;
}

export async function searchPmids(topicSlug: string, excludePmids: string[] = [], retmax = 80): Promise<string[]> {
  const topic = getTopicByslug(topicSlug);
  if (!topic) return [];

  const excludeClause = EXCLUDED_TYPES.map((t) => `NOT "${t}"[Publication Type]`).join(" ");
  // Solo artículos con "Free full text" (loattrfree full text[sb]) y con abstract.
  // Excluimos también el subset "Books and Documents" (Bookshelf) que no es un Publication Type.
  const term = `(${topic.searchTerm}) AND hasabstract[text] AND english[lang] AND "free full text"[sb] NOT "pubmed books and documents"[sb] ${excludeClause}`;

  const params = new URLSearchParams({
    db: "pubmed",
    term,
    retmax: String(retmax),
    retmode: "json",
    sort: "relevance",
    datetype: "pdat",
    reldate: "1825",
  });

  const res = await fetch(buildProxyUrl("esearch", params));
  if (!res.ok) throw new Error("PubMed search failed");
  const data = await res.json();
  const ids: string[] = data?.esearchresult?.idlist ?? [];
  return ids.filter((id) => !excludePmids.includes(id));
}

export async function fetchArticle(pmid: string): Promise<PubMedArticle | null> {
  const params = new URLSearchParams({
    db: "pubmed",
    id: pmid,
    retmode: "xml",
    rettype: "abstract",
  });
  const res = await fetch(buildProxyUrl("efetch", params));
  if (!res.ok) return null;
  const xml = await res.text();
  return parseArticleXml(xml, pmid);
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function parseArticleXml(xml: string, pmid: string): PubMedArticle | null {
  try {
    const titleMatch = xml.match(/<ArticleTitle[^>]*>([\s\S]*?)<\/ArticleTitle>/);
    const title = stripTags(titleMatch?.[1] ?? "");
    if (!title) return null;

    const abstractMatches = xml.match(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g);
    const abstract = abstractMatches
      ? abstractMatches.map((m) => stripTags(m)).join(" ")
      : "";
    if (!abstract) return null;

    const authorRegex = /<Author[^>]*>[\s\S]*?<LastName>([\s\S]*?)<\/LastName>(?:[\s\S]*?<ForeName>([\s\S]*?)<\/ForeName>)?/g;
    const authors: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = authorRegex.exec(xml)) !== null && authors.length < 8) {
      const last = stripTags(m[1] ?? "");
      const first = stripTags(m[2] ?? "");
      authors.push(first ? `${first} ${last}` : last);
    }

    const journalMatch = xml.match(/<Journal>[\s\S]*?<Title>([\s\S]*?)<\/Title>/);
    const journal = stripTags(journalMatch?.[1] ?? "");

    const yearMatch = xml.match(/<PubDate>[\s\S]*?<Year>(\d{4})<\/Year>/);
    const year = yearMatch?.[1] ?? "";

    return {
      pmid,
      title,
      authors,
      journal,
      year,
      abstract,
      pubmedUrl: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
    };
  } catch {
    return null;
  }
}

export async function getArticleForTopic(topicSlug: string, excludePmids: string[] = []): Promise<PubMedArticle | null> {
  const pmids = await searchPmids(topicSlug, excludePmids, 80);
  if (pmids.length === 0) return null;

  const shuffled = [...pmids].sort(() => Math.random() - 0.5).slice(0, 12);
  for (const pmid of shuffled) {
    const article = await fetchArticle(pmid);
    if (article) return article;
  }
  return null;
}

/**
 * Devuelve siempre el mismo artículo para todos los usuarios en un día dado.
 * El tema y el PMID se eligen de forma determinista a partir de `dateKey` (YYYY-MM-DD).
 */
export async function getDeterministicDailyArticle(
  dateKey: string,
  topics: { slug: string }[]
): Promise<{ article: PubMedArticle; topicSlug: string } | null> {
  const seed = hashString(dateKey);
  const rand = mulberry32(seed);

  const topicIdx = Math.floor(rand() * topics.length);
  const topicSlug = topics[topicIdx].slug;

  const pmids = await searchPmids(topicSlug, [], 60);
  if (pmids.length === 0) return null;

  const startIdx = Math.floor(rand() * Math.min(pmids.length, 30));
  for (let i = 0; i < pmids.length; i++) {
    const pmid = pmids[(startIdx + i) % pmids.length];
    const article = await fetchArticle(pmid);
    if (article) return { article, topicSlug };
  }
  return null;
}

function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
