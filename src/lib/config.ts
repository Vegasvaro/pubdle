/**
 * Configuración de Pubdle.
 *
 * - STRIPE_PAYMENT_LINKS: URLs de Stripe Payment Links para cada plan (las generas en el
 *   dashboard de Stripe → Product catalog → "Create payment link"). Estas URLs son
 *   seguras de poner en el cliente.
 *
 * - ADMIN_PASSWORD_HASH: hash SHA-256 de la contraseña de admin. Para generarlo,
 *   abre la consola del navegador y ejecuta:
 *
 *     await (async () => {
 *       const data = new TextEncoder().encode("tu-contraseña-aquí");
 *       const buf = await crypto.subtle.digest("SHA-256", data);
 *       return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
 *     })();
 *
 *   Y pega el resultado abajo. Así la contraseña en claro NO aparece en el código.
 *
 * - La autenticación de usuarios se gestiona con Supabase. Las claves van en
 *   variables de entorno `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
 *   (ver `.env.example`). No vivirán nunca en este fichero.
 */

export const STRIPE_PAYMENT_LINKS: Record<"basic" | "pro", string> = {
  basic: "https://buy.stripe.com/9B6bJ035L6lscLC8Eb24000",
  pro: "https://buy.stripe.com/4gMdR8aydeRY8vm7A724001",
};

// SHA-256 de la contraseña admin. Vacío = admin deshabilitado.
// Generado a partir de la contraseña secreta del propietario.
export const ADMIN_PASSWORD_HASH: string =
  "0fdaf8c450b0ad9815eab7551a485aa683ec0d0faf59dc27e0dcfaf2724a1c90";

export async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  if (!ADMIN_PASSWORD_HASH) return false;
  const hash = await sha256Hex(password);
  return hash === ADMIN_PASSWORD_HASH.toLowerCase();
}
