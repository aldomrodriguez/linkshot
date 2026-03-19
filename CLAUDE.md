# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Linkshot** — URL-to-social-card generator built for the CubePath 2026 Hackathon. The user pastes a URL; the app captures real screenshots, uses AI to generate/improve title+description and propose color palettes, then composes 3 social-ready cards (desktop, mobile, mixed) using device mockups.

**Deadline:** March 31, 2026 at 23:59:59 CET.

## Stack

- **Next.js 14+** with App Router, TypeScript strict, Tailwind CSS
- **Puppeteer** — browser screenshots (desktop 1280×800, mobile 390×844)
- **Sharp** — image composition (screenshots inside device mockup frames)
- **Groq** (primary) + **OpenRouter** (fallback) — AI via round-robin system
- **Deploy:** CubePath VPS → Dokploy → Railpack (auto-detects Next.js, no Docker)

## Commands

Once the project is initialized (`npx create-next-app@latest`):

```bash
npm run dev      # local dev server
npm run build    # production build
npm run lint     # ESLint
```

## Architecture

### Request Flow

```
POST /api/process
  → Puppeteer: desktop screenshot (1280×800) + mobile screenshot (390×844)
  → lib/meta.ts: extract og:title, og:description, dominant colors
  → lib/ai/robin.ts: call AI → returns { titulo, descripcion, paletas[] }

POST /api/generate-cards  (after user picks palette)
  → lib/compose.ts: Sharp composes 3 cards using /public/mockups/
  → returns: Card1 (1200×630px desktop), Card2 (1080×1920px mobile), Card3 (1200×630px mixed)
```

### AI Round-Robin (`lib/ai/`)

`robin.ts` iterates through providers in `providers/index.ts`. On 429 or network error, advances to the next provider transparently. Providers are enabled based on which env vars are set. Adding a new provider requires only a new adapter file + registration in `index.ts`.

### Key API Route Constraints

- Set `export const maxDuration = 60` in API routes — screenshots can take several seconds
- Always close Puppeteer browser after each screenshot to free RAM (do not reuse across requests)
- Puppeteer must launch with `{ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] }` for Linux/production

### Railpack (production)

If Chrome dependencies are missing, add to `railpack.json`:
```json
{ "packages": ["google-chrome-stable"] }
```

## Environment Variables

```env
GROQ_API_KEY=
OPENROUTER_API_KEY=
```

## Code Style

- **Comments in Spanish**, function/variable names in English
- Strict TypeScript — no `any`
- Error handling required at all critical points: Puppeteer, Sharp, AI API calls

## AI Prompt Contract

The AI must return **strict JSON only** (no markdown, no backticks):
```json
{
  "titulo": "...",
  "descripcion": "...",
  "paletas": [
    { "nombre": "Océano", "color1": "#0ea5e9", "color2": "#0369a1" },
    ...
  ]
}
```
Title max 60 chars, description max 120 chars, always 4 palettes.
