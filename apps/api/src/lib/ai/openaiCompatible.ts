import type { AiChatMessage, AiProvider } from "./provider";

// OpenAI, Groq, and OpenRouter all expose the same Chat Completions contract
// (POST {baseUrl}/chat/completions, Bearer auth, {model, messages} body), so one
// implementation covers all three — only baseUrl/apiKey/model differ.
export class OpenAiCompatibleProvider implements AiProvider {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
    private readonly model: string
  ) {}

  async generateReply(systemPrompt: string, history: AiChatMessage[]): Promise<string> {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: "system", content: systemPrompt }, ...history],
      }),
    });
    if (!res.ok) {
      throw new Error(`AI provider request failed: ${res.status} ${await res.text()}`);
    }
    const body = (await res.json()) as { choices: { message: { content: string } }[] };
    return body.choices[0].message.content;
  }
}

export function buildOpenAi(apiKey: string, model: string) {
  return new OpenAiCompatibleProvider("https://api.openai.com/v1", apiKey, model);
}

export function buildGroq(apiKey: string, model: string) {
  return new OpenAiCompatibleProvider("https://api.groq.com/openai/v1", apiKey, model);
}

export function buildOpenRouter(apiKey: string, model: string) {
  return new OpenAiCompatibleProvider("https://openrouter.ai/api/v1", apiKey, model);
}
