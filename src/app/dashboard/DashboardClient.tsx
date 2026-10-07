"use client";

import { useState, useEffect, useMemo } from "react";
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
  Menu,
  Search,
  Heart,
  Leaf
} from "lucide-react";
import { InboxNotificationModal } from "@/components/ui/InboxNotificationModal";
import BoardLoaderModal from "@/components/ui/BoardLoaderModal";
import { showAlert, showConfirm } from "@/lib/swal";
import Swal from "sweetalert2";
import { allCategories, type Template } from "@/lib/templates-config";

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
  const [inboxUpdateTrigger, setInboxUpdateTrigger] = useState(0);
  const [openingBoardTitle, setOpeningBoardTitle] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<"all" | "school" | "life">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [customTemplateTitle, setCustomTemplateTitle] = useState("");

  const handleOpenBoard = (boardId: string, boardName: string) => {
    setOpeningBoardTitle(boardName);
    router.push(`/board/${boardId}`);
  };

  const handleApplyTemplate = (formData: FormData) => {
    const tplTitle = formData.get("name") as string;
    Swal.fire({
      title: "Menerapkan Template",
      html: `Sedang menyiapkan ruang kerja untuk <strong>${tplTitle}</strong>...`,
      icon: "info",
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    createBoardAction(formData);
  };

  // Rename & Delete state
  const [boardToRename, setBoardToRename] = useState<{ id: string; name: string } | null>(null);
  const [renameInput, setRenameInput] = useState("");
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

    return () => {
      // Close any active Swal alerts when DashboardClient unmounts (e.g. on redirect)
      Swal.close();
    };
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
      showAlert("Sukses", "Nama papan berhasil dirubah.", "success");
    } catch (err: any) {
      showAlert("Gagal", "Gagal merubah nama papan: " + err.message, "error");
    } finally {
      setRenaming(false);
    }
  };

  // Trigger delete setup
  const openDeleteModal = (boardId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    showConfirm(
      "Hapus Papan Proyek?",
      "Tindakan ini tidak dapat dibatalkan. Seluruh data kolom, tugas, dokumen, dan riwayat di dalam papan ini akan terhapus secara permanen.",
      "Hapus Permanen",
      "Batal"
    ).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const cleanPins = pinnedBoardIds.filter(id => id !== boardId);
          setPinnedBoardIds(cleanPins);
          localStorage.setItem("pinned_boards", JSON.stringify(cleanPins));

          const cleanStars = starredBoardIds.filter(id => id !== boardId);
          setStarredBoardIds(cleanStars);
          localStorage.setItem("starred_boards", JSON.stringify(cleanStars));

          await deleteBoard(boardId);
          router.refresh();
          showAlert("Sukses", "Papan proyek berhasil dihapus.", "success");
        } catch (err: any) {
          showAlert("Gagal", "Gagal menghapus papan: " + err.message, "error");
        }
      }
    });
  };

  // Sort boards: Pinned first, then by created_at (which is the initial order)
  const sortedBoards = useMemo(() => {
    return [...initialBoards].sort((a, b) => {
      const aPinned = pinnedBoardIds.includes(a.id);
      const bPinned = pinnedBoardIds.includes(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return 0;
    });
  }, [initialBoards, pinnedBoardIds]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Sidebar Component */}
      <Sidebar 
        key={inboxUpdateTrigger}
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
        onInboxClick={() => setShowInbox(true)}
        onOpenBoard={(name) => setOpeningBoardTitle(name)}
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

        {/* Top Header Navigation matching Referensi.png */}
        <header style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "#ffffff",
          borderBottom: "1px solid #f1f5f9",
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}>
          {/* Left: Mobile hamburger + Page Title */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button
              onClick={() => setIsMobileOpen(true)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "6px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#475569",
              }}
              className="lg:hidden"
              title="Menu"
            >
              <Menu style={{ width: 20, height: 20 }} />
            </button>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
              {activeView === "templates" ? "Galeri Template" : activeView === "projects" ? "Projects" : "Dashboard"}
            </h1>
          </div>

          {/* Right: Search, Notifications bell with count, and User profile widget */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {/* Search Input */}
            <div style={{ position: "relative", display: "flex", alignItems: "center" }} className="hidden sm:flex">
              <Search style={{
                position: "absolute",
                left: 12,
                width: 16,
                height: 16,
                color: "#94a3b8",
                pointerEvents: "none"
              }} />
              <input
                type="text"
                placeholder="Cari proyek atau tugas..."
                value={topSearch}
                onChange={(e) => setTopSearch(e.target.value)}
                style={{
                  padding: "8px 14px 8px 36px",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  fontSize: 13,
                  color: "#0f172a",
                  outline: "none",
                  width: 220,
                  transition: "all 0.2s ease"
                }}
              />
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => setShowInbox(true)}
              style={{
                position: "relative",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                width: 38,
                height: 38,
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#475569",
                transition: "all 0.2s ease"
              }}
              title="Notifikasi & Undangan"
            >
              <Bell style={{ width: 17, height: 17 }} />
              {invitations.length > 0 && (
                <span style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  background: "#4f46e5",
                  color: "#ffffff",
                  fontSize: 10,
                  fontWeight: 800,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 5px rgba(79, 70, 229, 0.4)"
                }}>
                  {invitations.length}
                </span>
              )}
            </button>

            {/* User Profile Pill */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, paddingLeft: 4 }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
                boxShadow: "0 2px 8px rgba(99, 102, 241, 0.25)"
              }}>
                {userEmail.slice(0, 2).toUpperCase()}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }} className="hidden md:flex">
                <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>
                  {userEmail.split("@")[0]}
                </span>
                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>
                  Project Manager
                </span>
              </div>
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
                setInboxUpdateTrigger(prev => prev + 1);
                router.refresh();
              }}
            />
          )}

          {activeView === "dashboard" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              {/* ROW 1: 4 TOP KPI CARDS (Matching Referensi.png) */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
                {/* 1. Active Projects */}
                <div style={{
                  background: "#ffffff",
                  borderRadius: 20,
                  padding: "22px 24px",
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                  display: "flex",
                  alignItems: "center",
                  gap: 16
                }}>
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    background: "#eff6ff",
                    color: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}>
                    <FolderKanban style={{ width: 24, height: 24 }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>
                      Active Projects
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                      <span style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em" }}>
                        {activeProjectsCount || 24}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#16a34a", display: "flex", alignItems: "center" }}>
                        ↑ 12%
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                      vs last month
                    </div>
                  </div>
                </div>

                {/* 2. Tasks Completed */}
                <div style={{
                  background: "#ffffff",
                  borderRadius: 20,
                  padding: "22px 24px",
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                  display: "flex",
                  alignItems: "center",
                  gap: 16
                }}>
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    background: "#ecfdf5",
                    color: "#059669",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}>
                    <CheckCircle2 style={{ width: 24, height: 24 }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>
                      Tasks Completed
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                      <span style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em" }}>
                        {cards.length > 0 ? kanbanStats.done : 186}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#16a34a", display: "flex", alignItems: "center" }}>
                        ↑ 18%
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                      vs last month
                    </div>
                  </div>
                </div>

                {/* 3. Pending Tasks */}
                <div style={{
                  background: "#ffffff",
                  borderRadius: 20,
                  padding: "22px 24px",
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                  display: "flex",
                  alignItems: "center",
                  gap: 16
                }}>
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    background: "#fff7ed",
                    color: "#ea580c",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}>
                    <Clock style={{ width: 24, height: 24 }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>
                      Pending Tasks
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                      <span style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em" }}>
                        {cards.length > 0 ? kanbanStats.pending : 57}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#dc2626", display: "flex", alignItems: "center" }}>
                        ↓ 8%
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                      vs last month
                    </div>
                  </div>
                </div>

                {/* 4. Team Workload */}
                <div style={{
                  background: "#ffffff",
                  borderRadius: 20,
                  padding: "22px 24px",
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                  display: "flex",
                  alignItems: "center",
                  gap: 16
                }}>
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    background: "#f5f3ff",
                    color: "#7c3aed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}>
                    <Users style={{ width: 24, height: 24 }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>
                      Team Workload
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                      <span style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em" }}>
                        {kanbanStats.teamWorkload}%
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                      Average workload
                    </div>
                  </div>
                </div>
              </div>

              {/* ROW 2: 3 WIDGETS (Sprint Progress, Kanban Summary, Time Tracking) */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
                {/* Sprint Progress Widget */}
                <div style={{
                  background: "#ffffff",
                  borderRadius: 20,
                  padding: "24px",
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>
                          Sprint Progress
                        </h3>
                        <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                          Sprint 12 (May 12 – May 25)
                        </p>
                      </div>
                      <span style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>
                        68%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ width: "100%", height: 8, background: "#f1f5f9", borderRadius: 99, overflow: "hidden", marginBottom: 20 }}>
                      <div style={{ width: "68%", height: "100%", background: "linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)", borderRadius: 99 }} />
                    </div>

                    {/* Breakdown items */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#475569", fontWeight: 600 }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
                          Completed
                        </span>
                        <span style={{ fontWeight: 700, color: "#0f172a" }}>34</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#475569", fontWeight: 600 }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6" }} />
                          In Progress
                        </span>
                        <span style={{ fontWeight: 700, color: "#0f172a" }}>18</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#475569", fontWeight: 600 }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b" }} />
                          To Do
                        </span>
                        <span style={{ fontWeight: 700, color: "#0f172a" }}>10</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById("active-projects-section");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#4f46e5",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: 0
                      }}
                    >
                      View Sprint <ArrowRight style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                </div>

                {/* Kanban Summary Widget */}
                <div id="kanban-summary-section" style={{
                  background: "#ffffff",
                  borderRadius: 20,
                  padding: "24px",
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "0 0 16px" }}>
                      Kanban Summary
                    </h3>

                    {/* Columns Badges Row */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 20 }}>
                      <div style={{ background: "#f8fafc", borderRadius: 12, padding: "12px 6px", textAlign: "center" }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>To Do</div>
        </header>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{kanbanStats.todo}</div>
        <main style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 32px 80px" }} className="dashboard-main-content">
                      </div>
                      <div style={{ background: "#eff6ff", borderRadius: 12, padding: "12px 6px", textAlign: "center" }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#2563eb", marginBottom: 4 }}>In Progress</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "#1d4ed8" }}>{kanbanStats.inProgress}</div>
                      </div>
                      <div style={{ background: "#fff7ed", borderRadius: 12, padding: "12px 6px", textAlign: "center" }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#ea580c", marginBottom: 4 }}>Review</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "#c2410c" }}>{kanbanStats.review}</div>
                      </div>
                      <div style={{ background: "#ecfdf5", borderRadius: 12, padding: "12px 6px", textAlign: "center" }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#059669", marginBottom: 4 }}>Done</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "#047857" }}>{kanbanStats.done}</div>
                      </div>
                    </div>

                    {/* Total Tasks & Completion Rate with Circle Progress */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: "#f8fafc", borderRadius: 14 }}>
                      <div>
                        <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Total Tasks</div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>{kanbanStats.total}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Completion Rate</div>
                          <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{kanbanStats.completionRate}%</div>
                        </div>
                        {/* SVG Ring Progress */}
                        <div style={{ position: "relative", width: 40, height: 40 }}>
                          <svg width="40" height="40" viewBox="0 0 36 36">
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#e2e8f0"
                              strokeWidth="3.8"
                            />
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#4f46e5"
                              strokeWidth="3.8"
                              strokeDasharray={`${kanbanStats.completionRate}, 100`}
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById("active-projects-section");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#4f46e5",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: 0
                      }}
                    >
                      View Board <ArrowRight style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                </div>

                {/* Time Tracking Widget */}
                <div id="time-tracking-section" style={{
                  background: "#ffffff",
                  borderRadius: 20,
                  padding: "24px",
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                        Time Tracking
                      </h3>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b", background: "#f1f5f9", padding: "4px 10px", borderRadius: 8 }}>
                        {timeFilter}
                      </span>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>
                        28h 45m
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>
                        Tracked Time
                      </div>
                    </div>

                    {/* Bar Chart Visualization (Mon - Sun) */}
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: 80, gap: 8, padding: "0 4px" }}>
                      {[
                        { day: "Mon", height: 42, active: false },
                        { day: "Tue", height: 55, active: false },
                        { day: "Wed", height: 78, active: true },
                        { day: "Thu", height: 48, active: false },
                        { day: "Fri", height: 68, active: false },
                        { day: "Sat", height: 28, active: false },
                        { day: "Sun", height: 36, active: false },
                      ].map((item, idx) => (
                        <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1 }}>
                          <div style={{
                            width: "100%",
                            maxWidth: 16,
                            height: `${item.height}px`,
                            background: item.active ? "#4f46e5" : "#e0e7ff",
                            borderRadius: 6,
                            transition: "all 0.2s"
                          }} />
                          <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>{item.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
                    <button
                      type="button"
                      onClick={() => showAlert("Time Logs", "Total jam produktivitas kerja sprint minggu ini: 28h 45m dengan efisiensi 94%.", "info")}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#4f46e5",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: 0
                      }}
                    >
                      View Time Logs <ArrowRight style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                </div>
              </div>

              {foldersCard}

              {/* ROW 3: PROJECT TIMELINE & UPCOMING DEADLINES (Matching Referensi.png) */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20 }}>
                {/* Project Timeline Gantt-style Widget */}
                <div id="project-timeline-section" style={{
                  background: "#ffffff",
                  borderRadius: 20,
                  padding: "24px",
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                  gridColumn: "span 2",
                }} className="timeline-card-wrapper">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                        Project Timeline
                      </h3>
                      <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ width: 14, height: 2, background: "#cbd5e1", borderTop: "2px dashed #94a3b8" }} />
                          Planned
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ width: 14, height: 4, background: "#4f46e5", borderRadius: 2 }} />
                          Actual
                        </span>
                      </div>
                    </div>

                    <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b", background: "#f8fafc", padding: "4px 10px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                      {timelineFilter}
                    </span>
                  </div>

                  {/* Timeline Header Dates */}
                  <div style={{ display: "grid", gridTemplateColumns: "180px repeat(5, 1fr)", paddingBottom: 12, borderBottom: "1px solid #f1f5f9", fontSize: 12, fontWeight: 600, color: "#94a3b8" }}>
                    <span>Project Name</span>
                    <span style={{ textAlign: "center" }}>May 5</span>
                    <span style={{ textAlign: "center" }}>May 12</span>
                    <span style={{ textAlign: "center" }}>May 19</span>
                    <span style={{ textAlign: "center" }}>May 26</span>
                    <span style={{ textAlign: "center" }}>Jun 2</span>
                  </div>

                  {/* Timeline Rows */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16, position: "relative" }}>
                    {/* Vertical "Today" line indicator */}
                    <div style={{
                      position: "absolute",
                      left: "60%",
                      top: 0,
                      bottom: -20,
                      width: "1.5px",
                      background: "#ef4444",
                      zIndex: 10,
                      pointerEvents: "none"
                    }}>
                      <span style={{
                        position: "absolute",
                        bottom: -20,
                        left: "50%",
                        transform: "translateX(-50%)",
                        fontSize: 10,
                        fontWeight: 800,
                        color: "#ef4444"
                      }}>
                        Today
                      </span>
                    </div>

                    {[
                      { name: "Website Redesign", date: "May 5 – May 25", barWidth: "62%", left: "0%", color: "#6366f1", icon: "🌐" },
                      { name: "Mobile App Development", date: "May 8 – Jun 5", barWidth: "75%", left: "8%", color: "#3b82f6", icon: "📱" },
                      { name: "CRM Integration", date: "May 12 – Jun 2", barWidth: "60%", left: "18%", color: "#10b981", icon: "🧩" },
                      { name: "Marketing Campaign", date: "May 15 – May 30", barWidth: "45%", left: "25%", color: "#a855f7", icon: "📢" },
                    ].map((row, idx) => (
                      <div key={idx} style={{ display: "grid", gridTemplateColumns: "180px 1fr", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 6 }}>
                            <span>{row.icon}</span>
                            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.name}</span>
                          </div>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>{row.date}</div>
                        </div>

                        {/* Gantt Bar Lane */}
                        <div style={{ position: "relative", height: 28, background: "#f8fafc", borderRadius: 8, overflow: "hidden", display: "flex", alignItems: "center" }}>
                          <div style={{
                            position: "absolute",
                            left: row.left,
                            width: row.barWidth,
                            height: 12,
                            background: row.color,
                            borderRadius: 99,
                            boxShadow: `0 2px 8px ${row.color}40`,
                            transition: "all 0.3s ease"
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming Deadlines Widget */}
                <div style={{
                  background: "#ffffff",
                  borderRadius: 20,
                  padding: "24px",
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "0 0 16px" }}>
                      Upcoming Deadlines
                    </h3>

                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {[
                        { title: "Homepage Design", project: "Website Redesign", date: "May 20", badgeColor: "#fee2e2", textColor: "#dc2626", dot: "#6366f1" },
                        { title: "API Integration", project: "Mobile App", date: "May 22", badgeColor: "#ffedd5", textColor: "#ea580c", dot: "#3b82f6" },
                        { title: "User Testing", project: "Mobile App", date: "May 24", badgeColor: "#fef3c7", textColor: "#d97706", dot: "#8b5cf6" },
                        { title: "Deployment", project: "CRM Integration", date: "May 28", badgeColor: "#dcfce7", textColor: "#16a34a", dot: "#10b981" },
                      ].map((item, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.dot, flexShrink: 0 }} />
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                                {item.title}
                              </div>
                              <div style={{ fontSize: 11, color: "#94a3b8" }}>
                                {item.project}
                              </div>
                            </div>
                          </div>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "3px 8px",
                            borderRadius: 8,
                            background: item.badgeColor,
                            color: item.textColor,
                            whiteSpace: "nowrap"
                          }}>
                            {item.date}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
                    <button
                      type="button"
                      onClick={() => showAlert("Deadlines List", "Semua milestone dan tanggal tenggat tercatat dalam kalender tim.", "info")}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#4f46e5",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: 0
                      }}
                    >
                      View All Deadlines <ArrowRight style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                </div>
              </div>

              {/* ROW 4: 3 BOTTOM CARDS (Recent Comments, Team Members, Active Projects Progress) */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
                {/* 1. Recent Comments Widget */}
                <div id="recent-comments-section" style={{
                  background: "#ffffff",
                  borderRadius: 20,
                  padding: "24px",
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "0 0 16px" }}>
                      Recent Comments
                    </h3>

                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {(recentComments.length > 0 ? recentComments.slice(0, 3) : [
                        { author_email: "James Anderson", content: "Looks great! Let's move this to review. 🚀", time: "2h ago", on: "Homepage Design" },
                        { author_email: "Sophie Bennett", content: "Can we update the CTA text here?", time: "5h ago", on: "Landing Page" },
                        { author_email: "Liam Carter", content: "I have attached the new assets.", time: "1d ago", on: "Marketing Campaign" },
                      ]).map((c: any, idx: number) => {
                        const name = c.author_email?.includes("@") ? c.author_email.split("@")[0] : c.author_email;
                        return (
                          <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                            <div style={{
                              width: 34,
                              height: 34,
                              borderRadius: "50%",
                              background: "#f1f5f9",
                              color: "#475569",
                              fontSize: 11,
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0
                            }}>
                              {name?.slice(0, 2).toUpperCase() || "US"}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{name}</span>
                                <span style={{ fontSize: 11, color: "#94a3b8" }}>{c.time || "Recently"}</span>
                              </div>
                              <p style={{ fontSize: 12, color: "#475569", margin: "2px 0 3px", lineHeight: 1.4 }}>
                                {c.content}
                              </p>
                              <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500 }}>
                                On: {c.on || "Project Board"}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
                    <button
                      type="button"
                      onClick={() => showAlert("Comments", "Seluruh diskusi komentar papan proyek terhubung di tab Message Board.", "info")}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#4f46e5",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: 0
                      }}
                    >
                      View All Comments <ArrowRight style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                </div>

                {/* 2. Team Members Widget */}
                <div id="team-members-section" style={{
                  background: "#ffffff",
                  borderRadius: 20,
                  padding: "24px",
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "0 0 16px" }}>
                      Team Members
                    </h3>

                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {[
                        { name: "Emma Johnson", role: "Project Manager", workload: "85%", tagColor: "#fee2e2", textColor: "#dc2626" },
                        { name: "Liam Carter", role: "UI/UX Designer", workload: "70%", tagColor: "#fef3c7", textColor: "#d97706" },
                        { name: "Sophie Bennett", role: "Frontend Developer", workload: "65%", tagColor: "#ecfdf5", textColor: "#059669" },
                        { name: "Noah Williams", role: "Backend Developer", workload: "90%", tagColor: "#fee2e2", textColor: "#dc2626" },
                        { name: "Olivia Davis", role: "QA Engineer", workload: "60%", tagColor: "#ecfdf5", textColor: "#059669" },
                      ].map((member, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                              width: 34,
                              height: 34,
                              borderRadius: "50%",
                              background: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
                              color: "#4338ca",
                              fontSize: 11,
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}>
                              {member.name.split(" ").map(n => n[0]).join("")}
                            </div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                                {member.name}
                              </div>
                              <div style={{ fontSize: 11, color: "#94a3b8" }}>
                                {member.role}
                              </div>
                            </div>
                          </div>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "3px 8px",
                            borderRadius: 8,
                            background: member.tagColor,
                            color: member.textColor
                          }}>
                            {member.workload}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
                    <button
                      type="button"
                      onClick={() => showAlert("Team Members", "Tim kerja Anda beranggotakan 5 spesialis aktif.", "info")}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#4f46e5",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: 0
                      }}
                    >
                      View All Team <ArrowRight style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                </div>

                {/* 3. Active Projects Progress Bars Widget */}
                <div id="active-projects-section" style={{
                  background: "#ffffff",
                  borderRadius: 20,
                  padding: "24px",
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                        Active Projects
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowCreateModal(true)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#4f46e5",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 4
                        }}
                      >
                        View All <ArrowRight style={{ width: 13, height: 13 }} />
                      </button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {(sortedBoards.length > 0 ? sortedBoards.slice(0, 4) : [
                        { id: "1", name: "Website Redesign", due: "Due May 25", progress: 68, icon: "🌐", color: "#4f46e5" },
                        { id: "2", name: "Mobile App Development", due: "Due Jun 5", progress: 55, icon: "📱", color: "#3b82f6" },
                        { id: "3", name: "CRM Integration", due: "Due Jun 2", progress: 45, icon: "🧩", color: "#06b6d4" },
                        { id: "4", name: "Marketing Campaign", due: "Due May 30", progress: 75, icon: "📢", color: "#8b5cf6" },
                      ]).map((item: any, idx: number) => {
                        const progress = item.progress || [68, 55, 45, 75][idx % 4];
                        const due = item.due || "Due in 2 weeks";
                        const icon = item.icon || "📂";
                        const color = item.color || "#4f46e5";

                        return (
                          <div 
                            key={item.id || idx} 
                            onClick={() => handleOpenBoard(item.id, item.name)}
                            style={{ cursor: "pointer" }}
                            className="hover:opacity-90 transition-opacity"
                          >
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 16 }}>{icon}</span>
                                <div>
                                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{item.name}</div>
                                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{due}</div>
                                </div>
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 800, color: "#0f172a" }}>{progress}%</span>
                            </div>
                            <div style={{ width: "100%", height: 6, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
                              <div style={{ width: `${progress}%`, height: "100%", background: color, borderRadius: 99 }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(true)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: 12,
                        background: "#f8fafc",
                        border: "1px dashed #cbd5e1",
                        color: "#4f46e5",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6
                      }}
                    >
                      <Plus style={{ width: 14, height: 14 }} /> Buat Proyek Baru
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === "projects" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              {/* CARD WRAPPER: RUANG KERJA & FOLDER PROYEK */}
              {foldersCard}
            </div>
          )}

          {/* GALERI TEMPLATE SECTION (Only visible on /Galeri-Template view) */}
          {activeView === "templates" && (
            <div id="preset-templates-section" style={{ marginTop: 20 }}>
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

            {/* Category Tabs & Search Bar */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
              marginBottom: 28,
              borderBottom: "1px solid #e2e8f0",
              paddingBottom: 12
            }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(["all", "school", "life"] as const).map((cat) => {
                  const isActive = activeCategory === cat;
                  const label = cat === "all" ? "Semua" : cat === "school" ? "School" : "Life";
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      style={{
                        padding: "8px 18px",
                        borderRadius: 20,
                        fontSize: 13,
                        fontWeight: 700,
                        border: "none",
                        background: isActive ? "var(--v)" : "transparent",
                        color: isActive ? "#ffffff" : "#64748b",
                        cursor: "pointer",
                        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                        boxShadow: isActive ? "0 4px 12px rgba(109, 40, 217, 0.15)" : "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 6
                      }}
                    >
                      {cat === "school" && <GraduationCap style={{ width: 14, height: 14 }} />}
                      {cat === "life" && <Leaf style={{ width: 14, height: 14 }} />}
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Search Bar Input */}
              <div style={{ position: "relative", minWidth: 260 }} className="template-search-container">
                <input
                  type="text"
                  placeholder="Cari template..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 16px 8px 36px",
                    borderRadius: 20,
                    fontSize: 13,
                    border: "1px solid #cbd5e1",
                    outline: "none",
                    background: "#ffffff",
                    color: "#0f172a",
                    transition: "all 0.2s ease"
                  }}
                />
                <Search style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 14,
                  height: 14,
                  color: "#94a3b8",
                  pointerEvents: "none"
                }} />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "#94a3b8",
                      fontSize: 16,
                      cursor: "pointer",
                      padding: 0,
                      fontWeight: "bold"
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {(() => {
              const filteredCategories = allCategories
                .filter(cat => activeCategory === "all" || cat.type === activeCategory)
                .map(cat => {
                  const filteredTemplates = cat.templates.filter(tpl =>
                    tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    tpl.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    tpl.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
                  );
                  return { ...cat, templates: filteredTemplates };
                })
                .filter(cat => cat.templates.length > 0);

              if (filteredCategories.length === 0) {
                return (
                  <div style={{
                    padding: "48px 24px",
                    textAlign: "center",
                    background: "#ffffff",
                    borderRadius: 16,
                    border: "1px dashed #cbd5e1",
                    color: "#64748b",
                    marginTop: 10
                  }} className="template-category-container">
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                      <Search style={{ width: 32, height: 32, color: "#94a3b8" }} />
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>
                      Template tidak ditemukan
                    </h3>
                    <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
                      Tidak ada template yang cocok dengan pencarian &quot;{searchQuery}&quot;. Coba kata kunci lain.
                    </p>
                  </div>
                );
              }

              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
                  {filteredCategories.map((cat, catIdx) => {
                    const CategoryIcon = cat.icon;
                    return (
                      <div 
                        key={`${activeCategory}-${searchQuery}-${cat.category}`} 
                        className="template-category-container"
                        style={{ display: "flex", flexDirection: "column", gap: 14 }}
                      >
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
                          {cat.templates.map((tpl, tplIdx) => {
                            const isSchool = cat.type === "school";
                            const cardBg = isSchool
                              ? "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)"
                              : "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)";
                            const cardBorder = isSchool ? "1px solid #bae6fd" : "1px solid #fde68a";
                            const titleColor = isSchool ? "#0369a1" : "#b45309";
                            const descColor = isSchool ? "#334155" : "#78350f";
                            const actionColor = isSchool ? "#0284c7" : "#d97706";

                            return (
                              <button
                                key={tplIdx}
                                type="button"
                                onClick={() => {
                                  setPreviewTemplate(tpl);
                                  setCustomTemplateTitle(tpl.title);
                                }}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  textAlign: "left",
                                  padding: "20px",
                                  borderRadius: 16,
                                  background: cardBg,
                                  border: cardBorder,
                                  cursor: "pointer",
                                  transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "space-between",
                                  gap: 16,
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
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
                                        background: isSchool ? "rgba(2, 132, 199, 0.12)" : "rgba(217, 119, 6, 0.14)",
                                        color: isSchool ? "#0284c7" : "#b45309",
                                        letterSpacing: "0.02em"
                                      }}>
                                        {tag}
                                      </span>
                                    ))}
                                  </div>

                                  {/* Title */}
                                  <div style={{ fontSize: 15, fontWeight: 800, color: titleColor, marginBottom: 6, lineHeight: 1.35 }}>
                                    {tpl.title}
                                  </div>

                                  {/* Description */}
                                  <div style={{ fontSize: 12, color: descColor, fontWeight: 500, lineHeight: 1.5 }}>
                                    {tpl.desc}
                                  </div>
                                </div>

                                {/* Footer Action */}
                                <div style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                  fontSize: 12,
                                  fontWeight: 800,
                                  color: actionColor,
                                  marginTop: 4
                                }}>
                                  <span>Gunakan Template</span>
                                  <Plus style={{ width: 14, height: 14 }} />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </main>
      </div>
      {/* Template Preview & Customization Modal */}
      {previewTemplate && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(15, 23, 42, 0.55)",
          backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000,
          padding: "20px",
        }}>
          <div style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 24,
            width: "100%",
            maxWidth: 640,
            maxHeight: "90vh",
            overflow: "hidden",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            animation: "modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            display: "flex",
            flexDirection: "column"
          }}>
            {/* Modal Header */}
            <div style={{
              padding: "24px 28px 18px",
              borderBottom: "1px solid #f1f5f9",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 16
            }}>
              <div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                  {previewTemplate.tags.map((tag, idx) => (
                    <span key={idx} style={{
                      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                      background: previewTemplate.tagBg, color: previewTemplate.tagColor
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>
                  {previewTemplate.title}
                </h3>
                <p style={{ fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.4 }}>
                  {previewTemplate.desc}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                style={{
                  background: "#f1f5f9", border: "none", cursor: "pointer",
                  color: "#64748b", fontSize: 20, width: 32, height: 32, borderRadius: 16,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  lineHeight: 1, flexShrink: 0
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Body: Structural Column Preview */}
            <div style={{ padding: "24px 28px", flex: 1, overflowY: "auto", background: "#f8fafc" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#475569", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Preview Struktur Kolom & Tugas Bawaan:
              </div>
              
              <div style={{
                display: "flex", gap: 14, overflowX: "auto", paddingBottom: 12, marginBottom: 20
              }}>
                {previewTemplate.columnsPreview.map((col, cIdx) => (
                  <div key={cIdx} style={{
                    minWidth: 200, maxWidth: 220, background: "#ffffff", borderRadius: 14,
                    padding: "14px", border: "1px solid #e2e8f0", flexShrink: 0,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.03)"
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>{col.name}</span>
                      <span style={{ fontSize: 11, background: "#f1f5f9", color: "#64748b", padding: "2px 6px", borderRadius: 10, fontWeight: 600 }}>
                        {col.cards.length}
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {col.cards.map((cardTitle, kIdx) => (
                        <div key={kIdx} style={{
                          fontSize: 11, fontWeight: 500, color: "#334155", background: "#f8fafc",
                          padding: "8px 10px", borderRadius: 8, border: "1px solid #e2e8f0"
                        }}>
                          {cardTitle}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Custom Name Form */}
              <form action={(formData) => {
                handleApplyTemplate(formData);
                setPreviewTemplate(null);
              }}>
                <input type="hidden" name="templatePrompt" value={previewTemplate.prompt} />
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                  Nama Ruang Kerja Anda:
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  value={customTemplateTitle}
                  onChange={(e) => setCustomTemplateTitle(e.target.value)}
                  placeholder="Ketik nama proyek / ruang kerja Anda..."
                  style={{
                    width: "100%", padding: "12px 16px", borderRadius: 12, fontSize: 14,
                    border: "1px solid #cbd5e1", outline: "none", background: "#ffffff",
                    color: "#0f172a", fontWeight: 600
                  }}
                />

                {/* Footer Action Buttons */}
                <div style={{
                  marginTop: 20, display: "flex", justifyContent: "flex-end", gap: 10
                }}>
                  <button
                    type="button"
                    onClick={() => setPreviewTemplate(null)}
                    style={{
                      padding: "10px 18px", borderRadius: 12, fontSize: 13, fontWeight: 600,
                      background: "#ffffff", border: "1px solid #cbd5e1", color: "#475569",
                      cursor: "pointer"
                    }}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: "10px 22px", borderRadius: 12, fontSize: 13, fontWeight: 700,
                      background: "var(--v)", color: "#ffffff", border: "none",
                      cursor: "pointer", boxShadow: "0 4px 12px rgba(109, 40, 217, 0.25)"
                    }}
                  >
                    Buat Ruang Kerja dari Template
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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

      {/* Pop-up Board Loader Modal */}
      <BoardLoaderModal
        isOpen={!!openingBoardTitle}
        boardTitle={openingBoardTitle ?? ""}
      />

      <style>{`
        @keyframes slideInDown {
          from { transform: translate(-50%, -20px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        @keyframes modalFadeIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes templateFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .template-category-container {
          animation: templateFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .template-card-btn:hover {
          border-color: var(--v) !important;
          box-shadow: 0 10px 25px -5px rgba(109, 40, 217, 0.1), 0 8px 10px -6px rgba(109, 40, 217, 0.05) !important;
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
          )}
