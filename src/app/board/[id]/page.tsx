import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import BoardClient from "@/components/BoardClient";

export default async function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: board } = await supabase.from("boards").select("id, name, created_by").eq("id", id).single();
  if (!board) notFound();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  let role = "viewer";
  if (user) {
    const { data: member } = await supabase
      .from("board_members")
      .select("role")
      .eq("board_id", id)
      .eq("user_id", user.id)
      .single();
    if (member) {
      role = member.role;
    }
  }

  const isAdmin = role === "admin";
  const canEdit = role === "admin" || role === "member";

  const { data: columns } = await supabase
    .from("board_columns").select("id, name, position").eq("board_id", id).order("position");

  const { data: cards } = await supabase
    .from("cards").select("id, column_id, title, description, position").eq("board_id", id).order("position");

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "transparent", position: "relative", zIndex: 1 }}>
      {/* TOPBAR */}
      <header style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "rgba(255,255,255,0.75)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: 10, padding: "0 20px", height: 52,
        flexShrink: 0,
      }}>
        <Link href="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 6, color: "var(--text-2)", fontSize: 13 }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
          Board
        </Link>
        <span style={{ color: "var(--border)", fontSize: 18 }}>/</span>
        <h1 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", margin: 0, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {board.name}
        </h1>

        {/* avatar group placeholder */}
        <div style={{ display: "flex", gap: -4 }}>
          {["#6D28D9", "#059669"].map((c, i) => (
            <div key={i} style={{
              width: 28, height: 28, borderRadius: "50%", background: c,
              border: "2px solid #ffffff", marginLeft: i > 0 ? -8 : 0,
              fontSize: 10, fontWeight: 700, color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {String.fromCharCode(65 + i)}
            </div>
          ))}
        </div>
      </header>

      {/* KANBAN BOARD */}
      <BoardClient
        boardId={board.id}
        initialColumns={columns ?? []}
        initialCards={cards ?? []}
        isAdmin={isAdmin}
        canEdit={canEdit}
      />
    </div>
  );
}
