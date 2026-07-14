"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FolderKanban, 
  Plus, 
  LogOut, 
  Kanban,
  Star,
  Pin,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Trash2,
  Edit3
} from "lucide-react";

interface Board {
  id: string;
  name: string;
  created_at: string;
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
  onDeleteAction
}: SidebarProps) {
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);
  const [isFavoritesExpanded, setIsFavoritesExpanded] = useState(true);
  const [activeMenuBoardId, setActiveMenuBoardId] = useState<string | null>(null);

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
        <Link href={`/board/${b.id}`} style={{ textDecoration: "none" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 12px",
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
              <span>{isPinned ? "Lepas Pin" : "Pin Papan"}</span>
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

            {/* Divider */}
            <div style={{ borderTop: "1px solid #f1f5f9", margin: "4px 0" }} />

            {/* Delete Action */}
            <button
              onClick={(e) => { onDeleteAction(b.id, e); setActiveMenuBoardId(null); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 10px",
                fontSize: "12px",
                fontWeight: "700",
                color: "#dc2626",
                background: "none",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                textAlign: "left",
                transition: "background-color 0.15s"
              }}
              className="dropdown-action-delete"
            >
              <Trash2 style={{ width: "14px", height: "14px" }} />
              <span>Hapus Papan</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <aside style={{
      width: isSidebarCollapsed ? 78 : 270,
      height: "100vh",
      background: "#ffffff",
      borderRight: "1px solid #e2e8f0",
      display: "flex",
      flexDirection: "column",
      position: "sticky",
      top: 0,
      flexShrink: 0,
      zIndex: 50,
      transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      overflow: "visible" // Required to let 3-dots menus overlay correctly
    }}>
      {/* 1. Logo Section & Sidebar Collapse Toggle */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: isSidebarCollapsed ? "center" : "space-between", 
        padding: "24px 20px 16px" 
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "10px",
            background: "var(--v)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(109, 40, 217, 0.2)",
            flexShrink: 0
          }}>
            <Kanban style={{ width: "16px", height: "16px", color: "#fff" }} />
          </div>
          {!isSidebarCollapsed && (
            <span style={{ fontSize: "20px", fontWeight: "800", color: "var(--v)", letterSpacing: "-0.03em", whiteSpace: "nowrap" }}>
              Kanvexa
            </span>
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

      {/* 2. "Board Baru" Button */}
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

      {/* 3. Daftar Dropdowns (Scrollable) */}
      <div style={{ 
        flex: 1, 
        overflowY: "auto", 
        padding: "8px 12px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "16px"
      }} className="sidebar-scroll">

        {/* 3A. FAVORIT DROPDOWN SECTION (Only visible if there is at least one starred board) */}
        {starredBoards.length > 0 && (
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
                padding: "0 12px 10px",
                userSelect: "none"
              }}
              title={isSidebarCollapsed ? "Tampilkan Favorit" : "Tutup/Buka Favorit"}
            >
              {isSidebarCollapsed ? (
                <Star style={{ width: "18px", height: "18px", color: "#d97706", fill: "#d97706" }} />
              ) : (
                <>
                  <div style={{ 
                    fontSize: "10px", 
                    fontWeight: "800", 
                    color: "#d97706", 
                    letterSpacing: "0.06em", 
                    textTransform: "uppercase",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}>
                    <Star style={{ width: "10px", height: "10px", fill: "#d97706" }} /> Favorit
                  </div>
                  <ChevronDown style={{ 
                    width: "14px", 
                    height: "14px", 
                    color: "#d97706",
                    transform: isFavoritesExpanded ? "none" : "rotate(-90deg)",
                    transition: "transform 0.2s"
                  }} />
                </>
              )}
            </div>
            
            {(!isSidebarCollapsed && isFavoritesExpanded) && (
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {starredBoards.map(renderBoardItem)}
              </div>
            )}
          </div>
        )}
        
        {/* 3B. PROYEK DROPDOWN SECTION */}
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
              padding: "0 12px 10px",
              userSelect: "none"
            }}
            title={isSidebarCollapsed ? "Tampilkan Proyek" : "Tutup/Buka Proyek"}
          >
            {isSidebarCollapsed ? (
              <FolderKanban style={{ width: "18px", height: "18px", color: "#94a3b8" }} />
            ) : (
              <>
                <div style={{ 
                  fontSize: "10px", 
                  fontWeight: "800", 
                  color: "#94a3b8", 
                  letterSpacing: "0.06em", 
                  textTransform: "uppercase" 
                }}>
                  Proyek
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
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {!boards.length ? (
                <div style={{ padding: "12px", fontSize: "12px", color: "#94a3b8", textAlign: "center" }}>
                  Belum ada proyek
                </div>
              ) : (
                boards.map(renderBoardItem)
              )}
            </div>
          )}
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
          }}
          title={userEmail}
          >
            {initials(userEmail)}
          </div>
          {!isSidebarCollapsed && (
            <div style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <span style={{ 
                fontSize: "12px", 
                fontWeight: "700", 
                color: "#1e293b", 
                whiteSpace: "nowrap", 
                overflow: "hidden", 
                textOverflow: "ellipsis" 
              }}>
                {userEmail.split("@")[0]}
              </span>
              <span style={{ fontSize: "10px", color: "#64748b", fontWeight: "500" }}>Aktif</span>
            </div>
          )}
        </div>
        
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

      <style>{`
        .btn-toggle-sidebar:hover {
          background-color: #f1f5f9;
          color: #475569 !important;
        }
        .btn-sidebar-create:hover {
          background-color: #5b21b6 !important;
          box-shadow: 0 6px 16px rgba(109, 40, 217, 0.35) !important;
          transform: translateY(-1px);
        }
        .sidebar-item-container:hover .btn-item-more {
          opacity: 1 !important;
          visibility: visible !important;
        }
        .btn-item-more {
          opacity: 0;
          visibility: hidden;
        }
        .sidebar-board-item:hover {
          background-color: #f1f5f9;
        }
        .btn-item-more:hover {
          background-color: #e2e8f0;
          color: #334155 !important;
        }
        .dropdown-action-item:hover {
          background-color: #f1f5f9 !important;
          color: #1e293b !important;
        }
        .dropdown-action-delete:hover {
          background-color: #fef2f2 !important;
          color: #dc2626 !important;
        }
        .btn-sidebar-logout:hover {
          background-color: #fef2f2 !important;
          color: #dc2626 !important;
        }
        .sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
      `}</style>
    </aside>
  );
}
