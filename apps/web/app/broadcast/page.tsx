"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

interface Conversation {
  contactNumber: string;
  displayName: string | null;
}

interface BroadcastSummary {
  id: string;
  message: string;
  status: "DRAFT" | "RUNNING" | "COMPLETED" | "FAILED";
  createdAt: string;
  _count: { recipients: number };
}

export default function BroadcastPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [broadcasts, setBroadcasts] = useState<BroadcastSummary[]>([]);
  const [message, setMessage] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templateLang, setTemplateLang] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(async () => {
    const [convRes, bcRes] = await Promise.all([apiFetch("/conversations"), apiFetch("/broadcast")]);
    if (convRes.status === 401 || bcRes.status === 401) {
      router.push("/login");
      return;
    }
    setConversations((await convRes.json()).conversations);
    setBroadcasts((await bcRes.json()).broadcasts);
  }, [router]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  function toggle(contactNumber: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(contactNumber)) next.delete(contactNumber);
      else next.add(contactNumber);
      return next;
    });
  }

  async function submit() {
    setError(null);
    if (!message.trim() || selected.size === 0) {
      setError("Isi pesan dan pilih minimal 1 kontak.");
      return;
    }
    setSubmitting(true);
    const res = await apiFetch("/broadcast", {
      method: "POST",
      body: JSON.stringify({
        message,
        recipients: Array.from(selected),
        ...(templateName ? { templateName, templateLang: templateLang || "id" } : {}),
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Gagal membuat broadcast");
      return;
    }
    setMessage("");
    setSelected(new Set());
    refresh();
  }

  return (
    <main style={{ maxWidth: 640, margin: "40px auto" }}>
      <h1>Broadcast</h1>
      <p style={{ opacity: 0.7 }}>
        Hanya bisa kirim ke kontak yang sudah pernah chat. Untuk koneksi WAHA, ada batas &amp; jeda pengiriman untuk
        mengurangi risiko nomor diblokir WhatsApp — ini otomasi tidak resmi, bukan API resmi.
      </p>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <textarea
        placeholder="Isi pesan broadcast..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        style={{ width: "100%", padding: 8, boxSizing: "border-box", marginBottom: 8 }}
      />

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input
          type="text"
          placeholder="Nama template Meta (opsional, wajib di luar window 24 jam)"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          style={{ flex: 2, padding: 6 }}
        />
        <input
          type="text"
          placeholder="Kode bahasa (mis. id)"
          value={templateLang}
          onChange={(e) => setTemplateLang(e.target.value)}
          style={{ flex: 1, padding: 6 }}
        />
      </div>

      <div style={{ border: "1px solid #333", padding: 8, maxHeight: 200, overflowY: "auto", marginBottom: 8 }}>
        {conversations.length === 0 && <p>Belum ada kontak yang pernah chat.</p>}
        {conversations.map((c) => (
          <label key={c.contactNumber} style={{ display: "block", padding: "4px 0" }}>
            <input
              type="checkbox"
              checked={selected.has(c.contactNumber)}
              onChange={() => toggle(c.contactNumber)}
            />{" "}
            {c.displayName ?? c.contactNumber}
          </label>
        ))}
      </div>

      <button onClick={submit} disabled={submitting}>
        Kirim ke {selected.size} kontak
      </button>

      <h2 style={{ marginTop: 32 }}>Riwayat Broadcast</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {broadcasts.map((b) => (
          <li key={b.id} style={{ borderBottom: "1px solid #333", padding: "8px 0" }}>
            <strong>{b.status}</strong> — {b._count.recipients} penerima — {b.message.slice(0, 60)}
          </li>
        ))}
      </ul>
    </main>
  );
}
