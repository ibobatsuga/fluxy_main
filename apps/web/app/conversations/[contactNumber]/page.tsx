"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

interface Message {
  id: string;
  direction: "IN" | "OUT";
  content: string;
  createdAt: string;
}

const POLL_MS = 3000;

export default function ConversationDetailPage() {
  const router = useRouter();
  const params = useParams<{ contactNumber: string }>();
  const contactNumber = decodeURIComponent(params.contactNumber);

  const [messages, setMessages] = useState<Message[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const fetchMessages = useCallback(async () => {
    const res = await apiFetch(`/conversations/${encodeURIComponent(contactNumber)}/messages`);
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    const body = await res.json();
    setMessages(body.messages);
  }, [contactNumber, router]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, POLL_MS);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  async function send() {
    if (!draft.trim()) return;
    setSending(true);
    await apiFetch("/whatsapp/send", {
      method: "POST",
      body: JSON.stringify({ to: contactNumber, text: draft }),
    });
    setDraft("");
    setSending(false);
    fetchMessages();
  }

  async function saveName() {
    await apiFetch(`/conversations/${encodeURIComponent(contactNumber)}`, {
      method: "PATCH",
      body: JSON.stringify({ name: displayName || null }),
    });
  }

  return (
    <main style={{ maxWidth: 640, margin: "40px auto" }}>
      <a href="/conversations">&larr; Kembali</a>
      <h1>{contactNumber}</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Nama kontak (opsional)"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          style={{ flex: 1, padding: 6 }}
        />
        <button onClick={saveName}>Simpan nama</button>
      </div>

      <div style={{ border: "1px solid #333", padding: 12, minHeight: 300, marginBottom: 12 }}>
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              textAlign: m.direction === "OUT" ? "right" : "left",
              margin: "6px 0",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "6px 10px",
                borderRadius: 8,
                background: m.direction === "OUT" ? "#2a4" : "#333",
                maxWidth: "70%",
              }}
            >
              {m.content}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          placeholder="Balas manual (menghentikan auto-reply AI 30 menit)..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={send} disabled={sending}>
          Kirim
        </button>
      </div>
    </main>
  );
}
