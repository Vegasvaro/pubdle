/**
 * Proxy a NCBI E-utilities que añade la API key del lado servidor.
 *
 * El cliente llama a:
 *   /api/pubmed?endpoint=esearch&db=pubmed&term=...
 *   /api/pubmed?endpoint=efetch&db=pubmed&id=...
 *
 * Esta función reenvía la petición al endpoint correspondiente de NCBI
 * inyectando `api_key`, `tool` y `email` desde variables de entorno del
 * servidor, así NCBI_API_KEY nunca aparece en el bundle del navegador.
 *
 * Runtime: Edge (más rápido y barato; no requiere @vercel/node).
 */
export const config = {
  runtime: "edge",
};

const ALLOWED_ENDPOINTS = new Set(["esearch", "efetch"]);
const NCBI_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  const incoming = new URL(req.url);
  const endpoint = incoming.searchParams.get("endpoint");
  if (!endpoint || !ALLOWED_ENDPOINTS.has(endpoint)) {
    return new Response(
      JSON.stringify({ error: "Missing or invalid 'endpoint' param" }),
      { status: 400, headers: { "content-type": "application/json" } }
    );
  }

  const target = new URL(`${NCBI_BASE}/${endpoint}.fcgi`);
  incoming.searchParams.forEach((value, key) => {
    if (key === "endpoint") return;
    // No permitimos que el cliente sobrescriba estos parámetros:
    if (key === "api_key" || key === "tool" || key === "email") return;
    target.searchParams.append(key, value);
  });

  const apiKey = process.env.NCBI_API_KEY?.trim();
  if (apiKey) target.searchParams.set("api_key", apiKey);
  target.searchParams.set("tool", "pubdle");
  target.searchParams.set("email", "pubdle@example.com");

  try {
    const upstream = await fetch(target.toString(), {
      method: "GET",
      headers: { accept: req.headers.get("accept") ?? "*/*" },
    });

    const contentType =
      upstream.headers.get("content-type") ?? "application/octet-stream";
    const body = await upstream.arrayBuffer();

    return new Response(body, {
      status: upstream.status,
      headers: {
        "content-type": contentType,
        // Pequeño edge cache para suavizar picos sin perder frescura.
        "cache-control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Upstream NCBI request failed",
        message: err instanceof Error ? err.message : String(err),
      }),
      { status: 502, headers: { "content-type": "application/json" } }
    );
  }
}
