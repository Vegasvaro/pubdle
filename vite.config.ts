import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

const NCBI_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
const ALLOWED_ENDPOINTS = new Set(["esearch", "efetch"]);

export default defineConfig(({ mode }) => {
  // loadEnv con prefix "" lee TODAS las variables (incluidas las no-VITE_).
  // Estas solo se usan dentro del servidor de Vite, NUNCA se inyectan en el cliente.
  const env = loadEnv(mode, process.cwd(), "");
  const ncbiApiKey = env.NCBI_API_KEY?.trim();

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
      },
    },
    server: {
      proxy: {
        // En desarrollo, replicamos el comportamiento de /api/pubmed en
        // producción: reescribimos la URL hacia NCBI y añadimos la API key
        // desde process.env (no expuesta al navegador).
        "/api/pubmed": {
          target: NCBI_BASE,
          changeOrigin: true,
          rewrite: (originalPath) => {
            const url = new URL(originalPath, "http://localhost");
            const endpoint = url.searchParams.get("endpoint");
            if (!endpoint || !ALLOWED_ENDPOINTS.has(endpoint)) {
              return "/entrez/eutils/esearch.fcgi";
            }
            url.searchParams.delete("endpoint");
            url.searchParams.delete("api_key");
            url.searchParams.delete("tool");
            url.searchParams.delete("email");
            if (ncbiApiKey) url.searchParams.set("api_key", ncbiApiKey);
            url.searchParams.set("tool", "pubdle");
            url.searchParams.set("email", "pubdle@example.com");
            return `/entrez/eutils/${endpoint}.fcgi?${url.searchParams.toString()}`;
          },
        },
      },
    },
  };
});
