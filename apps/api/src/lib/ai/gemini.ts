import type { AiChatMessage, AiProvider } from "./provider";

// Not verified end-to-end against a real Gemini API key — this repo has no test credentials.
// Based on Google's published Gemini API docs (generateContent). Flagged in the Fase 2 report.
export class GeminiProvider implements AiProvider {
  constructor(
    private readonly apiKey: string,
    private readonly model: string
  ) {}

  async generateReply(systemPrompt: string, history: AiChatMessage[]): Promise<string> {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: history.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
        }),
      }
    );
    if (!res.ok) {
      throw new Error(`Gemini request failed: ${res.status} ${await res.text()}`);
    }
    const body = (await res.json()) as { candidates: { content: { parts: { text: string }[] } }[] };
    return body.candidates[0].content.parts.map((p) => p.text).join("");
  }
}
