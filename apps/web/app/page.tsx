import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ maxWidth: 420, margin: "80px auto", textAlign: "center" }}>
      <h1>Fluxy CRM</h1>
      <p>
        <Link href="/login">Masuk</Link> · <Link href="/register">Daftar toko baru</Link>
      </p>
    </main>
  );
}
