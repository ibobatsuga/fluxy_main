import http from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { OpenAiCompatibleProvider } from "../lib/ai/openaiCompatible";

// Exercises the real HTTP request/response handling of OpenAiCompatibleProvider (used for
// OpenAI, Groq, and OpenRouter) against a local server that mimics the real Chat Completions
// contract — not a real OpenAI/Groq/OpenRouter account, which this repo has no credentials for.
describe("OpenAiCompatibleProvider", () => {
  let server: http.Server;
  let baseUrl: string;
  let lastRequestBody: unknown;
  let lastAuthHeader: string | undefined;

  beforeAll(async () => {
    server = http.createServer((req, res) => {
      lastAuthHeader = req.headers.authorization;
      let raw = "";
      req.on("data", (chunk) => (raw += chunk));
      req.on("end", () => {
        lastRequestBody = JSON.parse(raw);
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ choices: [{ message: { content: "Halo, ada yang bisa dibantu?" } }] }));
      });
    });
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const address = server.address();
    if (address && typeof address === "object") {
      baseUrl = `http://127.0.0.1:${address.port}`;
    }
  });

  afterAll(() => server.close());

  it("sends the system prompt and history in the OpenAI chat completions shape, with Bearer auth", async () => {
    const provider = new OpenAiCompatibleProvider(baseUrl, "fake-api-key", "gpt-test-model");
    const reply = await provider.generateReply("SYSTEM PROMPT HERE", [{ role: "user", content: "Halo" }]);

    expect(reply).toBe("Halo, ada yang bisa dibantu?");
    expect(lastAuthHeader).toBe("Bearer fake-api-key");
    expect(lastRequestBody).toEqual({
      model: "gpt-test-model",
      messages: [
        { role: "system", content: "SYSTEM PROMPT HERE" },
        { role: "user", content: "Halo" },
      ],
    });
  });
});
