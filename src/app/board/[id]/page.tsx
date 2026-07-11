import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const COL_COLORS: Record<string, string> = {
  "To do":       "#6D28D9",
  "In progress": "#D97706",
  "Done":        "#059669",
};

function colColor(name: string) {
  return COL_COLORS[name] ?? "#6B6860";
}

export default async function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = await params;
  const supabase = await createClient();

  const { data: board } = await supabase.from("boards").select("id, name").eq("id", id).single();
  if (!board) notFound();

  const { data: columns } = await supabase
    .from("board_columns").select("id, name, position").eq("board_id", id).order("position");

  const { data: cards } = await supabase
    .from("cards").select("id, column_id, title, description, position").eq("board_id", id).order("position");

  const cardsByCol = (columns ?? []).reduce<Record<string, typeof cards>>((acc, col) => {
    acc[col.id] = (cards ?? []).filter((c) => c.column_id === col.id);
    return acc;
  }, {});

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface)", display: "flex", flexDirection: "column" }}>
      {/* TOPBAR */}
      <header style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "rgba(250,250,248,0.9)", backdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: 10, padding: "0 20px", height: 52,
        flexShrink: 0,
      }}>
        <Link href="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 6, color: "var(--text-2)", fontSize: 13 }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
          Board
        </Link>
        <span style={{ color: "var(--border)", fontSize: 18 }}>/</span>
        <h1 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", margin: 0, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {board.name}
        </h1>

        {/* placeholder AI button */}
        <button style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
          background: "var(--v-light)", border: "1px solid #C4B5FD",
          color: "var(--v)", cursor: "pointer",
        }}>
          <span>✦</span> Urai dengan AI
          <span style={{
            fontSize: 10, fontWeight: 700, background: "#FBBF24", color: "#78350F",
            borderRadius: 4, padding: "1px 5px",
          }}>SOON</span>
        </button>

        {/* avatar group placeholder */}
        <div style={{ display: "flex", gap: -4 }}>
          {["#6D28D9","#059669"].map((c, i) => (
            <div key={i} style={{
              width: 28, height: 28, borderRadius: "50%", background: c,
              border: "2px solid var(--surface)", marginLeft: i > 0 ? -8 : 0,
              fontSize: 10, fontWeight: 700, color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {String.fromCharCode(65 + i)}
            </div>
          ))}
        </div>
      </header>

      {/* AI BREAKDOWN NOTICE */}
      <div style={{
        background: "var(--v-light)", borderBottom: "1px solid #C4B5FD",
        padding: "10px 20px", display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{ fontSize: 14, color: "var(--v)" }}>✦</span>
        <p style={{ margin: 0, fontSize: 13, color: "var(--v-dark)" }}>
          <strong>Fitur AI Breakdown</strong> segera hadir. Ketik satu kalimat tujuan dan biarkan AI mengurai jadi kartu tugas otomatis.
        </p>
        <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
          {["💡","🚀","⚡"].map((e) => <span key={e} style={{ fontSize: 14 }}>{e}</span>)}
        </div>
      </div>

      {/* KANBAN BOARD */}
      <div style={{
        flex: 1, overflowX: "auto", padding: "24px 20px",
        display: "flex", gap: 14, alignItems: "flex-start",
      }} className="scrollbar-hide">
        {(columns ?? []).map((col) => {
          const colCards = cardsByCol[col.id] ?? [];
          const color    = colColor(col.name);
          return (
            <div key={col.id} style={{
              width: 272, flexShrink: 0,
              background: "#F2F1EE", borderRadius: 12,
              border: "1px solid var(--border)",
              display: "flex", flexDirection: "column", maxHeight: "calc(100vh - 160px)",
            }}>
              {/* column header */}
              <div style={{
                padding: "12px 14px 10px",
                display: "flex", alignItems: "center", gap: 8,
                borderBottom: "1px solid var(--border)",
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", flex: 1 }}>{col.name}</span>
                <span style={{
                  fontSize: 11, fontWeight: 600, borderRadius: 100,
                  background: "var(--border)", color: "var(--text-2)",
                  padding: "1px 7px",
                }}>
                  {colCards.length}
                </span>
              </div>

              {/* cards */}
              <div style={{ flex: 1, overflowY: "auto", padding: "10px 10px 0" }} className="scrollbar-hide">
                {colCards.length === 0 ? (
                  <div style={{
                    border: "1.5px dashed var(--border-strong)", borderRadius: 8,
                    padding: "20px 12px", textAlign: "center", margin: "0 0 10px",
                  }}>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--text-3)" }}>Belum ada kartu</p>
                  </div>
                ) : (
                  colCards.map((card) => (
                    <div key={card.id} style={{
                      background: "var(--card)", border: "1px solid var(--border)",
                      borderRadius: 8, padding: "12px", marginBottom: 8,
                      borderLeft: `3px solid ${color}`,
                      cursor: "grab",
                    }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "var(--text-1)", lineHeight: 1.45 }}>
                        {card.title}
                      </p>
                      {card.description && (
                        <p style={{ margin: "6px 0 0", fontSize: 11, color: "var(--text-2)", lineHeight: 1.5 }}>
                          {card.description}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* add card button */}
              <div style={{ padding: "8px 10px 10px" }}>
                <button style={{
                  width: "100%", padding: "8px", borderRadius: 8, fontSize: 13,
                  border: "1px dashed var(--border-strong)", background: "transparent",
                  color: "var(--text-3)", cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center", gap: 4,
                  transition: "background 0.15s, color 0.15s",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--card)"; (e.currentTarget as HTMLElement).style.color = "var(--text-1)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-3)"; }}
                >
                  <span style={{ fontSize: 16 }}>+</span> Tambah kartu
                </button>
              </div>
            </div>
          );
        })}

        {/* add column button */}
        <button style={{
          width: 240, flexShrink: 0, padding: "12px 16px",
          borderRadius: 12, border: "2px dashed var(--border-strong)",
          background: "transparent", color: "var(--text-3)", cursor: "pointer",
          fontSize: 13, display: "flex", alignItems: "center", gap: 6,
          transition: "background 0.15s, color 0.15s",
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--card)"; (e.currentTarget as HTMLElement).style.color = "var(--text-2)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-3)"; }}
        >
          <span style={{ fontSize: 18 }}>+</span> Tambah kolom
        </button>
      </div>
    </div>
  );
}
