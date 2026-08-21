import type { AiSettings } from "@fluxy-crm/db";
import { decryptCredentials } from "../crypto";
import type { AiProvider } from "./provider";
import { buildOpenAi, buildGroq, buildOpenRouter } from "./openaiCompatible";
import { GeminiProvider } from "./gemini";
import { AnthropicProvider } from "./anthropic";

export function buildAiProvider(settings: AiSettings): AiProvider {
  const apiKey = decryptCredentials(settings.apiKeyEncrypted);
  switch (settings.provider) {
    case "OPENAI":
      return buildOpenAi(apiKey, settings.model);
    case "GROQ":
      return buildGroq(apiKey, settings.model);
    case "OPENROUTER":
      return buildOpenRouter(apiKey, settings.model);
    case "GEMINI":
      return new GeminiProvider(apiKey, settings.model);
    case "CLAUDE":
      return new AnthropicProvider(apiKey, settings.model);
  }
}

export * from "./provider";
