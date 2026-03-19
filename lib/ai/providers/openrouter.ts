import type { AIProvider } from "../types";

export const openrouterProvider: AIProvider = {
  name: "OpenRouter",

  async call(prompt: string): Promise<string> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("OPENROUTER_API_KEY no configurada");

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://linkshot.app",
        "X-Title": "Linkshot",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.3-8b-instruct:free",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (res.status === 429) throw Object.assign(new Error("Rate limit OpenRouter"), { status: 429 });
    if (!res.ok) throw new Error(`Error OpenRouter: ${res.status}`);

    const data = await res.json() as { choices: { message: { content: string } }[] };
    return data.choices[0].message.content;
  },
};
