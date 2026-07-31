"use client";

import { useState } from "react";
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

interface InboxProps {
  userEmail: string;
  onClose: () => void;
}

export function InboxNotificationModal({ userEmail, onClose }: InboxProps) {
  const router = useRouter();

  // Initial mock notifications tailored to user context
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "1",
      type: "invite",
      title: "Undangan Kolaborasi Tim",
      message: "mengundang Anda sebagai Editor ke papan proyek ini.",
      sender: "bintangwcproger@gmail.com",
      boardName: "Peluncuran Produk / App",
      boardId: "peluncuran-app",
      role: "Editor",
      timestamp: "10 menit yang lalu",
      isRead: false,
    },
    {
      id: "2",
      type: "activity",
      title: "Papan Baru Dibuat",
      message: "Template 'Persiapan Seminar & Skripsi' berhasil ditambahkan ke Ruang Kerja Anda.",
      boardName: "Persiapan Seminar & Skripsi",
      timestamp: "1 jam yang lalu",
      isRead: false,
    },
    {
      id: "3",
      type: "system",
      title: "Selamat Datang di Kanvexa AI!",
      message: "Workspace kolaboratif Anda siap digunakan. Manfaatkan fitur Urai dengan AI untuk memecah proyek secara otomatis.",
      timestamp: "Baru saja",
      isRead: true,
    },
  ]);

  const [activeTab, setActiveTab] = useState<"all" | "invites">("all");

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const deleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleAcceptInvite = (notif: NotificationItem, e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead(notif.id);
    if (notif.boardId) {
      onClose();
      router.push(`/board/${notif.boardId}`);
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
