# Linkshot

**Convierte cualquier URL en 3 social cards listas para compartir** — con screenshots reales, contenido generado por IA y paletas de colores personalizables.

Proyecto construido para el **CubePath 2026 Hackathon**.

---

## ¿Qué hace?

1. Pegas una URL
2. La app captura screenshots reales con Puppeteer (desktop 1280×800 y mobile 390×844)
3. La IA (Groq + OpenRouter en round-robin) genera un título, descripción y 4 paletas de colores
4. Eliges la paleta y editás el texto si querés
5. Se generan 3 cards listas para descargar:
   - **Card Desktop** — 1200×630px (ideal para Twitter/X, LinkedIn, Facebook)
   - **Card Mobile** — 1080×1920px (ideal para Instagram Stories)
   - **Card Mixta** — 1200×630px con ambos mockups

---

## Stack

- **Next.js 14+** — App Router, TypeScript strict
- **Tailwind CSS** — estilos
- **Puppeteer** — screenshots reales del sitio
- **Sharp** — composición de imágenes con mockups de dispositivos
- **Groq** (primario) + **OpenRouter** (fallback) — IA con round-robin automático
- **JSZip** — descarga en ZIP desde el cliente

---

## Correr localmente

```bash
git clone https://github.com/tu-usuario/linkshot.git
cd linkshot
npm install
cp .env.example .env.local
# Editar .env.local con tus API keys
npm run dev
```

Variables de entorno necesarias:

```env
GROQ_API_KEY=       # https://console.groq.com
OPENROUTER_API_KEY= # https://openrouter.ai
```

---

## Deploy — CubePath VPS con Dokploy + Railpack

El proyecto está desplegado en un VPS de **CubePath** usando:

- **Dokploy** como plataforma de deploy (self-hosted)
- **Railpack** como sistema de build (auto-detecta Next.js, sin Docker manual)
- **Traefik** para SSL automático y routing
- **Webhook de GitHub** para deploy automático en cada push a `main`

El archivo `railpack.json` instala `google-chrome-stable` en el servidor para que Puppeteer funcione en Linux.

---

## Arquitectura

```
POST /api/process
  → Puppeteer: desktop screenshot (1280×800) + mobile screenshot (390×844)
  → lib/meta.ts: extrae og:title, og:description, theme-color
  → lib/ai/robin.ts: llama a IA → { titulo, descripcion, paletas[] }

POST /api/generate-cards
  → lib/compose.ts: Sharp compone 3 cards con mockups SVG
  → devuelve: card1 (desktop), card2 (mobile), card3 (mixta) en base64
```

El sistema de IA usa round-robin: si Groq responde con 429 o error de red, rota automáticamente a OpenRouter. Agregar un nuevo provider requiere solo un archivo adaptador en `lib/ai/providers/`.
