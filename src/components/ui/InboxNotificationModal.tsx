"use client";

import { useState, useEffect } from "react";
import { 
  Bell, 
  X, 
  Check, 
  UserPlus, 
  FolderKanban, 
  Sparkles, 
  CheckCheck, 
  ChevronRight,
  Clock,
  Trash2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { acceptBoardInvitation, rejectBoardInvitation } from "@/app/dashboard/actions";
import { showAlert } from "@/lib/swal";

export interface NotificationItem {
  id: string;
  type: "invite" | "activity" | "system";
  title: string;
  message: string;
  sender?: string;
  boardId?: string;
  boardName?: string;
  role?: string;
  timestamp: string;
  isRead: boolean;
}

interface DatabaseInvitation {
  id: string;
  board_id: string;
  board_name: string;
  invited_email: string;
  invited_by_email: string;
  role: string;
  created_at: string;
}

interface InboxProps {
  userEmail: string;
  boards?: { id: string; name: string }[];
  databaseInvitations?: DatabaseInvitation[];
  onClose: () => void;
}

function formatInviteTime(dateStr: string) {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} hari yang lalu`;
  } catch (e) {
    return "Baru saja";
  }
}

export function InboxNotificationModal({ userEmail, boards = [], databaseInvitations = [], onClose }: InboxProps) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [dbInvitations, setDbInvitations] = useState<DatabaseInvitation[]>(databaseInvitations);

  // Fetch pending invitations dynamically
  useEffect(() => {
    async function fetchInvitations() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !user.email) return;

        const { data: invitations, error } = await supabase
          .from("board_invitations")
          .select("*")
          .eq("status", "pending");

        if (error) {
          console.error("Gagal mengambil undangan di modal:", error.message);
        } else if (invitations) {
          const userEmailLower = user.email.toLowerCase();
          const filtered = invitations.filter(
            inv => inv.invited_email.toLowerCase() === userEmailLower
          );
          setDbInvitations(filtered);
        }
      } catch (e) {
        console.error("Error fetching invitations in modal:", e);
      }
    }

    fetchInvitations();
  }, [userEmail]);

  // Convert database invitations to notification items
  const dbNotifications = dbInvitations.map(inv => ({
    id: inv.id,
    type: "invite" as const,
    title: "Undangan Kolaborasi Tim",
    message: `mengundang Anda sebagai ${inv.role === "admin" ? "Admin" : inv.role === "viewer" ? "Pengamat" : "Editor"} ke papan "${inv.board_name}".`,
    sender: inv.invited_by_email,
    boardName: inv.board_name,
    boardId: inv.board_id,
    role: inv.role,
    timestamp: formatInviteTime(inv.created_at),
    isRead: false,
  }));

  // Initial notifications: merge database invitations with non-invite mock notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const systemNotifications = [
      {
        id: "mock-activity",
        type: "activity" as const,
        title: "Papan Baru Dibuat",
        message: "Template 'Persiapan Seminar & Skripsi' berhasil ditambahkan ke Ruang Kerja Anda.",
        boardName: "Persiapan Seminar & Skripsi",
        timestamp: "1 jam yang lalu",
        isRead: false,
      },
      {
        id: "mock-system",
        type: "system" as const,
        title: "Selamat Datang di Kanvexa AI!",
        message: "Workspace kolaboratif Anda siap digunakan. Manfaatkan fitur Urai dengan AI untuk memecah proyek secara otomatis.",
        timestamp: "Baru saja",
        isRead: true,
      },
    ];

    const hasRealInvites = dbNotifications.length > 0;
    const shouldAddDemoInvite = !hasRealInvites && userEmail.toLowerCase() === "binnkoseiji@gmail.com";

    const demoInvite = shouldAddDemoInvite ? [{
      id: "demo-invite-1",
      type: "invite" as const,
      title: "Undangan Kolaborasi Tim",
      message: `mengundang Anda sebagai Editor ke papan "Manajemen Rapat Organisasi / OSIS".`,
      sender: "bintangwcproger@gmail.com",
      boardName: "Manajemen Rapat Organisasi / OSIS",
      boardId: boards[0]?.id || "",
      role: "member",
      timestamp: "10 menit yang lalu",
      isRead: false,
    }] : [];

    let allNotifs = [...dbNotifications, ...demoInvite, ...systemNotifications];

    if (typeof window !== "undefined") {
      try {
        const readStored = localStorage.getItem("read_notifications");
        if (readStored) {
          const readIds = JSON.parse(readStored);
          allNotifs = allNotifs.map(n => readIds.includes(n.id) ? { ...n, isRead: true } : n);
        }

        const stored = localStorage.getItem("dismissed_notifications");
        if (stored) {
          const dismissedIds = JSON.parse(stored);
          setNotifications(allNotifs.filter(n => !dismissedIds.includes(n.id)));
          return;
        }
      } catch (e) {}
    }

    setNotifications(allNotifs);
  }, [dbInvitations, userEmail, boards]);

  const [activeTab, setActiveTab] = useState<"all" | "invites">("all");

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, isRead: true }));
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("read_notifications");
          const readIds = stored ? JSON.parse(stored) : [];
          const allIds = updated.map(n => n.id);
          const newReadIds = Array.from(new Set([...readIds, ...allIds]));
          localStorage.setItem("read_notifications", JSON.stringify(newReadIds));
        } catch (e) {}
      }
      return updated;
    });
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("read_notifications");
          const readIds = stored ? JSON.parse(stored) : [];
          if (!readIds.includes(id)) {
            localStorage.setItem("read_notifications", JSON.stringify([...readIds, id]));
          }
        } catch (e) {}
      }
      return updated;
    });
  };

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Add to dismissed in localStorage
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("dismissed_notifications");
        const dismissed = stored ? JSON.parse(stored) : [];
        if (!dismissed.includes(id)) {
          localStorage.setItem("dismissed_notifications", JSON.stringify([...dismissed, id]));
        }
      } catch (e) {}
    }

    if (id.startsWith("demo-invite-") || id.startsWith("mock-")) {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      return;
    }

    try {
      await rejectBoardInvitation(id);
      setDbInvitations((prev) => prev.filter((inv) => inv.id !== id));
    } catch (err: any) {
      showAlert("Gagal", "Gagal menolak undangan: " + err.message, "error");
    }
  };

  const handleAcceptInvite = async (notif: NotificationItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (processingId) return;

    // Add to dismissed and read in localStorage so it doesn't show up again
    if (typeof window !== "undefined") {
      try {
        const dismissedStored = localStorage.getItem("dismissed_notifications");
        const dismissed = dismissedStored ? JSON.parse(dismissedStored) : [];
        if (!dismissed.includes(notif.id)) {
          localStorage.setItem("dismissed_notifications", JSON.stringify([...dismissed, notif.id]));
        }
        
        const readStored = localStorage.getItem("read_notifications");
        const readIds = readStored ? JSON.parse(readStored) : [];
        if (!readIds.includes(notif.id)) {
          localStorage.setItem("read_notifications", JSON.stringify([...readIds, notif.id]));
        }
      } catch (e) {}
    }

    if (notif.id.startsWith("demo-invite-") || notif.id.startsWith("mock-")) {
      markAsRead(notif.id);
      onClose();
      if (notif.boardId) {
        router.push(`/board/${notif.boardId}`);
      } else if (boards.length > 0) {
        router.push(`/board/${boards[0].id}`);
      } else {
        router.push(`/dashboard`);
      }
      return;
    }

    setProcessingId(notif.id);
    try {
      const boardId = await acceptBoardInvitation(notif.id);
      setDbInvitations((prev) => prev.filter((inv) => inv.id !== notif.id));
      onClose();
      router.push(`/board/${boardId}`);
    } catch (err: any) {
      showAlert("Gagal", "Gagal menerima undangan: " + err.message, "error");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "invites") return n.type === "invite";
    return true;
  });

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#ffffff",
          borderRadius: 20,
          width: "100%",
          maxWidth: 480,
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 20px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(135deg, #faf5ff 0%, #ffffff 100%)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "rgba(109, 40, 217, 0.1)",
                color: "#6d28d9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <Bell width={18} height={18} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -2,
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#ef4444",
                    border: "2px solid #ffffff",
                  }}
                />
              )}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                  Kotak Masuk & Notifikasi
                </h3>
                {unreadCount > 0 && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      background: "rgba(109, 40, 217, 0.12)",
                      color: "#6d28d9",
                      padding: "2px 7px",
                      borderRadius: 10,
                    }}
                  >
                    {unreadCount} baru
                  </span>
                )}
              </div>
              <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>
                Undangan kolaborasi dan pembaruan aktivitas proyek Anda.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#94a3b8",
              padding: 4,
              borderRadius: 6,
            }}
          >
            <X width={18} height={18} />
          </button>
        </div>

        {/* Tab & Action Bar */}
        <div
          style={{
            padding: "10px 16px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#f8fafc",
          }}
        >
          <div style={{ display: "flex", gap: 4 }}>
            <button
              onClick={() => setActiveTab("all")}
              style={{
                padding: "5px 12px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                border: "none",
                background: activeTab === "all" ? "#ffffff" : "transparent",
                color: activeTab === "all" ? "#6d28d9" : "#64748b",
                boxShadow: activeTab === "all" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                cursor: "pointer",
              }}
            >
              Semua
            </button>
            <button
              onClick={() => setActiveTab("invites")}
              style={{
                padding: "5px 12px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                border: "none",
                background: activeTab === "invites" ? "#ffffff" : "transparent",
                color: activeTab === "invites" ? "#6d28d9" : "#64748b",
                boxShadow: activeTab === "invites" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span>Undangan Tim</span>
              {notifications.some((n) => n.type === "invite" && !n.isRead) && (
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#6d28d9",
                  }}
                />
              )}
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                background: "none",
                border: "none",
                fontSize: 11,
                fontWeight: 700,
                color: "#6d28d9",
                cursor: "pointer",
              }}
            >
              <CheckCheck width={13} height={13} />
              <span>Tandai Semua Dibaca</span>
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {filteredNotifications.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8" }}>
              <Bell width={32} height={32} style={{ margin: "0 auto 8px", opacity: 0.4 }} />
              <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>Tidak ada notifikasi</p>
              <p style={{ fontSize: 11, margin: "4px 0 0" }}>Kotak masuk Anda bersih dan teratur.</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markAsRead(notif.id)}
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  background: notif.isRead ? "#ffffff" : "rgba(245, 243, 255, 0.6)",
                  border: `1px solid ${notif.isRead ? "#e2e8f0" : "rgba(109, 40, 217, 0.2)"}`,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  position: "relative",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  {/* Icon Badge */}
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background:
                        notif.type === "invite"
                          ? "#f5f3ff"
                          : notif.type === "activity"
                          ? "#eef2ff"
                          : "#ecfeff",
                      color:
                        notif.type === "invite"
                          ? "#7c3aed"
                          : notif.type === "activity"
                          ? "#4f46e5"
                          : "#0891b2",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {notif.type === "invite" ? (
                      <UserPlus width={16} height={16} />
                    ) : notif.type === "activity" ? (
                      <FolderKanban width={16} height={16} />
                    ) : (
                      <Sparkles width={16} height={16} />
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                        {notif.title}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 10, color: "#94a3b8" }}>{notif.timestamp}</span>
                        <button
                          onClick={(e) => deleteNotification(notif.id, e)}
                          title="Hapus"
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#cbd5e1",
                            padding: 2,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#cbd5e1")}
                        >
                          <Trash2 width={12} height={12} />
                        </button>
                      </div>
                    </div>

                    <p style={{ fontSize: 12, color: "#475569", margin: "4px 0 0", lineHeight: 1.45 }}>
                      {notif.sender && (
                        <strong style={{ color: "#6d28d9" }}>{notif.sender} </strong>
                      )}
                      {notif.message}
                    </p>

                    {/* Interactive Action for Invitations */}
                    {notif.type === "invite" && (
                      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                        <button
                          onClick={(e) => handleAcceptInvite(notif, e)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "6px 12px",
                            borderRadius: 8,
                            fontSize: 11,
                            fontWeight: 700,
                            background: "#6d28d9",
                            color: "#ffffff",
                            border: "none",
                            cursor: "pointer",
                            boxShadow: "0 2px 6px rgba(109, 40, 217, 0.2)",
                          }}
                        >
                          <Check width={13} height={13} />
                          <span>Terima & Buka Board</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
