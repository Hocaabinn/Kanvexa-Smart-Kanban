"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  FolderKanban, 
  Plus, 
  LogOut, 
  Star,
  Pin,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Trash2,
  Edit3,
  Settings,
  LayoutDashboard,
  LayoutTemplate,
  Clock,
  Menu,
  X,
  Inbox,
  Bell,
  Mail,
  User,
  Sliders,
  Sparkles
} from "lucide-react";
import { showAlert } from "@/lib/swal";
import { KanvexaIcon, KanvexaLogo } from "@/components/ui/KanvexaLogo";
import { InboxNotificationModal } from "@/components/ui/InboxNotificationModal";

interface Board {
  id: string;
  name: string;
  created_at: string;
  owner_email?: string;
}

interface SidebarProps {
  userEmail: string;
  boards: Board[];
  pinnedBoardIds: string[];
  starredBoardIds: string[];
  signOutAction: () => Promise<void>;
  onCreateBoardClick: () => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  onPinAction: (boardId: string, e: React.MouseEvent) => void;
  onStarAction: (boardId: string, e: React.MouseEvent) => void;
  onRenameAction: (boardId: string, boardName: string, e: React.MouseEvent) => void;
  onDeleteAction: (boardId: string, e: React.MouseEvent) => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
  onInboxClick?: () => void;
  onOpenBoard?: (boardName: string) => void;
}

function initials(email: string) {
  return email.slice(0, 2).toUpperCase();
}

