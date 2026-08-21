export interface AiChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AiProvider {
  generateReply(systemPrompt: string, history: AiChatMessage[]): Promise<string>;
}
