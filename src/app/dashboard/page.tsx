import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createBoard, signOut } from "./actions";

function initials(email: string) {
  return email.slice(0, 2).toUpperCase();
}

const BOARD_COLORS = ["#6D28D9","#059669","#D97706","#DB2777","#2563EB","#DC2626"];

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: boards } = await supabase
    .from("boards")
    .select("id, name, created_at")
    .order("created_at", { ascending: false });

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface)" }}>
      {/* TOPBAR */}
      <header style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "rgba(250,250,248,0.9)", backdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 2rem", height: 56,
      }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--v)" }}>Rencanai</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "var(--v)", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700,
          }}>
            {initials(user?.email ?? "??")}
          </div>
          <form action={signOut}>
            <button type="submit" style={{
              background: "none", border: "1px solid var(--border)",
              borderRadius: 8, padding: "5px 12px", fontSize: 13,
              color: "var(--text-2)", cursor: "pointer",
            }}>
              Keluar
            </button>
          </form>
        </div>
      </header>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "40px 2rem" }}>
        {/* HEADING */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-1)", margin: "0 0 4px" }}>
            Board kamu
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-2)", margin: 0 }}>
            {user?.email}
          </p>
        </div>

        {/* CREATE BOARD */}
        <form action={createBoard} style={{
          background: "var(--card)", border: "1px solid var(--border)",
          borderRadius: 12, padding: "20px", marginBottom: 32,
          display: "flex", gap: 10, alignItems: "center",
        }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Buat board baru
            </label>
            <input
              name="name" required
              placeholder='misal: "Persiapan seminar kampus bulan ini"'
              style={{
                width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 14,
                border: "1px solid var(--border-strong)", outline: "none",
                background: "var(--surface)", color: "var(--text-1)",
              }}
            />
          </div>
          <button type="submit" style={{
            alignSelf: "flex-end",
            padding: "9px 18px", borderRadius: 8, fontSize: 14, fontWeight: 600,
            background: "var(--v)", color: "#fff", border: "none", cursor: "pointer",
            whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ fontSize: 16 }}>+</span> Buat board
          </button>
        </form>

        {/* BOARD GRID */}
        {!boards?.length ? (
          <div style={{
            border: "2px dashed var(--border)", borderRadius: 16,
            padding: "60px 24px", textAlign: "center",
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: "var(--text-1)", margin: "0 0 8px" }}>
              Belum ada board
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-2)", margin: 0 }}>
              Buat board pertama kamu di atas dan biarkan AI membantu mengurai rencana kerjamu.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
            {boards.map((board, i) => {
              const color = BOARD_COLORS[i % BOARD_COLORS.length];
              const date  = new Date(board.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
              return (
                <Link key={board.id} href={`/board/${board.id}`} style={{ textDecoration: "none" }}>
                  <div style={{
                    background: "var(--card)", border: "1px solid var(--border)",
                    borderRadius: 12, padding: "0", overflow: "hidden",
                    transition: "border-color 0.15s, transform 0.15s",
                    cursor: "pointer",
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = color; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.transform = ""; }}
                  >
                    {/* color strip */}
                    <div style={{ height: 5, background: color }} />
                    <div style={{ padding: "16px 18px 18px" }}>
                      {/* mini column preview */}
                      <div style={{ display: "flex", gap: 5, marginBottom: 14 }}>
                        {["To do","In progress","Done"].map((c) => (
                          <div key={c} style={{
                            flex: 1, height: 36, borderRadius: 6,
                            background: "var(--surface)", border: "1px solid var(--border)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <span style={{ fontSize: 9, color: "var(--text-3)", fontWeight: 500 }}>{c}</span>
                          </div>
                        ))}
                      </div>
                      <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", margin: "0 0 6px", lineHeight: 1.4 }}>
                        {board.name}
                      </h3>
                      <span style={{ fontSize: 11, color: "var(--text-3)" }}>{date}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <style>{`input:focus{border-color:var(--v)!important;box-shadow:0 0 0 3px rgba(109,40,217,0.1)}`}</style>
    </div>
  );
}
