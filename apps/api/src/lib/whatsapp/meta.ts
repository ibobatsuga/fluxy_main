import crypto from "node:crypto";
import type { IncomingMessage, SendMessageResult, WhatsAppProvider } from "./provider";

export interface MetaCredentials {
  accessToken: string;
  phoneNumberId: string;
  appSecret: string;
  verifyToken: string;
}

const GRAPH_API_VERSION = "v21.0";

// Based on Meta's published WhatsApp Cloud API docs. NOT verified end-to-end against a real
// WhatsApp Business Account — this repo has no Meta test credentials yet. Flagged as such in the
// Fase 1 report; do not treat this provider as proven until it's been exercised live.
export class MetaProvider implements WhatsAppProvider {
  constructor(private readonly credentials: MetaCredentials) {}

  async sendMessage(to: string, text: string): Promise<SendMessageResult> {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${this.credentials.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.credentials.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: text },
        }),
      }
    );
    if (!res.ok) {
      throw new Error(`Meta sendMessage failed: ${res.status} ${await res.text()}`);
    }
    const body = (await res.json()) as { messages: { id: string }[] };
    return { providerMessageId: body.messages[0].id };
  }

  async sendTemplateMessage(
    to: string,
    templateName: string,
    languageCode: string,
    bodyParams: string[]
  ): Promise<SendMessageResult> {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${this.credentials.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.credentials.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "template",
          template: {
            name: templateName,
            language: { code: languageCode },
            ...(bodyParams.length > 0
              ? { components: [{ type: "body", parameters: bodyParams.map((text) => ({ type: "text", text })) }] }
              : {}),
          },
        }),
      }
    );
    if (!res.ok) {
      throw new Error(`Meta sendTemplateMessage failed: ${res.status} ${await res.text()}`);
    }
    const body = (await res.json()) as { messages: { id: string }[] };
    return { providerMessageId: body.messages[0].id };
  }

  verifyWebhook(rawBody: Buffer, headers: Record<string, string | string[] | undefined>): void {
    const signatureHeader = headers["x-hub-signature-256"];
    if (!signatureHeader || typeof signatureHeader !== "string") {
      throw new Error("Missing X-Hub-Signature-256 header");
    }
    const expected =
      "sha256=" + crypto.createHmac("sha256", this.credentials.appSecret).update(rawBody).digest("hex");
    const a = Buffer.from(signatureHeader);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      throw new Error("Invalid webhook signature");
    }
  }

  parseIncomingWebhook(body: unknown): IncomingMessage | null {
    const payload = body as {
      entry?: {
        changes?: { value?: { messages?: { from: string; id: string; timestamp: string; text?: { body: string } }[] } }[];
      }[];
    };
    const message = payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return null;
    return {
      from: message.from,
      content: message.text?.body ?? "",
      providerMessageId: message.id,
      timestamp: new Date(Number(message.timestamp) * 1000),
    };
  }
}
