import type { PageMeta } from "../meta";
import type { AIResponse } from "./types";
import { getActiveProviders } from "./providers/index";

/** Construye el prompt de análisis de página */
function buildPrompt(meta: PageMeta): string {
  return `Analiza esta página web y genera contenido optimizado para redes sociales.

Datos de la página:
- Título actual: ${meta.title || "(no disponible)"}
- Descripción actual: ${meta.description || "(no disponible)"}
- Color de tema: ${meta.themeColor || "(no disponible)"}

Tu tarea:
1. Crea un título atractivo (máximo 60 caracteres)
2. Crea una descripción llamativa (máximo 120 caracteres)
3. Propón exactamente 4 paletas de colores con nombres creativos en español

Responde ÚNICAMENTE con JSON válido, sin markdown, sin backticks, sin explicaciones:
{
  "titulo": "...",
  "descripcion": "...",
  "paletas": [
    { "nombre": "Océano", "color1": "#0ea5e9", "color2": "#0369a1" },
    { "nombre": "Atardecer", "color1": "#f97316", "color2": "#dc2626" },
    { "nombre": "Bosque", "color1": "#22c55e", "color2": "#15803d" },
    { "nombre": "Galaxia", "color1": "#8b5cf6", "color2": "#6d28d9" }
  ]
}`;
}

/** Llama a la IA con round-robin de providers. Si uno falla (429 o red), prueba el siguiente. */
export async function analyzeWithAI(meta: PageMeta): Promise<AIResponse> {
  const providers = getActiveProviders();

  if (providers.length === 0) {
    throw new Error("No hay providers de IA configurados. Agrega GROQ_API_KEY u OPENROUTER_API_KEY en .env.local");
  }

  const prompt = buildPrompt(meta);
  const errors: string[] = [];

  for (const provider of providers) {
    try {
      const raw = await provider.call(prompt);

      // Limpiar posibles backticks o markdown que el modelo agregue
      const cleaned = raw
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();

      const parsed = JSON.parse(cleaned) as AIResponse;

      // Validar estructura básica
      if (!parsed.titulo || !parsed.descripcion || !Array.isArray(parsed.paletas)) {
        throw new Error("Respuesta de IA con estructura inválida");
      }

      return parsed;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`[${provider.name}] ${msg}`);

      // Si es rate limit o error de red, rotamos al siguiente provider
      const isRetryable =
        msg.includes("429") ||
        msg.includes("Rate limit") ||
        msg.includes("fetch") ||
        msg.includes("network") ||
        msg.includes("ECONNREFUSED");

      if (!isRetryable) {
        // Error no recuperable (estructura inválida, JSON malformado, etc.)
        // Intentar igual con el siguiente provider
      }
    }
  }

  throw new Error(`Todos los providers de IA fallaron:\n${errors.join("\n")}`);
}