export default function Sidebar({
  userEmail,
  boards,
  pinnedBoardIds,
  starredBoardIds,
  signOutAction,
  onCreateBoardClick,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  onPinAction,
  onStarAction,
  onRenameAction,
  onDeleteAction,
  isMobileOpen = false,
  setIsMobileOpen,
  onInboxClick,
  onOpenBoard,
}: SidebarProps) {
  const [showInboxModal, setShowInboxModal] = useState(false);
  const pathname = usePathname();
  const isDashboardActive = pathname === "/dashboard";
  const isTemplatesActive = pathname === "/Galeri-Template";

  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);
  const [isFavoritesExpanded, setIsFavoritesExpanded] = useState(true);
  const [isRecentsExpanded, setIsRecentsExpanded] = useState(false);
  const [activeMenuBoardId, setActiveMenuBoardId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      if (!userEmail || userEmail === "Guest") return;

      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      
      const { data: invitations } = await supabase
        .from("board_invitations")
        .select("id, invited_email, status")
        .eq("status", "pending");

      let realCount = 0;
      if (invitations) {
        const userEmailLower = userEmail.toLowerCase();
        const filtered = invitations.filter(
          inv => inv.invited_email.toLowerCase() === userEmailLower
        );
        realCount = filtered.length;
      }

      let mockUnread = 1; // mock-activity is unread by default

      if (typeof window !== "undefined") {
        try {
          const dismissed = localStorage.getItem("dismissed_notifications");
          const read = localStorage.getItem("read_notifications");
          
          const dismissedIds = dismissed ? JSON.parse(dismissed) : [];
          const readIds = read ? JSON.parse(read) : [];

          if (dismissedIds.includes("mock-activity") || readIds.includes("mock-activity")) {
            mockUnread = 0;
          }

          if (invitations) {
            const userEmailLower = userEmail.toLowerCase();
            const filteredUnread = invitations.filter(
              inv => inv.invited_email.toLowerCase() === userEmailLower && !readIds.includes(inv.id) && !dismissedIds.includes(inv.id)
            );
            realCount = filteredUnread.length;
          }
        } catch (e) {}
      }

      setUnreadCount(realCount + mockUnread);
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  }, [userEmail]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Close 3-dots menu on window click
  useEffect(() => {
    if (!activeMenuBoardId) return;
    const handleClose = () => setActiveMenuBoardId(null);
    window.addEventListener("click", handleClose);
    return () => window.removeEventListener("click", handleClose);
  }, [activeMenuBoardId]);

  const toggleMenu = (boardId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenuBoardId(activeMenuBoardId === boardId ? null : boardId);
  };

  // Filter starred boards
  const starredBoards = boards.filter(b => starredBoardIds.includes(b.id));

  // Sort recent boards by created_at
  const recentBoards = [...boards]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  // Render a board item with its 3-dots actions menu
  const renderBoardItem = (b: Board) => {
    const isPinned = pinnedBoardIds.includes(b.id);
    const isStarred = starredBoardIds.includes(b.id);
    const isMenuOpen = activeMenuBoardId === b.id;

    return (
      <div 
        key={b.id} 
        style={{ position: "relative" }}
        className="sidebar-item-container"
      >
        <Link
          href={`/board/${b.id}`}
          style={{ textDecoration: "none" }}
          onClick={() => {
            if (onOpenBoard) onOpenBoard(b.name);
          }}
        >
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "9px 12px",
            borderRadius: "10px",
            cursor: "pointer",
            transition: "all 0.2s",
            paddingRight: "36px", // Space for 3-dots button
          }} className="sidebar-board-item">
            <FolderKanban style={{ width: "16px", height: "16px", color: "#64748b", flexShrink: 0 }} />
            <span style={{ 
              fontSize: "13px", 
              fontWeight: "600", 
              color: "#334155", 
              flex: 1, 
              whiteSpace: "nowrap", 
              overflow: "hidden", 
              textOverflow: "ellipsis" 
            }}>
              {b.name}
            </span>
            <div style={{ display: "flex", gap: "4px", alignItems: "center", flexShrink: 0 }}>
              {isPinned && <Pin style={{ width: "10px", height: "10px", color: "#10b981", fill: "#10b981" }} />}
              {isStarred && <Star style={{ width: "10px", height: "10px", color: "#d97706", fill: "#d97706" }} />}
            </div>
          </div>
        </Link>

        {/* 3-Dots Menu Button */}
        {!isSidebarCollapsed && (
          <button
            onClick={(e) => toggleMenu(b.id, e)}
            style={{
              position: "absolute",
              right: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#94a3b8",
              padding: "4px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              transition: "all 0.2s"
            }}
            className="btn-item-more"
            title="Menu Aksi"
          >
            <MoreVertical style={{ width: "14px", height: "14px" }} />
          </button>
        )}

        {/* Floating Actions Dropdown Menu */}
        {isMenuOpen && !isSidebarCollapsed && (
          <div style={{
            position: "absolute",
            top: "36px",
            right: "8px",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            zIndex: 100,
            width: "160px",
            padding: "4px",
            display: "flex",
            flexDirection: "column",
            gap: "2px"
          }}>
            {/* Star Action */}
            <button
              onClick={(e) => { onStarAction(b.id, e); setActiveMenuBoardId(null); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 10px",
                fontSize: "12px",
                fontWeight: "600",
                color: "#475569",
                background: "none",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                textAlign: "left",
                transition: "background-color 0.15s"
              }}
              className="dropdown-action-item"
            >
              <Star style={{ width: "14px", height: "14px", color: isStarred ? "#d97706" : "#64748b", fill: isStarred ? "#d97706" : "none" }} />
              <span>{isStarred ? "Hapus Favorit" : "Favorit"}</span>
            </button>

            {/* Pin Action */}
            <button
              onClick={(e) => { onPinAction(b.id, e); setActiveMenuBoardId(null); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 10px",
                fontSize: "12px",
                fontWeight: "600",
                color: "#475569",
                background: "none",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                textAlign: "left",
                transition: "background-color 0.15s"
              }}
              className="dropdown-action-item"
            >
              <Pin style={{ width: "14px", height: "14px", color: isPinned ? "#10b981" : "#64748b", fill: isPinned ? "#10b981" : "none" }} />
              <span>{isPinned ? "Unpin dari Papan" : "Pin ke Papan"}</span>
            </button>

            {/* Rename Action */}
            <button
              onClick={(e) => { onRenameAction(b.id, b.name, e); setActiveMenuBoardId(null); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 10px",
                fontSize: "12px",
                fontWeight: "600",
                color: "#475569",
                background: "none",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                textAlign: "left",
                transition: "background-color 0.15s"
              }}
              className="dropdown-action-item"
            >
              <Edit3 style={{ width: "14px", height: "14px", color: "#64748b" }} />
              <span>Ubah Nama</span>
            </button>

            {/* Delete Action */}
            <button
              onClick={(e) => { onDeleteAction(b.id, e); setActiveMenuBoardId(null); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 10px",
                fontSize: "12px",
                fontWeight: "600",
                color: "#ef4444",
                background: "none",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                textAlign: "left",
                transition: "background-color 0.15s"
              }}
              className="dropdown-action-item-danger"
            >
              <Trash2 style={{ width: "14px", height: "14px", color: "#ef4444" }} />
              <span>Hapus Papan</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  // Close sidebar on route change (mobile)
  const closeMobileSidebar = useCallback(() => {
    if (setIsMobileOpen) setIsMobileOpen(false);
  }, [setIsMobileOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isMobileOpen) return;
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") closeMobileSidebar(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isMobileOpen, closeMobileSidebar]);

  return (
    <>
    {/* Mobile overlay backdrop */}
    {isMobileOpen && (
      <div
        onClick={closeMobileSidebar}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(4px)",
          zIndex: 998,
        }}
        className="sidebar-mobile-overlay"
      />
    )}
    <aside
      className={`sidebar-root ${isMobileOpen ? "sidebar-mobile-open" : ""}`}
      style={{
        width: isSidebarCollapsed ? "72px" : "260px",
        height: "100vh",
        background: "#ffffff",
        borderRight: "1px solid #e2e8f0",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        flexShrink: 0,
        zIndex: 999,
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "visible"
      }}
    >
      {/* 1. Logo Section & Sidebar Collapse Toggle */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: isSidebarCollapsed ? "center" : "space-between", 
        padding: "24px 20px 16px" 
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {isSidebarCollapsed ? (
            <img
              src="/img/logo3.png"
              alt="Kanvexa"
              style={{
                width: "32px",
                height: "32px",
                objectFit: "contain",
                borderRadius: "8px",
                flexShrink: 0
              }}
            />
          ) : (
            <KanvexaLogo src="/img/logo2-purple.png" imgClassName="h-8 w-auto object-contain" />
          )}
        </div>

        {/* Toggle Button */}
        {!isSidebarCollapsed && (
          <button
            onClick={() => setIsSidebarCollapsed(true)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#94a3b8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "4px",
              borderRadius: "6px",
              transition: "background-color 0.2s"
            }}
            className="btn-toggle-sidebar"
            title="Sembunyikan Sidebar"
          >
            <ChevronLeft style={{ width: "18px", height: "18px" }} />
          </button>
        )}
      </div>

      {/* Expanded Collapse Toggle when collapsed */}
      {isSidebarCollapsed && (
        <div style={{ display: "flex", justifyContent: "center", paddingBottom: "12px" }}>
          <button
            onClick={() => setIsSidebarCollapsed(false)}
            style={{
              background: "#f1f5f9",
              border: "1px solid #e2e8f0",
              cursor: "pointer",
              color: "#475569",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
            }}
            title="Tampilkan Sidebar"
          >
            <ChevronRight style={{ width: "16px", height: "16px" }} />
          </button>
        </div>
      )}

      {/* 2. "Papan Baru" Button */}
      <div style={{ padding: isSidebarCollapsed ? "8px 12px" : "8px 20px 16px" }}>
        <button
          onClick={onCreateBoardClick}
          style={{
            width: "100%",
            height: "42px",
            borderRadius: "12px",
            fontSize: "13px",
            fontWeight: "700",
            background: "var(--v)",
            color: "#ffffff",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: isSidebarCollapsed ? "0" : "8px",
            boxShadow: "0 4px 12px rgba(109, 40, 217, 0.2)",
            transition: "all 0.2s",
            padding: 0
          }}
          className="btn-sidebar-create"
          title="Buat Papan Baru"
        >
          <Plus style={{ width: "16px", height: "16px", flexShrink: 0 }} />
          {!isSidebarCollapsed && <span style={{ whiteSpace: "nowrap" }}>Papan Baru</span>}
        </button>
      </div>

      {/* 3. Navigation Sections (Scrollable) */}
      <div style={{ 
        flex: 1, 
        overflowY: "auto", 
        padding: "8px 12px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "20px"
      }} className="sidebar-scroll">

        {/* SECTION 1: UTAMA */}
        <div>
          {!isSidebarCollapsed && (
            <div style={{ 
              fontSize: "10px", 
              fontWeight: "800", 
              color: "#94a3b8", 
              letterSpacing: "0.06em", 
              textTransform: "uppercase",
              padding: "0 12px 8px"
            }}>
              UTAMA
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {/* Dasbor Utama */}
            <Link href="/dashboard" style={{ textDecoration: "none" }}>
              <div 
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  background: isDashboardActive ? "#f1f5f9" : "transparent",
                  justifyContent: isSidebarCollapsed ? "center" : "flex-start"
                }}
                className="sidebar-nav-item"
                title="Dasbor Utama"
              >
                <LayoutDashboard style={{ width: "16px", height: "16px", color: isDashboardActive ? "var(--v)" : "#64748b", flexShrink: 0 }} />
                {!isSidebarCollapsed && (
                  <span style={{ fontSize: "13px", fontWeight: isDashboardActive ? "700" : "600", color: isDashboardActive ? "var(--v)" : "#334155" }}>
                    Dasbor Utama
                  </span>
                )}
              </div>
            </Link>

            {/* Galeri Template */}
            <Link href="/Galeri-Template" style={{ textDecoration: "none" }}>
              <div 
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  background: isTemplatesActive ? "#f1f5f9" : "transparent",
                  justifyContent: isSidebarCollapsed ? "center" : "flex-start"
                }}
                className="sidebar-nav-item"
                title="Galeri Template"
              >
                <LayoutTemplate style={{ width: "16px", height: "16px", color: isTemplatesActive ? "var(--v)" : "#64748b", flexShrink: 0 }} />
                {!isSidebarCollapsed && (
                  <span style={{ fontSize: "13px", fontWeight: isTemplatesActive ? "700" : "600", color: isTemplatesActive ? "var(--v)" : "#334155" }}>
                    Galeri Template
                  </span>
                )}
              </div>
            </Link>

            {/* Kotak Masuk (Inbox) */}
            <div
              onClick={() => {
                if (onInboxClick) onInboxClick();
                else setShowInboxModal(true);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: "10px",
                cursor: "pointer",
                transition: "all 0.2s",
                background: "transparent",
                justifyContent: isSidebarCollapsed ? "center" : "flex-start",
                position: "relative",
              }}
              className="sidebar-nav-item"
              title="Kotak Masuk & Notifikasi"
            >
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <Inbox style={{ width: "16px", height: "16px", color: "#64748b", flexShrink: 0 }} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -2,
                      right: -2,
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "#ef4444",
                      border: "1.5px solid #ffffff",
                    }}
                  />
                )}
              </div>
              {!isSidebarCollapsed && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1 }}>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#334155" }}>
                    Kotak Masuk
                  </span>
                  {unreadCount > 0 && (
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: "800",
                        background: "rgba(109, 40, 217, 0.1)",
                        color: "#6d28d9",
                        padding: "1px 6px",
                        borderRadius: "10px",
                      }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2: RUANG KERJA */}
        <div>
          {!isSidebarCollapsed && (
            <div style={{ 
              fontSize: "10px", 
              fontWeight: "800", 
              color: "#94a3b8", 
              letterSpacing: "0.06em", 
              textTransform: "uppercase",
              padding: "0 12px 8px"
            }}>
              RUANG KERJA
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* 1. Proyek Saya */}
            <div>
              <div 
                onClick={() => {
                  if (!isSidebarCollapsed) {
                    setIsProjectsExpanded(!isProjectsExpanded);
                  } else {
                    setIsSidebarCollapsed(false);
                    setIsProjectsExpanded(true);
                  }
                }}
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: isSidebarCollapsed ? "center" : "space-between",
                  cursor: "pointer", 
                  padding: "6px 12px",
                  borderRadius: "8px",
                  userSelect: "none"
                }}
                className="sidebar-group-header"
                title={isSidebarCollapsed ? "Tampilkan Proyek Saya" : "Tutup/Buka Proyek Saya"}
              >
                {isSidebarCollapsed ? (
                  <FolderKanban style={{ width: "18px", height: "18px", color: "#64748b" }} />
                ) : (
                  <>
                    <div style={{ 
                      fontSize: "13px", 
                      fontWeight: "700", 
                      color: "#334155", 
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}>
                      <FolderKanban style={{ width: "16px", height: "16px", color: "#64748b" }} />
                      <span>Proyek Saya</span>
                    </div>
                    <ChevronDown style={{ 
                      width: "14px", 
                      height: "14px", 
                      color: "#94a3b8",
                      transform: isProjectsExpanded ? "none" : "rotate(-90deg)",
                      transition: "transform 0.2s"
                    }} />
                  </>
                )}
              </div>
              
              {(!isSidebarCollapsed && isProjectsExpanded) && (
                <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "4px", paddingLeft: "8px" }}>
                  {!boards.length ? (
                    <div style={{ padding: "10px 12px", fontSize: "12px", color: "#94a3b8" }}>
                      Belum ada proyek
                    </div>
                  ) : (
                    boards.map(renderBoardItem)
                  )}
                </div>
              )}
            </div>

            {/* 2. Papan Favorit */}
            <div>
              <div 
                onClick={() => {
                  if (!isSidebarCollapsed) {
                    setIsFavoritesExpanded(!isFavoritesExpanded);
                  } else {
                    setIsSidebarCollapsed(false);
                    setIsFavoritesExpanded(true);
                  }
                }}
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: isSidebarCollapsed ? "center" : "space-between",
                  cursor: "pointer", 
                  padding: "6px 12px",
                  borderRadius: "8px",
                  userSelect: "none"
                }}
                className="sidebar-group-header"
                title={isSidebarCollapsed ? "Tampilkan Papan Favorit" : "Tutup/Buka Papan Favorit"}
              >
                {isSidebarCollapsed ? (
                  <Star style={{ width: "18px", height: "18px", color: "#d97706", fill: "#d97706" }} />
                ) : (
                  <>
                    <div style={{ 
                      fontSize: "13px", 
                      fontWeight: "700", 
                      color: "#334155", 
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}>
                      <Star style={{ width: "16px", height: "16px", color: "#d97706", fill: "#d97706" }} />
                      <span>Papan Favorit</span>
                    </div>
                    <ChevronDown style={{ 
                      width: "14px", 
                      height: "14px", 
                      color: "#94a3b8",
                      transform: isFavoritesExpanded ? "none" : "rotate(-90deg)",
                      transition: "transform 0.2s"
                    }} />
                  </>
                )}
              </div>
              
              {(!isSidebarCollapsed && isFavoritesExpanded) && (
                <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "4px", paddingLeft: "8px" }}>
                  {!starredBoards.length ? (
                    <div style={{ padding: "10px 12px", fontSize: "12px", color: "#94a3b8" }}>
                      Belum ada papan favorit
                    </div>
                  ) : (
                    starredBoards.map(renderBoardItem)
                  )}
                </div>
              )}
            </div>

            {/* 3. Terakhir Dibuka */}
            <div>
              <div 
                onClick={() => {
                  if (!isSidebarCollapsed) {
                    setIsRecentsExpanded(!isRecentsExpanded);
                  } else {
                    setIsSidebarCollapsed(false);
                    setIsRecentsExpanded(true);
                  }
                }}
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: isSidebarCollapsed ? "center" : "space-between",
                  cursor: "pointer", 
                  padding: "6px 12px",
                  borderRadius: "8px",
                  userSelect: "none"
                }}
                className="sidebar-group-header"
                title={isSidebarCollapsed ? "Tampilkan Terakhir Dibuka" : "Tutup/Buka Terakhir Dibuka"}
              >
                {isSidebarCollapsed ? (
                  <Clock style={{ width: "18px", height: "18px", color: "#64748b" }} />
                ) : (
                  <>
                    <div style={{ 
                      fontSize: "13px", 
                      fontWeight: "700", 
                      color: "#334155", 
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}>
                      <Clock style={{ width: "16px", height: "16px", color: "#64748b" }} />
                      <span>Terakhir Dibuka</span>
                    </div>
                    <ChevronDown style={{ 
                      width: "14px", 
                      height: "14px", 
                      color: "#94a3b8",
                      transform: isRecentsExpanded ? "none" : "rotate(-90deg)",
                      transition: "transform 0.2s"
                    }} />
                  </>
                )}
              </div>
              
              {(!isSidebarCollapsed && isRecentsExpanded) && (
                <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "4px", paddingLeft: "8px" }}>
                  {!recentBoards.length ? (
                    <div style={{ padding: "10px 12px", fontSize: "12px", color: "#94a3b8" }}>
                      Belum ada papan terakhir dibuka
                    </div>
                  ) : (
                    recentBoards.map(renderBoardItem)
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* 4. Avatar + Logout (Sticky Bottom) */}
      <div style={{ 
        padding: isSidebarCollapsed ? "16px 12px" : "16px 20px", 
        borderTop: "1px solid #e2e8f0", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: isSidebarCollapsed ? "center" : "space-between", 
        background: "#f8fafc",
        flexDirection: isSidebarCollapsed ? "column" : "row",
        gap: isSidebarCollapsed ? "12px" : "0",
        flexShrink: 0
      }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "10px", 
          overflow: "hidden", 
          flex: isSidebarCollapsed ? "none" : 1,
          justifyContent: isSidebarCollapsed ? "center" : "flex-start"
        }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "var(--v)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: "700",
            boxShadow: "0 2px 6px rgba(109, 40, 217, 0.15)",
            flexShrink: 0
          }}>
            {initials(userEmail)}
          </div>
          {!isSidebarCollapsed && (
            <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <span style={{ 
                fontSize: "13px", 
                fontWeight: "700", 
                color: "#1e293b", 
                whiteSpace: "nowrap", 
                overflow: "hidden", 
                textOverflow: "ellipsis" 
              }}>
                {userEmail.split("@")[0]}
              </span>
              <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "500" }}>Aktif</span>
            </div>
          )}
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button
            type="button"
            onClick={() => showAlert(
              "Settings App Kanvexa",
              `• User Login: ${userEmail}\n• Status Akun: Aktif\n• Versi App: v1.0.0 Pro`,
              "info"
            )}
            title="Settings / Pengaturan"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#94a3b8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px",
              borderRadius: "8px",
              transition: "all 0.2s"
            }}
            className="btn-sidebar-settings"
          >
            <Settings style={{ width: "16px", height: "16px" }} />
          </button>
          
          <form action={signOutAction} style={{ display: "flex" }}>
            <button 
              type="submit" 
              title="Keluar"
              style={{ 
                background: "none", 
                border: "none", 
                cursor: "pointer", 
                color: "#94a3b8", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                padding: "8px",
                borderRadius: "8px",
                transition: "all 0.2s"
              }} 
              className="btn-sidebar-logout"
            >
              <LogOut style={{ width: "16px", height: "16px" }} />
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .btn-toggle-sidebar:hover {
          background-color: #f1f5f9;
          color: #334155;
        }
        .btn-sidebar-create:hover {
          background: var(--v-mid) !important;
          transform: translateY(-1px);
        }
        .sidebar-board-item:hover {
          background-color: #f8fafc;
        }
        .sidebar-item-container:hover .btn-item-more {
          opacity: 1;
        }
        .btn-item-more {
          opacity: 0;
        }
        .btn-item-more:hover {
          background-color: #f1f5f9;
          color: #334155;
        }
        .dropdown-action-item:hover {
          background-color: #f1f5f9;
          color: #1e293b;
        }
        .dropdown-action-item-danger:hover {
          background-color: #fef2f2;
          color: #dc2626;
        }
        .btn-sidebar-settings:hover, .btn-sidebar-logout:hover {
          background-color: #e2e8f0;
          color: #334155;
        }
        .sidebar-group-header:hover, .sidebar-nav-item:hover {
          background-color: #f8fafc;
        }
        /* Custom thin scrollbar */
        .sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 4px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }

        /* Mobile Responsive Sidebar */
        @media (max-width: 767px) {
          .sidebar-root {
            position: fixed !important;
            left: 0;
            top: 0;
            width: 280px !important;
            transform: translateX(-100%);
            box-shadow: none;
          }
          .sidebar-root.sidebar-mobile-open {
            transform: translateX(0);
            box-shadow: 8px 0 30px rgba(0,0,0,0.12);
          }
        }
      `}</style>
    </aside>

    {/* Inbox Modal triggered from sidebar */}
    {showInboxModal && (
      <InboxNotificationModal
        userEmail={userEmail}
        boards={boards.map((b) => ({ id: b.id, name: b.name }))}
        onClose={() => setShowInboxModal(false)}
      />
    )}
    </>
  );
}
