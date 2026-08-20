"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

interface Me {
  user: { id: string; email: string; role: string };
  tenant: { id: string; name: string };
}

export default function DashboardPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    apiFetch("/auth/me").then(async (res) => {
      if (!res.ok) {
        router.push("/login");
        return;
      }
      setMe(await res.json());
    });
  }, [router]);

  if (!me) return null;

  return (
    <main style={{ maxWidth: 480, margin: "80px auto" }}>
      <h1>{me.tenant.name}</h1>
      <p>
        Masuk sebagai {me.user.email} ({me.user.role})
      </p>
    </main>
  );
}
