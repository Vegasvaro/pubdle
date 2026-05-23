# Pubdle

Un artículo científico al día. Pubdle revela cada día un artículo de [PubMed/NCBI](https://pubmed.ncbi.nlm.nih.gov) en una de 25 especialidades de ciencias de la salud. **Solo artículos con _Free full text_**, para que puedas leer el paper completo sin barreras.

Esta versión es **100% cliente** (sin backend, sin base de datos) y consume directamente la API pública E-utilities de NCBI. El estado del usuario (favoritos, lecturas del día, comentarios, reacciones, plan) se guarda en `localStorage`.

## Stack

- **Vite** + **React 19** + **TypeScript**
- **TailwindCSS v4** (`@tailwindcss/vite`)
- **wouter** para routing
- **sonner** para toasts
- **lucide-react** para iconos
- Fetch directo a PubMed E-utilities (`esearch` + `efetch`)
- Traducción automática de títulos y abstracts al español con [MyMemory API](https://mymemory.translated.net/) (gratis, sin clave)
- Autenticación con [Supabase Auth](https://supabase.com/auth) (email + contraseña + Google)
- Suscripciones con [Stripe Payment Links](https://stripe.com/payments/payment-links)

## Estructura

```
src/
├── App.tsx
├── main.tsx
├── index.css           # Tema oscuro Pubdle (emerald + electric blue)
├── components/
│   ├── ArticleCard.tsx
│   ├── Badge.tsx
│   ├── Button.tsx
│   ├── CommentsSection.tsx
│   ├── DailySlots.tsx
│   ├── Navbar.tsx
│   ├── ReactionsBar.tsx
│   └── TopicSelector.tsx
├── lib/
│   ├── cn.ts
│   ├── config.ts       # Stripe Payment Links + hash contraseña admin
│   ├── pubmed.ts       # Cliente E-utilities + selección determinista diaria
│   ├── storage.ts      # Persistencia en localStorage
│   ├── topics.ts       # 25 especialidades
│   └── translate.ts    # Traducción automática
└── pages/
    ├── AboutPage.tsx
    ├── AdminPage.tsx
    ├── AppPage.tsx
    ├── FavoritesPage.tsx
    ├── Home.tsx
    ├── NotFound.tsx
    └── PricingPage.tsx
```

## Funcionalidades

### Cuentas de usuario con Supabase

La app pide cuenta para suscribirse a Basic o Pro. Hay un botón **"Iniciar sesión"** permanente arriba a la derecha en la navbar; cuando el usuario está logueado se convierte en un avatar con sus iniciales y un menú desplegable.

Para activar la autenticación:

1. Crea un proyecto gratis en <https://supabase.com>.
2. **Project Settings → API**, copia el **Project URL** y la **anon public** key.
3. Copia `.env.example` a `.env.local` y rellena los valores:

   ```bash
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
4. (Opcional) Para "Continuar con Google", configura el provider en Supabase → **Authentication → Providers → Google**.
5. En **Authentication → URL Configuration**, añade las URLs de redirección de tu dominio (`https://tu-dominio/login?confirmed=1`, `https://tu-dominio/app`, etc.).

Sin estas variables la página `/login` muestra un aviso y los planes Basic/Pro siguen visibles pero deshabilitados.

### Artículo diario compartido (plan Gratis)

Todos los usuarios free ven **el mismo artículo el mismo día**, sin necesidad de backend. Lo conseguimos derivando el tema y el PMID de un seed determinista basado en la fecha (`YYYY-MM-DD`).

### Filtro Free full text

Las consultas a PubMed incluyen `"free full text"[sb]`, así que todos los artículos seleccionados tienen el paper completo accesible gratis.

### Tres planes

| Plan  | Artículos/día | Selección de tema |
|-------|---------------|--------------------|
| Free  | 1 (compartido)| Asignado por el sistema |
| Basic | 5             | 5 temas a elegir |
| Pro   | ilimitado     | 10 temas a elegir |

Todos los planes permiten **+1 artículo extra** "viendo un anuncio" (simulado con un toast).

### Suscripciones con Stripe

La página `/pricing` redirige a Stripe Payment Links para Basic y Pro. Configura tus URLs en `src/lib/config.ts`:

```ts
export const STRIPE_PAYMENT_LINKS = {
  basic: "https://buy.stripe.com/...",
  pro: "https://buy.stripe.com/...",
};
```

En el dashboard de Stripe, configura la URL de éxito de cada Payment Link como:

```
https://tu-dominio/pricing?payment=success&plan=basic
https://tu-dominio/pricing?payment=success&plan=pro
```

Pubdle detectará automáticamente esos query params y activará el plan.

### Panel de administración

`/admin` requiere contraseña. El hash SHA-256 se guarda en `src/lib/config.ts`:

```ts
export const ADMIN_PASSWORD_HASH = "...sha256...";
```

Para regenerar el hash:

```js
// En la consola del navegador
const data = new TextEncoder().encode("tu-contraseña");
const buf = await crypto.subtle.digest("SHA-256", data);
console.log([...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join(""));
```

Una vez dentro de `/admin`:

- Cambia entre planes Free/Basic/Pro al instante (sin pagar)
- Borra datos locales
- Aparece el botón "Admin" en la navbar

### Traducción automática al español

Tanto el **título** como el **abstract** de cada artículo se traducen automáticamente al español usando MyMemory (gratis, sin API key, CORS abierto). Hay caché en `localStorage` y un botón para alternar entre la traducción y el original en inglés. Bajo el título traducido se muestra el título original en cursiva para mantener la trazabilidad científica.

## Desarrollo

```bash
npm install
npm run dev
```

Abre <http://localhost:5173>.

## Build de producción

```bash
npm run build
npm run preview
```

## Desplegar

### Vercel

1. Sube el repo a GitHub.
2. En [vercel.com](https://vercel.com) → **Add New → Project** → importa el repo.
3. Framework: **Vite** (detectado automáticamente).
4. Build command: `npm run build` · Output: `dist`.
5. **Deploy**.

El archivo `vercel.json` ya gestiona el routing SPA.

### Netlify

1. Sube el repo a GitHub.
2. [Netlify](https://app.netlify.com) → **Add new site → Import from Git**.
3. Build command: `npm run build` · Publish dir: `dist`.
4. **Deploy**.

### Cloudflare Pages

1. [Cloudflare Pages](https://pages.cloudflare.com) → **Create project** → conecta el repo.
2. Framework preset: **Vite**.

## Notas

- **PubMed E-utilities** responde con CORS abierto.
- **MyMemory** acepta 5 000 caracteres al día por IP de forma gratuita. Para tráfico alto, considera un plan de pago o cambia a otra API (LibreTranslate, DeepL).
- El artículo del **plan Free** se calcula localmente pero es determinista por fecha → todos los usuarios ven lo mismo.
- En navegación privada / al borrar datos del sitio, se reinicia todo el estado.

## Licencia

MIT
