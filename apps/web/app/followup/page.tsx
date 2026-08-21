"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

interface Settings {
  enabled: boolean;
  delayHours: number;
  message: string;
}

export default function FollowUpPage() {
  const router = useRouter();
  const [enabled, setEnabled] = useState(false);
  const [delayHours, setDelayHours] = useState(24);
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    const res = await apiFetch("/followup/settings");
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    const body: { settings: Settings | null } = await res.json();
    if (body.settings) {
      setEnabled(body.settings.enabled);
      setDelayHours(body.settings.delayHours);
      setMessage(body.settings.message);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    setSaved(false);
    await apiFetch("/followup/settings", {
      method: "POST",
      body: JSON.stringify({ enabled, delayHours, message }),
    });
    setSaved(true);
  }

  return (
    <main style={{ maxWidth: 480, margin: "40px auto" }}>
      <h1>Follow-up Otomatis</h1>
      <p style={{ opacity: 0.7 }}>
        Kirim sekali ke pelanggan yang pesannya belum dibalas setelah durasi tertentu. Otomatis berhenti begitu ada
        balasan baru dari staff atau AI.
      </p>

      <label style={{ display: "block", marginBottom: 8 }}>
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} /> Aktifkan
      </label>

      <label style={{ display: "block", marginBottom: 8 }}>
        Kirim setelah (jam):
        <input
          type="number"
          min={1}
          value={delayHours}
          onChange={(e) => setDelayHours(Number(e.target.value))}
          style={{ marginLeft: 8, width: 80 }}
        />
      </label>

      <textarea
        placeholder="Isi pesan follow-up..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        style={{ width: "100%", padding: 8, boxSizing: "border-box", marginBottom: 8 }}
      />

      <button onClick={save}>Simpan</button>
      {saved && <span style={{ marginLeft: 8 }}>Tersimpan.</span>}
    </main>
  );
}
