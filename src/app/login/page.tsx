"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push("/dashboard");
    router.refresh();
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
          <div style={{
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 16, padding: "28px 28px 24px",
          }}>
            <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
              {[1,2,3,4,5].map((s) => (
                <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill="#FACC15"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              ))}
            </div>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 16, lineHeight: 1.65, margin: "0 0 20px", fontStyle: "italic" }}>
              &ldquo;Kami biasa habis 1 jam cuma buat bahas pembagian tugas. Sekarang cukup ketik satu kalimat, langsung jadi board yang bisa langsung dikerjain.&rdquo;
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700, color: "#fff",
              }}>AR</div>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#fff" }}>Aldi Ramadhan</p>
                <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>Ketua BEM · Universitas Indonesia</p>
              </div>
            </div>
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
            Selamat datang kembali
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-2)", margin: "0 0 32px" }}>
            Masuk untuk melanjutkan ke board kamu.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-1)", marginBottom: 6 }}>
                Email
              </label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="kamu@email.com"
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 8, fontSize: 14,
                  border: "1px solid var(--border-strong)", outline: "none",
                  background: "var(--card)", color: "var(--text-1)",
                  transition: "border-color 0.15s",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-1)", marginBottom: 6 }}>
                Password
              </label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 8, fontSize: 14,
                  border: "1px solid var(--border-strong)", outline: "none",
                  background: "var(--card)", color: "var(--text-1)",
                }}
              />
            </div>

            {error && (
              <div style={{
                background: "#FEF2F2", border: "1px solid #FECACA",
                borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "#DC2626",
              }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              marginTop: 4, padding: "11px", borderRadius: 8, fontSize: 14, fontWeight: 600,
              background: loading ? "#A78BFA" : "var(--v)", color: "#fff", border: "none",
              cursor: loading ? "not-allowed" : "pointer", transition: "background 0.15s",
            }}>
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <p style={{ marginTop: 24, fontSize: 13, color: "var(--text-2)", textAlign: "center" }}>
            Belum punya akun?{" "}
            <Link href="/signup" style={{ fontWeight: 600, color: "var(--v)", textDecoration: "none" }}>
              Daftar gratis
            </Link>
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
