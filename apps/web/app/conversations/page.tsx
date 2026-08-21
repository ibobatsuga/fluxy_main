"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

interface Conversation {
  contactNumber: string;
  displayName: string | null;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
}

export default function ConversationsPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [query, setQuery] = useState("");

  const fetchConversations = useCallback(
    async (q: string) => {
      const res = await apiFetch(`/conversations${q ? `?q=${encodeURIComponent(q)}` : ""}`);
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const body = await res.json();
      setConversations(body.conversations);
    },
    [router]
  );

  useEffect(() => {
    fetchConversations(query);
  }, [query, fetchConversations]);

  return (
    <main style={{ maxWidth: 640, margin: "40px auto" }}>
      <h1>Percakapan</h1>
      <input
        type="text"
        placeholder="Cari nomor, nama, atau isi pesan..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 16, boxSizing: "border-box" }}
      />

      {conversations === null && <p>Memuat...</p>}
      {conversations !== null && conversations.length === 0 && <p>Belum ada percakapan.</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {conversations?.map((c) => (
          <li key={c.contactNumber} style={{ borderBottom: "1px solid #333", padding: "10px 0" }}>
            <a href={`/conversations/${encodeURIComponent(c.contactNumber)}`}>
              <strong>{c.displayName ?? c.contactNumber}</strong>
              <br />
              <span style={{ opacity: 0.7 }}>{c.lastMessagePreview}</span>
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
