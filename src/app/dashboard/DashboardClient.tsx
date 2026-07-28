"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, deleteBoard, renameBoard } from "./actions";
import Sidebar from "./sidebar";
import { 
  FolderKanban, 
  Plus, 
  Star, 
  Pin,
  Rocket,
  GraduationCap,
  Share2,
  BookOpen
} from "lucide-react";

interface Board {
  id: string;
  name: string;
  created_at: string;
}

interface Props {
  userEmail: string;
  initialBoards: Board[];
  createBoardAction: (formData: FormData) => Promise<void>;
}

function getRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hari ini";
  if (diffDays === 1) return "Kemarin";
  return `${diffDays} hari yang lalu`;
}

export default function DashboardClient({ userEmail, initialBoards, createBoardAction }: Props) {
  const router = useRouter();

  const [pinnedBoardIds, setPinnedBoardIds] = useState<string[]>([]);
  const [starredBoardIds, setStarredBoardIds] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Rename & Delete state
  const [boardToRename, setBoardToRename] = useState<{ id: string; name: string } | null>(null);
  const [renameInput, setRenameInput] = useState("");
  const [boardToDeleteId, setBoardToDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [renaming, setRenaming] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedPins = localStorage.getItem("pinned_boards");
      if (storedPins) {
        setPinnedBoardIds(JSON.parse(storedPins));
      }
      const storedStars = localStorage.getItem("starred_boards");
      if (storedStars) {
        setStarredBoardIds(JSON.parse(storedStars));
      }
    } catch (e) {
      console.error("Gagal memuat state pin/star:", e);
    }
  }, []);

  const handlePin = (boardId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (pinnedBoardIds.includes(boardId)) {
      const updated = pinnedBoardIds.filter(id => id !== boardId);
      setPinnedBoardIds(updated);
      localStorage.setItem("pinned_boards", JSON.stringify(updated));
    } else {
      // Check limit of 3 pins
      if (pinnedBoardIds.length >= 3) {
        setErrorMessage("Maksimal hanya 3 papan yang dapat Anda pin ke atas!");
        setTimeout(() => setErrorMessage(null), 4000);
        return;
      }
      const updated = [...pinnedBoardIds, boardId];
      setPinnedBoardIds(updated);
      localStorage.setItem("pinned_boards", JSON.stringify(updated));
    }
  };

  const handleStar = (boardId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (starredBoardIds.includes(boardId)) {
      const updated = starredBoardIds.filter(id => id !== boardId);
      setStarredBoardIds(updated);
      localStorage.setItem("starred_boards", JSON.stringify(updated));
    } else {
      const updated = [...starredBoardIds, boardId];
      setStarredBoardIds(updated);
      localStorage.setItem("starred_boards", JSON.stringify(updated));
    }
  };

  // Trigger rename setup
  const openRenameModal = (boardId: string, currentName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBoardToRename({ id: boardId, name: currentName });
    setRenameInput(currentName);
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardToRename || !renameInput.trim()) return;

    setRenaming(true);
    try {
      await renameBoard(boardToRename.id, renameInput.trim());
      setBoardToRename(null);
      setRenameInput("");
      router.refresh();
    } catch (err: any) {
      alert("Gagal merubah nama papan: " + err.message);
    } finally {
      setRenaming(false);
    }
  };

  // Trigger delete setup
  const openDeleteModal = (boardId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBoardToDeleteId(boardId);
  };

  const handleDeleteConfirm = async () => {
    if (!boardToDeleteId) return;

    setDeleting(true);
    try {
      // If deleted board is pinned or starred, clean them up locally
      const cleanPins = pinnedBoardIds.filter(id => id !== boardToDeleteId);
      setPinnedBoardIds(cleanPins);
      localStorage.setItem("pinned_boards", JSON.stringify(cleanPins));

      const cleanStars = starredBoardIds.filter(id => id !== boardToDeleteId);
      setStarredBoardIds(cleanStars);
      localStorage.setItem("starred_boards", JSON.stringify(cleanStars));

      await deleteBoard(boardToDeleteId);
      setBoardToDeleteId(null);
      router.refresh();
    } catch (err: any) {
      alert("Gagal menghapus papan: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  // Sort boards: Pinned first, then by created_at (which is the initial order)
  const sortedBoards = [...initialBoards].sort((a, b) => {
    const aPinned = pinnedBoardIds.includes(a.id);
    const bPinned = pinnedBoardIds.includes(b.id);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return 0;
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Sidebar Component */}
      <Sidebar 
        userEmail={userEmail}
        boards={sortedBoards}
        pinnedBoardIds={pinnedBoardIds}
        starredBoardIds={starredBoardIds}
        signOutAction={signOut}
        onCreateBoardClick={() => setShowCreateModal(true)}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        onPinAction={handlePin}
        onStarAction={handleStar}
        onRenameAction={openRenameModal}
        onDeleteAction={openDeleteModal}
      />

      {/* Main Content Pane */}
      <div style={{ flex: 1, height: "100vh", overflowY: "auto" }}>
        {/* Floating Alert Reminder */}
        {errorMessage && (
          <div style={{
            position: "fixed",
            top: "30px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#ef4444",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "14px",
            boxShadow: "0 10px 30px rgba(239, 68, 68, 0.25)",
            zIndex: 1100,
            fontSize: "13px",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            animation: "slideInDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          }}>
            <span>⚠️</span>
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              style={{
                background: "none", border: "none", color: "#fff", cursor: "pointer",
                marginLeft: "10px", fontSize: "16px", padding: 0, fontWeight: "bold"
              }}
            >
              ×
            </button>
          </div>
        )}

        <main style={{ maxWidth: 1080, margin: "0 auto", padding: "48px 2rem" }}>
          {/* HEADING */}
          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", color: "#0f172a", margin: "0 0 6px" }}>
              Dasbor Utama
            </h1>
            <p style={{ fontSize: 14, color: "#64748b", margin: 0, fontWeight: 500 }}>
              Selamat datang kembali, <strong style={{ color: "#334155" }}>{userEmail}</strong>
            </p>
          </div>

          {/* BOARD GRID */}
          {!sortedBoards.length ? (
            <div style={{
              border: "2px dashed var(--border)", borderRadius: 16,
              padding: "60px 32px", textAlign: "center", background: "#ffffff",
            }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>✦</div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-1)", margin: "0 0 8px" }}>
                Mulai proyek pertamamu
              </h2>
              <p style={{ fontSize: 14, color: "var(--text-2)", margin: "0 0 28px", lineHeight: 1.6 }}>
                Ketik satu kalimat tujuan — AI langsung urai jadi board, kolom, dan kartu tugas siap pakai.
              </p>

              {/* AI input inline */}
              <form action={createBoardAction} style={{ maxWidth: 480, margin: "0 auto 16px" }}>
                <div style={{
                  display: "flex", gap: 8,
                  background: "var(--card)", border: "1px solid var(--border-strong)",
                  borderRadius: 12, padding: "6px 6px 6px 14px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}>
                  <span style={{ fontSize: 16, color: "var(--v)", alignSelf: "center", flexShrink: 0 }}>✦</span>
                  <input
                    name="name"
                    required
                    placeholder='misal: "Persiapan seminar kampus bulan depan"'
                    style={{
                      flex: 1, border: "none", outline: "none", fontSize: 14,
                      background: "transparent", color: "var(--text-1)",
                    }}
                  />
                  <button type="submit" style={{
                    padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                    background: "var(--v)", color: "#fff", border: "none",
                    cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                  }}>
                    Buat dengan AI ✦
                  </button>
                </div>
              </form>

              <p style={{ fontSize: 12, color: "var(--text-3)" }}>
                atau{" "}
                <button
                  onClick={() => setShowCreateModal(true)}
                  style={{
                    background: "none", border: "none", fontSize: 12,
                    color: "var(--v)", cursor: "pointer", textDecoration: "underline",
                    padding: 0,
                  }}
                >
                  buat board manual
                </button>
                {" "}dari modal
              </p>

              {/* Template Proyek Cepat (Quick Start Templates) */}
              <div style={{ marginTop: 44, paddingTop: 32, borderTop: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18, justifyContent: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748b" }}>
                    Template Proyek Cepat
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, maxWidth: 840, margin: "0 auto" }}>
                  {[
                    {
                      title: "Peluncuran Produk / App",
                      desc: "Dev, UI/UX, Launch",
                      prompt: "Peluncuran Produk / App",
                      icon: Rocket,
                      color: "#6366f1",
                      bg: "#eef2ff",
                    },
                    {
                      title: "Acara Kampus / Seminar",
                      desc: "Panitia, Venue, Sponsorship",
                      prompt: "Acara Kampus / Seminar",
                      icon: GraduationCap,
                      color: "#8b5cf6",
                      bg: "#f5f3ff",
                    },
                    {
                      title: "Konten & Social Media",
                      desc: "Ide, Draft, Publishing",
                      prompt: "Konten & Social Media",
                      icon: Share2,
                      color: "#ec4899",
                      bg: "#fdf2f8",
                    },
                    {
                      title: "Manajemen Skripsi / Tugas Akhir",
                      desc: "Riset, Bab 1-5, Revisi",
                      prompt: "Manajemen Skripsi / Tugas Akhir",
                      icon: BookOpen,
                      color: "#059669",
                      bg: "#ecfdf5",
                    },
                  ].map((tpl, idx) => {
                    const IconComp = tpl.icon;
                    return (
                      <form key={idx} action={createBoardAction} style={{ margin: 0 }}>
                        <input type="hidden" name="name" value={tpl.prompt} />
                        <button
                          type="submit"
                          style={{
                            width: "100%",
                            textAlign: "left",
                            padding: "16px",
                            borderRadius: 14,
                            background: "#ffffff",
                            border: "1px solid #e2e8f0",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            display: "flex",
                            flexDirection: "column",
                            gap: 10,
                            boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                          }}
                          className="template-card-btn"
                        >
                          <div style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: tpl.bg,
                            color: tpl.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}>
                            <IconComp style={{ width: 18, height: 18 }} />
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 3, lineHeight: 1.3 }}>
                              {tpl.title}
                            </div>
                            <div style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>
                              {tpl.desc}
                            </div>
                          </div>
                        </button>
                      </form>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 24 }}>
              {sortedBoards.map((board) => {
                const relativeTime = getRelativeTime(board.created_at);
                const dateFormatted = new Date(board.created_at).toLocaleString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                const isPinned = pinnedBoardIds.includes(board.id);
                const isStarred = starredBoardIds.includes(board.id);

                return (
                  <Link key={board.id} href={`/board/${board.id}`} style={{ textDecoration: "none" }}>
                    <div
                      className="folder-card-wrapper"
                      style={{
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                        cursor: "pointer",
                      }}
                    >
                      {/* Folder Top Tab */}
                      <div style={{ display: "flex", alignItems: "flex-end" }}>
                        <div
                          style={{
                            background: isPinned
                              ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                              : "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                            color: "#ffffff",
                            padding: "6px 18px 4px 16px",
                            borderRadius: "14px 14px 0 0",
                            fontSize: "11px",
                            fontWeight: "800",
                            letterSpacing: "0.05em",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            boxShadow: "0 -2px 8px rgba(0,0,0,0.04)",
                          }}
                        >
                          <FolderKanban style={{ width: "13px", height: "13px" }} />
                          <span>KANVEXA</span>
                        </div>

                        {/* Tab Slant Transition Curve */}
                        <div
                          style={{
                            width: 22,
                            height: 16,
                            background: isPinned ? "#059669" : "#6d28d9",
                            clipPath: "polygon(0 100%, 0 0, 100% 100%)",
                          }}
                        />
                      </div>

                      {/* Folder Main Body Container */}
                      <div
                        className="folder-card-body"
                        style={{
                          background: "#ffffff",
                          borderLeft: "1.5px solid #e2e8f0",
                          borderRight: "1.5px solid #e2e8f0",
                          borderBottom: "1.5px solid #e2e8f0",
                          borderTop: `3px solid ${isPinned ? "#10b981" : "#7c3aed"}`,
                          borderRadius: "0 24px 24px 24px",
                          padding: "22px 24px 20px",
                          boxShadow:
                            "0 12px 28px -6px rgba(15, 23, 42, 0.06), 0 4px 10px -2px rgba(15, 23, 42, 0.03)",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          minHeight: "245px",
                          position: "relative",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {/* Top Row: Logo & Status Badges */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                          <div style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "14px",
                            background: isPinned ? "#ecfdf5" : "#f5f3ff",
                            border: `1px solid ${isPinned ? "#a7f3d0" : "#ddd6fe"}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: isPinned ? "#059669" : "#7c3aed",
                          }}>
                            <FolderKanban style={{ width: "20px", height: "20px" }} />
                          </div>

                          <div style={{ display: "flex", gap: "6px" }}>
                            {isStarred && (
                              <div
                                title="Favorit"
                                style={{
                                  background: "#fffbeb",
                                  border: "1px solid #fde68a",
                                  width: "28px",
                                  height: "28px",
                                  borderRadius: "50%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Star style={{ width: "12px", height: "12px", color: "#d97706", fill: "#d97706" }} />
                              </div>
                            )}
                            {isPinned && (
                              <div
                                title="Disematkan"
                                style={{
                                  background: "#ecfdf5",
                                  border: "1px solid #a7f3d0",
                                  width: "28px",
                                  height: "28px",
                                  borderRadius: "50%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Pin style={{ width: "12px", height: "12px", color: "#10b981", fill: "#10b981" }} />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Content Row */}
                        <div style={{ flex: 1, marginBottom: "16px" }}>
                          <div style={{ fontSize: "11px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", fontWeight: "600" }}>
                            <span>Kanvexa</span>
                            <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#cbd5e1" }} />
                            <span>{relativeTime}</span>
                          </div>

                          <h3 style={{ fontSize: "19px", fontWeight: "800", color: "#0f172a", margin: "0 0 14px", lineHeight: "1.3" }}>
                            {board.name}
                          </h3>

                          {/* Pill Badges */}
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#64748b", padding: "4px 12px", borderRadius: "10px", fontSize: "11px", fontWeight: "700" }}>
                              Kanban Board
                            </span>
                            <span style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#64748b", padding: "4px 12px", borderRadius: "10px", fontSize: "11px", fontWeight: "700" }}>
                              Workspace
                            </span>
                          </div>
                        </div>

                        {/* Divider Line */}
                        <div style={{ borderTop: "1px solid #f1f5f9", margin: "0 -24px 16px" }} />

                        {/* Footer Row */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>Proyek</div>
                            <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "500" }}>{dateFormatted}</div>
                          </div>
                          <div
                            style={{
                              background: "#0f172a",
                              color: "#ffffff",
                              padding: "9px 20px",
                              borderRadius: "14px",
                              fontSize: "13px",
                              fontWeight: "800",
                              textAlign: "center",
                              boxShadow: "0 4px 12px rgba(15, 23, 42, 0.12)",
                              transition: "all 0.2s ease",
                            }}
                            className="btn-open-board"
                          >
                            Buka
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* 5. Create Board Modal Pop-up */}
      {showCreateModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(15, 23, 42, 0.45)",
          backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000,
          padding: "20px",
        }}>
          <div style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 20,
            width: "100%",
            maxWidth: 460,
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
            overflow: "hidden",
            animation: "modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}>
            {/* Modal Header */}
            <div style={{
              padding: "20px 24px 16px",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "var(--v)" }}>✦</span> Buat Proyek Baru
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "#94a3b8", fontSize: 22, padding: 0, lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Action Form */}
            <form action={(formData) => {
              createBoardAction(formData);
              setShowCreateModal(false);
            }} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "24px" }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  Nama Proyek
                </label>
                <input
                  name="name" required autoFocus
                  placeholder='misal: "Peluncuran Produk Baru"'
                  style={{
                    width: "100%", padding: "12px 16px", borderRadius: 12, fontSize: 14,
                    border: "1px solid #cbd5e1", outline: "none",
                    background: "#f8fafc", color: "#0f172a",
                    transition: "all 0.2s"
                  }}
                />
              </div>

              {/* Modal Footer */}
              <div style={{
                padding: "16px 24px 20px",
                background: "#f8fafc",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
              }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                    background: "none", border: "1px solid #cbd5e1",
                    color: "#475569", cursor: "pointer"
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "8px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                    background: "var(--v)", color: "#fff", border: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(109,40,217,0.2)"
                  }}
                >
                  Buat Proyek
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Rename Board Modal Pop-up */}
      {boardToRename && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(15, 23, 42, 0.45)",
          backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000,
          padding: "20px",
        }}>
          <div style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 20,
            width: "100%",
            maxWidth: 460,
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
            overflow: "hidden",
            animation: "modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}>
            {/* Modal Header */}
            <div style={{
              padding: "20px 24px 16px",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                Ubah Nama Proyek
              </h3>
              <button 
                onClick={() => setBoardToRename(null)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "#94a3b8", fontSize: 22, padding: 0, lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Action Form */}
            <form onSubmit={handleRenameSubmit} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "24px" }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  Nama Baru Proyek
                </label>
                <input
                  required autoFocus
                  value={renameInput}
                  onChange={(e) => setRenameInput(e.target.value)}
                  placeholder="Masukkan nama baru..."
                  style={{
                    width: "100%", padding: "12px 16px", borderRadius: 12, fontSize: 14,
                    border: "1px solid #cbd5e1", outline: "none",
                    background: "#f8fafc", color: "#0f172a",
                    transition: "all 0.2s"
                  }}
                />
              </div>

              {/* Modal Footer */}
              <div style={{
                padding: "16px 24px 20px",
                background: "#f8fafc",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
              }}>
                <button
                  type="button"
                  onClick={() => setBoardToRename(null)}
                  disabled={renaming}
                  style={{
                    padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                    background: "none", border: "1px solid #cbd5e1",
                    color: "#475569", cursor: "pointer"
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={renaming || !renameInput.trim()}
                  style={{
                    padding: "8px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                    background: "var(--v)", color: "#fff", border: "none",
                    cursor: renaming || !renameInput.trim() ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 12px rgba(109,40,217,0.2)"
                  }}
                >
                  {renaming ? "Menyimpan..." : "Ubah Nama"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Delete Board Modal Pop-up */}
      {boardToDeleteId && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(15, 23, 42, 0.45)",
          backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000,
          padding: "20px",
        }}>
          <div style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 20,
            width: "100%",
            maxWidth: 440,
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
            overflow: "hidden",
            animation: "modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}>
            {/* Modal Header */}
            <div style={{
              padding: "24px 24px 12px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center"
            }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "#fef2f2",
                color: "#dc2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                marginBottom: "16px"
              }}>
                ⚠️
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>
                Hapus Proyek Ini?
              </h3>
              <p style={{ fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.5 }}>
                Tindakan ini permanen. Semua kolom, kartu tugas, dan rencana kerja di dalam proyek ini akan dihapus selamanya.
              </p>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: "16px 24px 20px",
              background: "#f8fafc",
              borderTop: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "center",
              gap: 10,
            }}>
              <button
                type="button"
                onClick={() => setBoardToDeleteId(null)}
                disabled={deleting}
                style={{
                  flex: 1,
                  padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                  background: "none", border: "1px solid #cbd5e1",
                  color: "#475569", cursor: "pointer"
                }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                style={{
                  flex: 1,
                  padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                  background: "#dc2626", color: "#fff", border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(220,38,38,0.2)"
                }}
              >
                {deleting ? "Menghapus..." : "Hapus Permanen"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInDown {
          from { transform: translate(-50%, -30px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .board-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 35px -5px rgba(0, 0, 0, 0.05), 0 10px 15px -5px rgba(0, 0, 0, 0.03) !important;
          border-color: var(--v) !important;
        }
        .board-card:hover .btn-open-board {
          background-color: var(--v) !important;
          box-shadow: 0 4px 14px rgba(109, 40, 217, 0.25) !important;
        }
        .template-card-btn:hover {
          border-color: var(--v) !important;
          transform: translateY(-3px) !important;
          box-shadow: 0 8px 20px rgba(109, 40, 217, 0.12) !important;
        }
      `}</style>
    </div>
  );
}
