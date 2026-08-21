export interface IncomingMessage {
  from: string;
  content: string;
  providerMessageId: string;
  timestamp: Date;
}

export interface SendMessageResult {
  providerMessageId: string;
}

export interface WhatsAppProvider {
  /** Sends a text message. `to` is a bare phone number (digits only, no @c.us / no +). */
  sendMessage(to: string, text: string): Promise<SendMessageResult>;

  /**
   * Sends a pre-approved message template (Meta-only — WAHA has no template concept, so this
   * is absent on WahaProvider). Required by Meta outside the 24h customer service window; Meta's
   * API rejects free-text sends there regardless of what this app does.
   */
  sendTemplateMessage?(to: string, templateName: string, languageCode: string, bodyParams: string[]): Promise<SendMessageResult>;

  /** Verifies the signature/HMAC of a raw webhook request body. Throws if invalid. */
  verifyWebhook(rawBody: Buffer, headers: Record<string, string | string[] | undefined>): void;

  /** Parses an already-verified webhook body into a normalized incoming message, or null for non-message events. */
  parseIncomingWebhook(body: unknown): IncomingMessage | null;
}
