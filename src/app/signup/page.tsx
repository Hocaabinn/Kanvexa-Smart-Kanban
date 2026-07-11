"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]         = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { full_name: name },
      },
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, background: "var(--v-light)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, margin: "0 auto 20px",
          }}>✉️</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-1)", margin: "0 0 10px" }}>
            Cek email kamu
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6, margin: "0 0 24px" }}>
            Link konfirmasi sudah dikirim ke <strong>{email}</strong>. Klik link itu untuk mengaktifkan akun.
          </p>
          <Link href="/login" style={{ fontSize: 14, fontWeight: 500, color: "var(--v)", textDecoration: "none" }}>
            Kembali ke halaman masuk →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* LEFT PANEL */}
      <div style={{
        flex: "0 0 42%", background: "var(--v-dark)", padding: "48px 40px",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
      }} className="hidden-mobile">
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>Rencanai</span>
        </Link>
        <div>
          <h2 style={{ color: "#fff", fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 16px", lineHeight: 1.2 }}>
            Dari satu kalimat<br />jadi tim yang produktif.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 15, lineHeight: 1.7, margin: "0 0 32px" }}>
            Tidak perlu meeting panjang hanya untuk bagi tugas. Ketik tujuan, AI yang urai, tim langsung kerja.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {["✦ Gratis untuk semua fitur dasar", "⟳ Real-time sync antar perangkat", "◈ Undang tim tanpa batas"].map((f) => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>© 2025 Rencanai</p>
      </div>

      {/* RIGHT PANEL */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "40px 2rem",
      }}>
        <div style={{ width: "100%", maxWidth: 360 }}>
          <Link href="/" style={{ display: "inline-block", marginBottom: 40, textDecoration: "none" }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: "var(--v)", letterSpacing: "-0.02em" }}>Rencanai</span>
          </Link>

          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-1)", margin: "0 0 6px" }}>
            Buat akun gratis
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-2)", margin: "0 0 32px" }}>
            Tidak perlu kartu kredit. Langsung bisa pakai.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-1)", marginBottom: 6 }}>Nama lengkap</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Andi Pratama"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, fontSize: 14, border: "1px solid var(--border-strong)", outline: "none", background: "var(--card)", color: "var(--text-1)" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-1)", marginBottom: 6 }}>Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="kamu@email.com"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, fontSize: 14, border: "1px solid var(--border-strong)", outline: "none", background: "var(--card)", color: "var(--text-1)" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-1)", marginBottom: 6 }}>Password</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 karakter"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, fontSize: 14, border: "1px solid var(--border-strong)", outline: "none", background: "var(--card)", color: "var(--text-1)" }}
              />
            </div>

            {error && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "#DC2626" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              marginTop: 4, padding: "11px", borderRadius: 8, fontSize: 14, fontWeight: 600,
              background: loading ? "#A78BFA" : "var(--v)", color: "#fff", border: "none",
              cursor: loading ? "not-allowed" : "pointer",
            }}>
              {loading ? "Membuat akun..." : "Daftar sekarang"}
            </button>
          </form>

          <p style={{ marginTop: 24, fontSize: 13, color: "var(--text-2)", textAlign: "center" }}>
            Sudah punya akun?{" "}
            <Link href="/login" style={{ fontWeight: 600, color: "var(--v)", textDecoration: "none" }}>Masuk</Link>
          </p>

          <p style={{ marginTop: 16, fontSize: 11, color: "var(--text-3)", textAlign: "center" }}>
            Dengan mendaftar, kamu menyetujui Syarat Layanan kami.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) { .hidden-mobile { display: none !important; } }
        input:focus { border-color: var(--v) !important; box-shadow: 0 0 0 3px rgba(109,40,217,0.1); }
      `}</style>
    </div>
  );
}
