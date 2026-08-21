"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

interface Connection {
  provider: "WAHA" | "META";
  status: "DISCONNECTED" | "CONNECTING" | "QR_PENDING" | "CONNECTED" | "FAILED";
  phoneNumber: string | null;
}

export default function WhatsAppPage() {
  const router = useRouter();
  const [connection, setConnection] = useState<Connection | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = useCallback(async () => {
    const res = await apiFetch("/whatsapp/status");
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    const body = await res.json();
    setConnection(body.connection);
  }, [router]);

  const fetchQr = useCallback(async () => {
    const res = await apiFetch("/whatsapp/qr");
    if (!res.ok) return;
    const blob = await res.blob();
    setQrUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(blob);
    });
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (connection?.status === "CONNECTING" || connection?.status === "QR_PENDING") {
      if (connection.status === "QR_PENDING") fetchQr();
      pollRef.current = setInterval(fetchStatus, 3000);
    } else {
      setQrUrl(null);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [connection?.status, fetchStatus, fetchQr]);

  async function connectWaha() {
    setLoading(true);
    setError(null);
    const res = await apiFetch("/whatsapp/connect", {
      method: "POST",
      body: JSON.stringify({ provider: "waha" }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Gagal menghubungkan WhatsApp");
      return;
    }
    fetchStatus();
  }

  return (
    <main style={{ maxWidth: 480, margin: "80px auto" }}>
      <h1>Koneksi WhatsApp</h1>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {(!connection || connection.status === "DISCONNECTED") && (
        <button onClick={connectWaha} disabled={loading}>
          {loading ? "Menghubungkan..." : "Hubungkan via WAHA"}
        </button>
      )}

      {connection && connection.status === "CONNECTING" && <p>Menyiapkan sesi WhatsApp...</p>}

      {connection && connection.status === "QR_PENDING" && (
        <div>
          <p>Scan QR ini dengan WhatsApp di HP Anda:</p>
          {qrUrl ? <img src={qrUrl} alt="QR WhatsApp" width={276} height={276} /> : <p>Memuat QR...</p>}
        </div>
      )}

      {connection && connection.status === "CONNECTED" && (
        <p>Terhubung — nomor {connection.phoneNumber ?? "(belum diketahui)"}</p>
      )}

      {connection && connection.status === "FAILED" && (
        <div>
          <p>Koneksi gagal.</p>
          <button onClick={connectWaha} disabled={loading}>
            Coba lagi
          </button>
        </div>
      )}
    </main>
  );
}
