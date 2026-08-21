import type { AiChatMessage, AiProvider } from "./provider";

// Not verified end-to-end against a real Anthropic API key — this repo has no test credentials.
// Based on the published Messages API docs. Flagged in the Fase 2 report.
export class AnthropicProvider implements AiProvider {
  constructor(
    private readonly apiKey: string,
    private readonly model: string
  ) {}

  async generateReply(systemPrompt: string, history: AiChatMessage[]): Promise<string> {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 1024,
        system: systemPrompt,
        messages: history,
      }),
    });
    if (!res.ok) {
      throw new Error(`Anthropic request failed: ${res.status} ${await res.text()}`);
    }
    const body = (await res.json()) as { content: { type: string; text?: string }[] };
    return body.content
      .filter((c) => c.type === "text")
      .map((c) => c.text ?? "")
      .join("");
  }
}
