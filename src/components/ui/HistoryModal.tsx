"use client";

import { useState, useMemo, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  History,
  Clock,
  X,
  FolderKanban,
  ArrowUpRight,
  Search,
  Calendar,
  CheckCircle2,
  Timer,
  BarChart2,
  Sparkles,
  FolderPlus,
  Trash2,
  Edit3,
  Plus,
  Mail,
  UserCheck,
  UserX,
  Activity,
  Layers,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

// ── Types ────────────────────────────────────────────────────────────────────

export interface BoardHistoryItem {
  id: string;
  name: string;
  created_at: string;
  owner_email?: string;
}

interface ActivityLog {
  id: string;
  user_id: string;
  board_id: string | null;
  board_name: string | null;
  event_type: string;
  metadata: Record<string, string>;
  created_at: string;
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  boards: BoardHistoryItem[];
  boardTimeTrackingMap?: Record<string, { formatted: string; taskCount: number; doneCount: number }>;
  totalTrackedTime?: string;
  onOpenBoard?: (boardName: string) => void;
}

type Tab = "all" | "boards";

// ── Event Config ─────────────────────────────────────────────────────────────

interface EventConfig {
  getLabel: (meta: Record<string, string>, boardName: string | null) => string;
  Icon: React.ElementType;
  color: string;
  bg: string;
}

const EVENT_CONFIG: Record<string, EventConfig> = {
  board_created: {
    getLabel: (_, boardName) => `Membuat papan baru "${boardName}"`,
    Icon: FolderPlus,
    color: "#4338ca",
    bg: "#e0e7ff",
  },
  board_deleted: {
    getLabel: (meta) => `Menghapus papan "${meta.old_board_name || "Papan"}"`,
    Icon: Trash2,
    color: "#dc2626",
    bg: "#fee2e2",
  },
  board_renamed: {
    getLabel: (meta) =>
      `Mengganti nama "${meta.old_name || "Papan"}" → "${meta.new_name}"`,
    Icon: Edit3,
    color: "#d97706",
    bg: "#fef3c7",
  },
  task_created: {
    getLabel: (meta, boardName) =>
      `Menambahkan tugas "${meta.task_title || "Tugas"}" di ${boardName ? `"${boardName}"` : "papan"}`,
    Icon: Plus,
    color: "#7c3aed",
    bg: "#ede9fe",
  },
  task_deleted: {
    getLabel: (meta) => `Menghapus tugas "${meta.task_title || "Tugas"}"`,
    Icon: Trash2,
    color: "#dc2626",
    bg: "#fee2e2",
  },
  task_moved: {
    getLabel: (meta) =>
      `Memindahkan "${meta.task_title || "Tugas"}" ke kolom "${meta.column_name || ""}"`,
    Icon: BarChart2,
    color: "#0284c7",
    bg: "#e0f2fe",
  },
  column_created: {
    getLabel: (meta, boardName) =>
      `Menambahkan kolom "${meta.column_name || "Kolom"}" di ${boardName ? `"${boardName}"` : "papan"}`,
    Icon: Layers,
    color: "#0891b2",
    bg: "#cffafe",
  },
  invitation_sent: {
    getLabel: (meta, boardName) =>
      `Mengundang "${meta.invited_email || "Pengguna"}" ke "${boardName || "papan"}"`,
    Icon: Mail,
    color: "#0ea5e9",
    bg: "#e0f2fe",
  },
  invitation_accepted: {
    getLabel: (_, boardName) =>
      `Bergabung ke papan "${boardName || "papan"}"`,
    Icon: UserCheck,
    color: "#16a34a",
    bg: "#dcfce7",
  },
  invitation_rejected: {
    getLabel: (_, boardName) =>
      `Menolak undangan ke papan "${boardName || "papan"}"`,
    Icon: UserX,
    color: "#dc2626",
    bg: "#fee2e2",
  },
};

const DEFAULT_EVENT: EventConfig = {
  getLabel: (_, boardName) => `Aktivitas di "${boardName || "papan"}"`,
  Icon: Activity,
  color: "#64748b",
  bg: "#f1f5f9",
};

// ── Date Grouping ────────────────────────────────────────────────────────────

interface LogGroup {
  label: string;
  logs: ActivityLog[];
}

function groupLogsByDate(logs: ActivityLog[]): LogGroup[] {
  const now = Date.now();
  const msDay = 86400000;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();

  const groups: LogGroup[] = [];
  const todayLogs = logs.filter((l) => new Date(l.created_at).getTime() >= todayMs);
  const yesterdayLogs = logs.filter((l) => {
    const t = new Date(l.created_at).getTime();
    return t >= todayMs - msDay && t < todayMs;
  });
  const weekLogs = logs.filter((l) => {
    const t = new Date(l.created_at).getTime();
    return t >= todayMs - 7 * msDay && t < todayMs - msDay;
  });
  const olderLogs = logs.filter((l) => new Date(l.created_at).getTime() < todayMs - 7 * msDay);

  if (todayLogs.length) groups.push({ label: "Hari Ini", logs: todayLogs });
  if (yesterdayLogs.length) groups.push({ label: "Kemarin", logs: yesterdayLogs });
  if (weekLogs.length) groups.push({ label: "Minggu Ini", logs: weekLogs });
  if (olderLogs.length) groups.push({ label: "Lebih Lama", logs: olderLogs });

  void now;
  return groups;
}

// ── Helper: relative time ─────────────────────────────────────────────────────

function formatTimeAgo(dateStr: string): string {
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diffMs / 60000);
    if (m < 1) return "Baru saja";
    if (m < 60) return `${m}m lalu`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}j lalu`;
    const d = Math.floor(h / 24);
    if (d === 1) return "Kemarin";
    if (d < 7) return `${d} hari lalu`;
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return "Baru";
  }
}

function formatFullDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}

// ── Main Component ────────────────────────────────────────────────────────────

export function HistoryModal({
  isOpen,
  onClose,
  boards,
  boardTimeTrackingMap = {},
  totalTrackedTime = "0j 0m",
  onOpenBoard,
}: HistoryModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Fetch activity logs when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    setHasError(false);
    const supabase = createClient();
    supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(150)
      .then(({ data, error }) => {
        if (error) {
          setHasError(true);
        } else {
          setActivityLogs(data || []);
        }
        setIsLoading(false);
      });
  }, [isOpen]);

  // Reload logs (refresh button)
  const reloadLogs = () => {
    if (isLoading) return;
    setIsLoading(true);
    setHasError(false);
    const supabase = createClient();
    supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(150)
      .then(({ data, error }) => {
        if (error) setHasError(true);
        else setActivityLogs(data || []);
        setIsLoading(false);
      });
  };

  // ESC key to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handler);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Filtered activity logs
  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return activityLogs;
    const q = searchQuery.toLowerCase();
    return activityLogs.filter((log) => {
      const conf = EVENT_CONFIG[log.event_type] || DEFAULT_EVENT;
      const label = conf.getLabel(log.metadata, log.board_name);
      return (
        label.toLowerCase().includes(q) ||
        (log.board_name || "").toLowerCase().includes(q) ||
        (log.event_type || "").toLowerCase().includes(q)
      );
    });
  }, [activityLogs, searchQuery]);

  // Grouped by date
  const groupedLogs = useMemo(() => groupLogsByDate(filteredLogs), [filteredLogs]);

  // Filtered boards
  const filteredBoards = useMemo(() => {
    const sorted = [...boards].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    if (!searchQuery.trim()) return sorted;
    return sorted.filter((b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [boards, searchQuery]);

  // Summary counts
  const totalTasks = useMemo(() => {
    return Object.values(boardTimeTrackingMap).reduce(
      (sum, v) => sum + (v.taskCount || 0),
      0
    );
  }, [boardTimeTrackingMap]);

  const totalDone = useMemo(() => {
    return Object.values(boardTimeTrackingMap).reduce(
      (sum, v) => sum + (v.doneCount || 0),
      0
    );
  }, [boardTimeTrackingMap]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(15, 23, 42, 0.72)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "820px",
          maxHeight: "90vh",
          background: "#ffffff",
          borderRadius: "24px",
          boxShadow:
            "0 32px 80px -16px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.06)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "histModalIn 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <div
          style={{
            padding: "22px 28px 18px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            background: "linear-gradient(180deg,#fff 0%,#fcfdfe 100%)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "14px",
                background: "linear-gradient(135deg,#ede9fe,#e0e7ff)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#4f46e5",
                boxShadow: "0 4px 14px rgba(99,102,241,0.2)",
                flexShrink: 0,
              }}
            >
              <History style={{ width: "23px", height: "23px" }} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <h2
                  style={{
                    fontSize: "18px",
                    fontWeight: "800",
                    color: "#0f172a",
                    margin: 0,
                    letterSpacing: "-0.01em",
                  }}
                >
                  Riwayat Aktivitas
                </h2>
                {activityLogs.length > 0 && (
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#4f46e5",
                      background: "#e0e7ff",
                      padding: "2px 8px",
                      borderRadius: "20px",
                    }}
                  >
                    {activityLogs.length} catatan
                  </span>
                )}
              </div>
              <p
                style={{
                  fontSize: "13px",
                  color: "#64748b",
                  margin: "3px 0 0",
                }}
              >
                Semua aktivitas, riwayat papan, dan time tracking proyek Anda.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            {/* Refresh button */}
            <button
              onClick={reloadLogs}
              title="Muat ulang riwayat"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                background: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748b",
                transition: "all 0.15s ease",
              }}
              className="hover:bg-slate-100 hover:text-indigo-600"
            >
              <RefreshCw
                style={{
                  width: "16px",
                  height: "16px",
                  animation: isLoading ? "spin 0.8s linear infinite" : "none",
                }}
              />
            </button>
            {/* Close button */}
            <button
              onClick={onClose}
              title="Tutup (Esc)"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                background: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748b",
                transition: "all 0.15s ease",
              }}
              className="hover:bg-slate-100 hover:text-slate-900"
            >
              <X style={{ width: "17px", height: "17px" }} />
            </button>
          </div>
        </div>

        {/* ── SUMMARY STATS ──────────────────────────────────────────────── */}
        <div
          style={{
            padding: "14px 28px",
            background: "#f8fafc",
            borderBottom: "1px solid #f1f5f9",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "10px",
          }}
        >
          <SummaryCard
            icon={Timer}
            iconColor="#6d28d9"
            iconBg="#ede9fe"
            label="Waktu Kerja"
            value={totalTrackedTime}
          />
          <SummaryCard
            icon={FolderKanban}
            iconColor="#4338ca"
            iconBg="#e0e7ff"
            label="Total Papan"
            value={`${boards.length}`}
          />
          <SummaryCard
            icon={CheckCircle2}
            iconColor="#16a34a"
            iconBg="#dcfce7"
            label="Tugas Selesai"
            value={`${totalDone}/${totalTasks}`}
          />
          <SummaryCard
            icon={Activity}
            iconColor="#0284c7"
            iconBg="#e0f2fe"
            label="Total Aktivitas"
            value={`${activityLogs.length}`}
          />
        </div>

        {/* ── TABS ───────────────────────────────────────────────────────── */}
        <div
          style={{
            padding: "0 28px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            gap: "0",
          }}
        >
          {(
            [
              { id: "all" as Tab, label: "Semua Aktivitas", Icon: Activity },
              { id: "boards" as Tab, label: "Riwayat Papan", Icon: FolderKanban },
            ] as const
          ).map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                padding: "13px 18px",
                fontSize: "13px",
                fontWeight: activeTab === id ? "700" : "500",
                color: activeTab === id ? "#4f46e5" : "#64748b",
                background: "transparent",
                border: "none",
                borderBottom:
                  activeTab === id ? "2.5px solid #4f46e5" : "2.5px solid transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "7px",
                transition: "all 0.15s ease",
                marginBottom: "-1px",
                whiteSpace: "nowrap",
              }}
              className="hover:text-indigo-500"
            >
              <Icon style={{ width: "15px", height: "15px" }} />
              {label}
              {id === "all" && activityLogs.length > 0 && (
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: "700",
                    color: activeTab === "all" ? "#4f46e5" : "#94a3b8",
                    background: activeTab === "all" ? "#e0e7ff" : "#f1f5f9",
                    padding: "1px 6px",
                    borderRadius: "20px",
                    minWidth: "20px",
                    textAlign: "center",
                  }}
                >
                  {activityLogs.length}
                </span>
              )}
              {id === "boards" && boards.length > 0 && (
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: "700",
                    color: activeTab === "boards" ? "#4f46e5" : "#94a3b8",
                    background: activeTab === "boards" ? "#e0e7ff" : "#f1f5f9",
                    padding: "1px 6px",
                    borderRadius: "20px",
                    minWidth: "20px",
                    textAlign: "center",
                  }}
                >
                  {boards.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── SEARCH BAR ─────────────────────────────────────────────────── */}
        <div
          style={{
            padding: "12px 28px",
            borderBottom: "1px solid #f1f5f9",
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Search
            style={{
              position: "absolute",
              left: "40px",
              width: "16px",
              height: "16px",
              color: "#94a3b8",
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            placeholder={
              activeTab === "all"
                ? "Cari aktivitas, papan, tugas..."
                : "Cari riwayat papan..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 36px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              fontSize: "13px",
              color: "#1e293b",
              outline: "none",
              background: "#f8fafc",
              transition: "all 0.2s ease",
            }}
            className="focus:bg-white focus:border-indigo-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{
                position: "absolute",
                right: "36px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#94a3b8",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X style={{ width: "14px", height: "14px" }} />
            </button>
          )}
        </div>

        {/* ── CONTENT AREA ───────────────────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 28px",
            display: "flex",
            flexDirection: "column",
            gap: "0",
          }}
        >
          {/* ─ Tab: Semua Aktivitas ─ */}
          {activeTab === "all" && (
            <>
              {isLoading ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "56px 20px",
                    gap: "14px",
                    color: "#94a3b8",
                  }}
                >
                  <RefreshCw
                    style={{
                      width: "32px",
                      height: "32px",
                      animation: "spin 0.8s linear infinite",
                      color: "#a5b4fc",
                    }}
                  />
                  <span style={{ fontSize: "14px", fontWeight: "600" }}>
                    Memuat riwayat aktivitas...
                  </span>
                </div>
              ) : hasError ? (
                <div
                  style={{
                    padding: "48px 20px",
                    textAlign: "center",
                    background: "#fff5f5",
                    borderRadius: "16px",
                    border: "1px dashed #fca5a5",
                  }}
                >
                  <AlertCircle
                    style={{
                      width: "36px",
                      height: "36px",
                      color: "#f87171",
                      margin: "0 auto 12px",
                    }}
                  />
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: "700",
                      color: "#991b1b",
                      marginBottom: "4px",
                    }}
                  >
                    Tabel activity_logs belum dibuat
                  </div>
                  <div
                    style={{ fontSize: "13px", color: "#b91c1c", maxWidth: "380px", margin: "0 auto 16px" }}
                  >
                    Jalankan SQL migration di Supabase Dashboard untuk mengaktifkan pelacakan aktivitas.
                  </div>
                  <button
                    onClick={reloadLogs}
                    style={{
                      padding: "8px 20px",
                      borderRadius: "10px",
                      background: "#dc2626",
                      color: "#fff",
                      fontSize: "13px",
                      fontWeight: "700",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Coba Lagi
                  </button>
                </div>
              ) : groupedLogs.length === 0 ? (
                <div
                  style={{
                    padding: "56px 20px",
                    textAlign: "center",
                    background: "#f8fafc",
                    borderRadius: "16px",
                    border: "1px dashed #cbd5e1",
                  }}
                >
                  <Clock
                    style={{
                      width: "36px",
                      height: "36px",
                      color: "#94a3b8",
                      margin: "0 auto 12px",
                    }}
                  />
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: "700",
                      color: "#334155",
                      marginBottom: "4px",
                    }}
                  >
                    {searchQuery ? "Tidak ada aktivitas yang cocok" : "Belum ada riwayat aktivitas"}
                  </div>
                  <div style={{ fontSize: "13px", color: "#64748b" }}>
                    {searchQuery
                      ? "Coba kata kunci pencarian yang lain."
                      : "Mulai buat papan, tambah tugas, atau undang anggota untuk mencatat riwayat."}
                  </div>
                </div>
              ) : (
                groupedLogs.map((group) => (
                  <div key={group.label} style={{ marginBottom: "20px" }}>
                    {/* Group Label */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "10px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "800",
                          color: "#64748b",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {group.label}
                      </span>
                      <div
                        style={{ flex: 1, height: "1px", background: "#f1f5f9" }}
                      />
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "600",
                          color: "#94a3b8",
                        }}
                      >
                        {group.logs.length} aktivitas
                      </span>
                    </div>

                    {/* Activity Items */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      {group.logs.map((log) => {
                        const conf = EVENT_CONFIG[log.event_type] || DEFAULT_EVENT;
                        const IconComp = conf.Icon;
                        const label = conf.getLabel(log.metadata, log.board_name);
                        return (
                          <div
                            key={log.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              padding: "12px 14px",
                              borderRadius: "12px",
                              border: "1px solid #f1f5f9",
                              background: "#ffffff",
                              transition: "all 0.15s ease",
                            }}
                            className="hover:border-slate-200 hover:shadow-sm"
                          >
                            {/* Event Icon */}
                            <div
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "10px",
                                background: conf.bg,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: conf.color,
                                flexShrink: 0,
                              }}
                            >
                              <IconComp style={{ width: "17px", height: "17px" }} />
                            </div>

                            {/* Event Label */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: "13.5px",
                                  fontWeight: "600",
                                  color: "#0f172a",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {label}
                              </div>
                              {log.board_name &&
                                log.event_type !== "board_created" &&
                                log.event_type !== "board_deleted" &&
                                log.event_type !== "board_renamed" && (
                                  <div
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "4px",
                                      marginTop: "4px",
                                      fontSize: "11px",
                                      fontWeight: "600",
                                      color: "#4338ca",
                                      background: "#ede9fe",
                                      padding: "2px 8px",
                                      borderRadius: "6px",
                                    }}
                                  >
                                    <FolderKanban style={{ width: "10px", height: "10px" }} />
                                    {log.board_name}
                                  </div>
                                )}
                            </div>

                            {/* Time Ago */}
                            <span
                              style={{
                                fontSize: "11.5px",
                                fontWeight: "600",
                                color: "#94a3b8",
                                flexShrink: 0,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {formatTimeAgo(log.created_at)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* ─ Tab: Riwayat Papan ─ */}
          {activeTab === "boards" && (
            <>
              {filteredBoards.length === 0 ? (
                <div
                  style={{
                    padding: "56px 20px",
                    textAlign: "center",
                    background: "#f8fafc",
                    borderRadius: "16px",
                    border: "1px dashed #cbd5e1",
                  }}
                >
                  <FolderKanban
                    style={{
                      width: "36px",
                      height: "36px",
                      color: "#94a3b8",
                      margin: "0 auto 12px",
                    }}
                  />
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: "700",
                      color: "#334155",
                      marginBottom: "4px",
                    }}
                  >
                    {searchQuery ? "Tidak ada papan yang cocok" : "Belum ada papan"}
                  </div>
                  <div style={{ fontSize: "13px", color: "#64748b" }}>
                    {searchQuery
                      ? "Coba kata kunci pencarian yang lain."
                      : "Buat papan baru untuk memulai."}
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {filteredBoards.map((board) => {
                    const tracking = boardTimeTrackingMap[board.id];
                    const timeStr = tracking?.formatted || "—";
                    const taskCount = tracking?.taskCount || 0;
                    const doneCount = tracking?.doneCount || 0;
                    const progress =
                      taskCount > 0 ? Math.round((doneCount / taskCount) * 100) : 0;

                    return (
                      <div
                        key={board.id}
                        style={{
                          background: "#ffffff",
                          borderRadius: "16px",
                          border: "1px solid #e2e8f0",
                          padding: "16px 18px",
                          transition: "all 0.2s ease",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
                        }}
                        className="hover:border-indigo-300 hover:shadow-md"
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "14px",
                          }}
                        >
                          {/* Left */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "13px",
                              minWidth: 0,
                              flex: 1,
                            }}
                          >
                            <div
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "12px",
                                background:
                                  "linear-gradient(135deg,#ede9fe,#e0e7ff)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#6d28d9",
                                flexShrink: 0,
                              }}
                            >
                              <FolderKanban
                                style={{ width: "19px", height: "19px" }}
                              />
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div
                                style={{
                                  fontSize: "14px",
                                  fontWeight: "800",
                                  color: "#0f172a",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  marginBottom: "4px",
                                }}
                              >
                                {board.name}
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  fontSize: "12px",
                                  color: "#64748b",
                                  flexWrap: "wrap",
                                }}
                              >
                                <span
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                >
                                  <Calendar
                                    style={{
                                      width: "11px",
                                      height: "11px",
                                      color: "#94a3b8",
                                    }}
                                  />
                                  {formatFullDate(board.created_at)}
                                </span>
                                {taskCount > 0 && (
                                  <>
                                    <span style={{ color: "#cbd5e1" }}>•</span>
                                    <span
                                      style={{
                                        color: "#16a34a",
                                        fontWeight: "700",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "3px",
                                      }}
                                    >
                                      <CheckCircle2
                                        style={{
                                          width: "11px",
                                          height: "11px",
                                        }}
                                      />
                                      {doneCount}/{taskCount} tugas ({progress}%)
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right: badges + action */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              flexShrink: 0,
                            }}
                          >
                            {/* Time badge */}
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-end",
                                gap: "2px",
                              }}
                            >
                              <div
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  fontSize: "12.5px",
                                  fontWeight: "800",
                                  color: "#4338ca",
                                  background: "#e0e7ff",
                                  padding: "5px 10px",
                                  borderRadius: "8px",
                                }}
                              >
                                <Clock
                                  style={{ width: "12px", height: "12px", color: "#4f46e5" }}
                                />
                                {timeStr}
                              </div>
                              <span
                                style={{
                                  fontSize: "10px",
                                  fontWeight: "600",
                                  color: "#94a3b8",
                                }}
                              >
                                Waktu Terlacak
                              </span>
                            </div>

                            {/* Open board button */}
                            <Link
                              href={`/board/${board.id}`}
                              style={{ textDecoration: "none" }}
                              onClick={() => {
                                onClose();
                                if (onOpenBoard) onOpenBoard(board.name);
                              }}
                            >
                              <button
                                type="button"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  padding: "8px 14px",
                                  borderRadius: "10px",
                                  background: "#0f172a",
                                  color: "#fff",
                                  fontSize: "12.5px",
                                  fontWeight: "700",
                                  border: "none",
                                  cursor: "pointer",
                                  transition: "all 0.15s ease",
                                }}
                                className="hover:bg-indigo-600"
                              >
                                Buka
                                <ArrowUpRight
                                  style={{ width: "13px", height: "13px" }}
                                />
                              </button>
                            </Link>
                          </div>
                        </div>

                        {/* Progress bar */}
                        {taskCount > 0 && (
                          <div
                            style={{
                              marginTop: "12px",
                              height: "4px",
                              background: "#f1f5f9",
                              borderRadius: "4px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${progress}%`,
                                background:
                                  progress >= 80
                                    ? "linear-gradient(90deg,#16a34a,#22c55e)"
                                    : progress >= 40
                                    ? "linear-gradient(90deg,#4f46e5,#818cf8)"
                                    : "linear-gradient(90deg,#d97706,#fbbf24)",
                                borderRadius: "4px",
                                transition: "width 0.4s ease",
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── FOOTER ─────────────────────────────────────────────────────── */}
        <div
          style={{
            padding: "14px 28px",
            borderTop: "1px solid #f1f5f9",
            background: "#fcfdfe",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "12px",
            color: "#64748b",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Sparkles
              style={{ width: "13px", height: "13px", color: "#6366f1" }}
            />
            <span>
              Aktivitas direkam secara otomatis dari semua tindakan Anda.
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>
              Tekan <kbd style={{ padding: "2px 6px", background: "#f1f5f9", borderRadius: "4px", border: "1px solid #e2e8f0", fontSize: "10px", fontWeight: "600", color: "#64748b" }}>Esc</kbd>
            </span>
            <button
              onClick={onClose}
              style={{
                padding: "7px 18px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                background: "#fff",
                color: "#334155",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              className="hover:bg-slate-50"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes histModalIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(14px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ── SummaryCard subcomponent ──────────────────────────────────────────────────

function SummaryCard({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  value,
}: {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        padding: "11px 14px",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <div
        style={{
          width: "34px",
          height: "34px",
          borderRadius: "10px",
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: iconColor,
          flexShrink: 0,
        }}
      >
        <Icon style={{ width: "16px", height: "16px" }} />
      </div>
      <div>
        <div
          style={{
            fontSize: "10px",
            fontWeight: "600",
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: "16px",
            fontWeight: "800",
            color: "#0f172a",
            lineHeight: 1.2,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

export default HistoryModal;
