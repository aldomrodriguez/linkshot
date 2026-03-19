import type { AIProvider } from "../types";

export const groqProvider: AIProvider = {
  name: "Groq",

  async call(prompt: string): Promise<string> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY no configurada");

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (res.status === 429) throw Object.assign(new Error("Rate limit Groq"), { status: 429 });
    if (!res.ok) throw new Error(`Error Groq: ${res.status}`);

    const data = await res.json() as { choices: { message: { content: string } }[] };
    return data.choices[0].message.content;
  },
};
