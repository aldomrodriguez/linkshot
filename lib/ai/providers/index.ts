import type { AIProvider } from "../types";
import { groqProvider } from "./groq";
import { openrouterProvider } from "./openrouter";

// Solo incluir providers que tienen API key configurada
export function getActiveProviders(): AIProvider[] {
  const providers: AIProvider[] = [];
  if (process.env.GROQ_API_KEY) providers.push(groqProvider);
  if (process.env.OPENROUTER_API_KEY) providers.push(openrouterProvider);
  return providers;
}
