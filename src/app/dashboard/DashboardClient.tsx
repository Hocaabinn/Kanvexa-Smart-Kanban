"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, deleteBoard, renameBoard } from "./actions";
import Sidebar from "./sidebar";
import { AnimatedFolder } from "@/components/ui/3d-folder";
import { 
  FolderKanban, 
  Plus, 
  Star, 
  Pin,
  Rocket,
  GraduationCap,
  Share2,
  BookOpen,
  Users,
  Lightbulb,
  Target,
  LayoutTemplate,
  Menu
} from "lucide-react";
import { InboxNotificationModal } from "@/components/ui/InboxNotificationModal";

interface Board {
  id: string;
  name: string;
  created_at: string;
  owner_email?: string;
}

interface Invitation {
  id: string;
  board_id: string;
  board_name: string;
  invited_email: string;
  invited_by_email: string;
  role: string;
  created_at: string;
}

interface Props {
  userEmail: string;
  initialBoards: Board[];
  initialInvitations?: Invitation[];
  createBoardAction: (formData: FormData) => Promise<void>;
  activeView?: "dashboard" | "templates";
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

export default function DashboardClient({ userEmail, initialBoards, initialInvitations = [], createBoardAction, activeView = "dashboard" }: Props) {
  const router = useRouter();

  const [pinnedBoardIds, setPinnedBoardIds] = useState<string[]>([]);
  const [starredBoardIds, setStarredBoardIds] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showInbox, setShowInbox] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>(initialInvitations);

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
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Pane */}
      <div style={{ flex: 1, height: "100vh", overflowY: "auto" }}>
        {/* Mobile hamburger button */}
        <div className="mobile-sidebar-toggle" style={{
          display: "none",
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #e2e8f0",
          padding: "10px 16px",
          alignItems: "center",
          gap: 10,
        }}>
          <button
            onClick={() => setIsMobileOpen(true)}
            style={{
              background: "none",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#475569",
            }}
          >
            <Menu style={{ width: 20, height: 20 }} />
          </button>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
            {activeView === "templates" ? "Galeri Template" : "Dasbor Utama"}
          </span>
        </div>

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

        <main style={{ maxWidth: 1080, margin: "0 auto", padding: "48px 2rem 80px" }} className="dashboard-main-content">
          {/* HEADING & INBOX HEADER */}
          <div style={{ marginBottom: 36, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", color: "#0f172a", margin: "0 0 6px" }}>
                {activeView === "templates" ? "Galeri Template" : "Dasbor Utama"}
              </h1>
              <p style={{ fontSize: 14, color: "#64748b", margin: 0, fontWeight: 500 }}>
                {activeView === "templates" 
                  ? "Pilih template yang sudah disesuaikan dengan kebutuhan akademik, organisasi, hingga produktivitas kerja Anda."
                  : <>Selamat datang kembali, <strong style={{ color: "#334155" }}>{userEmail}</strong></>
                }
              </p>
            </div>
          </div>

          {/* Inbox Modal */}
          {showInbox && (
            <InboxNotificationModal
              userEmail={userEmail}
              boards={sortedBoards.map(b => ({ id: b.id, name: b.name }))}
              databaseInvitations={invitations}
              onClose={() => {
                setShowInbox(false);
                router.refresh();
              }}
            />
          )}

          {/* BOARD GRID OR EMPTY STATE (ONLY ON DASHBOARD VIEW) */}
          {activeView === "dashboard" && (
            !sortedBoards.length ? (
              <div style={{
                border: "2px dashed var(--border)", borderRadius: 16,
                padding: "60px 32px", textAlign: "center", background: "#ffffff",
                marginBottom: 40
              }}>
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
                      Buat dengan AI
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
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(310px, 100%), 1fr))", gap: 24, marginBottom: 40 }}>
                {sortedBoards.map((board) => {
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
                      <AnimatedFolder
                        title={board.name}
                        subtitle={`${board.owner_email || "Kanvexa"} • ${dateFormatted}`}
                        isPinned={isPinned}
                        isStarred={isStarred}
                        showOpenButton={true}
                        projects={[
                          { id: `${board.id}-1`, image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop", title: "Kanban Board" },
                          { id: `${board.id}-2`, image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=600&auto=format&fit=crop", title: "Docs & Files" },
                          { id: `${board.id}-3`, image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop", title: "Calendar View" },
                        ]}
                      />
                    </Link>
                  );
                })}
              </div>
            )
          )}

          {/* GALERI TEMPLATE SECTION */}
          <div id="preset-templates-section" style={{ marginTop: 40, paddingTop: 40, borderTop: "1px solid #e2e8f0" }}>
            <div style={{ marginBottom: 28, textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: "#f5f3ff",
                  color: "var(--v)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  <LayoutTemplate style={{ width: 18, height: 18 }} />
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
                  Galeri Template
                </h2>
              </div>
              <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
                Pilih template yang sudah disesuaikan dengan kebutuhan akademik, organisasi, hingga produktivitas kerja Anda.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
              {[
                {
                  category: "1. Kemahasiswaan & Akademik",
                  icon: GraduationCap,
                  color: "#8b5cf6",
                  bg: "#f5f3ff",
                  templates: [
                    {
                      title: "Persiapan Seminar & Skripsi",
                      desc: "Timeline riset, pemetaan bab, list revisi dosen, dan checklist dokumen.",
                      tags: ["Akademik", "Populer"],
                      prompt: "Persiapan Seminar & Skripsi",
                      tagColor: "#8b5cf6",
                      tagBg: "#f5f3ff"
                    },
                    {
                      title: "Manajemen Rapat Organisasi / OSIS",
                      desc: "Agenda rapat, catatan diskusi (MoM), pembagian tugas panitia, dan deadline.",
                      tags: ["Organisasi"],
                      prompt: "Manajemen Rapat Organisasi / OSIS",
                      tagColor: "#2563eb",
                      tagBg: "#eff6ff"
                    }
                  ]
                },
                {
                  category: "2. Produktivitas & Brainstorming",
                  icon: Lightbulb,
                  color: "#d97706",
                  bg: "#fffbeb",
                  templates: [
                    {
                      title: "Mindmap Ide & Brainstorming",
                      desc: "Kanvas bebas untuk mengelompokkan ide acak menjadi prioritas eksekusi.",
                      tags: ["Kreatif"],
                      prompt: "Mindmap Ide & Brainstorming",
                      tagColor: "#d97706",
                      tagBg: "#fffbeb"
                    },
                    {
                      title: "Papan Peluncuran Proyek (Sprint 1 Minggu)",
                      desc: "Kolom To-Do, In Progress, Review, dan Done untuk melacak progres tim secara cepat.",
                      tags: ["Manajemen Proyek"],
                      prompt: "Papan Peluncuran Proyek (Sprint 1 Minggu)",
                      tagColor: "#db2777",
                      tagBg: "#fdf2f8"
                    }
                  ]
                },
                {
                  category: "3. Personal & Career",
                  icon: Target,
                  color: "#059669",
                  bg: "#ecfdf5",
                  templates: [
                    {
                      title: "Rencana Aksi Mingguan (Weekly Planner)",
                      desc: "Pemetaan target 7 hari ke depan agar fokus pada prioritas utama.",
                      tags: ["Personal"],
                      prompt: "Rencana Aksi Mingguan (Weekly Planner)",
                      tagColor: "#059669",
                      tagBg: "#ecfdf5"
                    }
                  ]
                }
              ].map((cat, catIdx) => {
                const CategoryIcon = cat.icon;
                return (
                  <div key={catIdx} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {/* Subheader Kategori */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        width: 26,
                        height: 26,
                        borderRadius: 8,
                        background: cat.bg,
                        color: cat.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0
                      }}>
                        <CategoryIcon style={{ width: 14, height: 14 }} />
                      </div>
                      <h3 style={{ fontSize: 13, fontWeight: 800, color: "#475569", margin: 0, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                        {cat.category}
                      </h3>
                    </div>

                    {/* Grid Cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(300px, 100%), 1fr))", gap: 18 }}>
                      {cat.templates.map((tpl, tplIdx) => (
                        <form key={tplIdx} action={createBoardAction} style={{ margin: 0 }}>
                          <input type="hidden" name="name" value={tpl.prompt} />
                          <button
                            type="submit"
                            style={{
                              width: "100%",
                              height: "100%",
                              textAlign: "left",
                              padding: "20px",
                              borderRadius: 16,
                              background: "#ffffff",
                              border: "1px solid #e2e8f0",
                              cursor: "pointer",
                              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              gap: 16,
                              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                            }}
                            className="template-card-btn"
                          >
                            <div>
                              {/* Tags Badges */}
                              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                                {tpl.tags.map((tag, tagIdx) => (
                                  <span key={tagIdx} style={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    padding: "3px 9px",
                                    borderRadius: 20,
                                    background: tpl.tagBg,
                                    color: tpl.tagColor,
                                    letterSpacing: "0.02em"
                                  }}>
                                    {tag}
                                  </span>
                                ))}
                              </div>

                              {/* Title */}
                              <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 6, lineHeight: 1.35 }}>
                                {tpl.title}
                              </div>

                              {/* Description */}
                              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 400, lineHeight: 1.5 }}>
                                {tpl.desc}
                              </div>
                            </div>

                            {/* Footer Action */}
                            <div style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              fontSize: 12,
                              fontWeight: 700,
                              color: "var(--v)",
                              marginTop: 4
                            }}>
                              <span>Gunakan Template</span>
                              <Plus style={{ width: 14, height: 14 }} />
                            </div>
                          </button>
                        </form>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
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
                Buat Proyek Baru
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
            maxWidth: 440,
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
            overflow: "hidden",
            animation: "modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}>
            <div style={{
              padding: "20px 24px 16px",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                Ubah Nama Papan
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

            <form onSubmit={handleRenameSubmit} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "24px" }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  Nama Papan Baru
                </label>
                <input
                  value={renameInput}
                  onChange={(e) => setRenameInput(e.target.value)}
                  required autoFocus
                  style={{
                    width: "100%", padding: "12px 16px", borderRadius: 12, fontSize: 14,
                    border: "1px solid #cbd5e1", outline: "none",
                    background: "#f8fafc", color: "#0f172a",
                    transition: "all 0.2s"
                  }}
                />
              </div>

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
                  disabled={renaming}
                  style={{
                    padding: "8px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                    background: "var(--v)", color: "#fff", border: "none",
                    cursor: renaming ? "wait" : "pointer",
                    boxShadow: "0 4px 12px rgba(109,40,217,0.2)"
                  }}
                >
                  {renaming ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Delete Board Modal Confirmation */}
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
            maxWidth: 420,
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
            overflow: "hidden",
            animation: "modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}>
            <div style={{ padding: "24px" }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, background: "#fef2f2", color: "#ef4444",
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
                fontSize: 20
              }}>
                🗑️
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>
                Hapus Papan Proyek?
              </h3>
              <p style={{ fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.5 }}>
                Tindakan ini tidak dapat dibatalkan. Seluruh data kolom, tugas, dokumen, dan riwayat di dalam papan ini akan terhapus secara permanen.
              </p>
            </div>

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
                onClick={() => setBoardToDeleteId(null)}
                style={{
                  padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
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
                  padding: "8px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                  background: "#ef4444", color: "#fff", border: "none",
                  cursor: deleting ? "wait" : "pointer",
                  boxShadow: "0 4px 12px rgba(239, 68, 68, 0.25)"
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
          from { transform: translate(-50%, -20px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        @keyframes modalFadeIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .template-card-btn:hover {
          border-color: var(--v) !important;
          boxShadow: 0 10px 25px -5px rgba(109, 40, 217, 0.1), 0 8px 10px -6px rgba(109, 40, 217, 0.05) !important;
          transform: translateY(-2px);
        }
        @media (max-width: 767px) {
          .mobile-sidebar-toggle {
            display: flex !important;
          }
          .dashboard-main-content {
            padding: 24px 16px 80px !important;
          }
        }
      `}</style>
    </div>
  );
}
