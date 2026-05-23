/**
 * Sitemap dinámico servido desde Edge (respaldo del estático en /public).
 * Útil si Search Console tiene problemas leyendo el archivo estático.
 * URL: https://pubdle.com/api/sitemap
 */
export const config = { runtime: "edge" };

const BASE = "https://pubdle.com";

const PAGES: Array<{ path: string; changefreq: string; priority: string }> = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/app", changefreq: "daily", priority: "0.9" },
  { path: "/pricing", changefreq: "monthly", priority: "0.8" },
  { path: "/about", changefreq: "monthly", priority: "0.7" },
];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function handler(): Response {
  const lastmod = today();
  const urls = PAGES.map(
    (p) => `  <url>
    <loc>${BASE}${p.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  ).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
