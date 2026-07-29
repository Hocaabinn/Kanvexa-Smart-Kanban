"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, CheckSquare, Plus, ArrowRight, AlertCircle } from "lucide-react";
import { BoardPost, BoardPostComment } from "./messageboard-utils";
import { insertTasksFromDiscussion } from "@/app/board/[id]/actions";

interface Props {
  boardId: string;
  posts: BoardPost[];
  comments: BoardPostComment[];
  columns: { id: string; name: string }[];
  onClose: () => void;
  onDone: () => void;
}

interface ExtractedTask {
  id: string;
  title: string;
  description: string;
  columnId: string;
  selected: boolean;
}

export default function AIDiscussionToTasksModal({ boardId, posts, comments, columns, onClose, onDone }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [extractedTasks, setExtractedTasks] = useState<ExtractedTask[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function extractTasks() {
      if (posts.length === 0) {
        setError("Belum ada diskusi di Message Board yang bisa diubah menjadi tugas.");
        setLoading(false);
        return;
      }

      if (columns.length === 0) {
        setError("Board ini belum memiliki kolom Kanban. Silakan buat kolom terlebih dahulu.");
        setLoading(false);
        return;
      }

      // Format all posts and comments into text
      const formatted = posts
        .map((p) => {
          const postComments = comments.filter((c) => c.post_id === p.id);
          const commentsFormatted = postComments.length
            ? postComments.map((c) => `  - Komentar: ${c.content}`).join("\n")
            : "";
          return `Post: "${p.title}"\n${p.content}\n${commentsFormatted}`;
        })
        .join("\n\n");

      try {
        const res = await fetch("/API/ai-discussion-to-tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            postsContent: formatted,
            columns: columns.map((c) => ({ id: c.id, name: c.name })),
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData?.error || "Gagal mengurai tugas dari diskusi.");
        }

        const data = await res.json();
        if (!data.tasks || !Array.isArray(data.tasks)) {
          throw new Error("Format respon AI tidak sesuai.");
        }

        const fallbackColId = columns[0].id;

        const tasksWithState: ExtractedTask[] = data.tasks.map((t: any, idx: number) => ({
          id: `task-${idx}-${Date.now()}`,
          title: t.title || "Tugas Tanpa Judul",
          description: t.description || "",
          columnId: columns.some((c) => c.id === t.suggestedColumnId) ? t.suggestedColumnId : fallbackColId,
          selected: true,
        }));

        setExtractedTasks(tasksWithState);
      } catch (err: any) {
        console.error(err);
        setError(err?.message || "Terjadi kesalahan saat menghubungi AI.");
      } finally {
        setLoading(false);
      }
    }

    extractTasks();
  }, [posts, comments, columns]);

  function toggleSelectTask(id: string) {
    setExtractedTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, selected: !t.selected } : t))
    );
  }

  function updateTaskColumn(id: string, colId: string) {
    setExtractedTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, columnId: colId } : t))
    );
  }

  function updateTaskTitle(id: string, title: string) {
    setExtractedTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title } : t))
    );
  }

  async function handleApplyTasks() {
    const selected = extractedTasks.filter((t) => t.selected);
    if (selected.length === 0) return;

    setSubmitting(true);
    try {
      await insertTasksFromDiscussion(
        boardId,
        selected.map((t) => ({
          title: t.title,
          description: t.description,
          columnId: t.columnId,
        }))
      );
      onDone();
    } catch (err) {
      console.error("Gagal menyimpan tugas ke board:", err);
      alert("Gagal menambahkan tugas ke board.");
      setSubmitting(false);
    }
  }

  const selectedCount = extractedTasks.filter((t) => t.selected).length;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(15, 23, 42, 0.55)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 16,
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: 20,
          width: "100%",
          maxWidth: 640,
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(16, 185, 129, 0.25)",
          border: "1.5px solid rgba(16, 185, 129, 0.3)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 24px",
            background: "linear-gradient(135deg, #059669, #047857)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: "rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles width={18} height={18} />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Ekstrak Diskusi Jadi Tugas</h2>
              <p style={{ fontSize: 12, margin: 0, opacity: 0.85 }}>
                Mengubah poin diskusi menjadi kartu tugas di Kanban Board
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "none",
              cursor: "pointer",
              color: "#fff",
              borderRadius: "50%",
              width: 30,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X width={16} height={16} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: 24, overflowY: "auto", flex: 1 }}>
          {loading ? (
            <div style={{ padding: "40px 0", textAlign: "center" }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  margin: "0 auto 16px",
                  borderRadius: "50%",
                  border: "4px solid rgba(16, 185, 129, 0.15)",
                  borderTopColor: "#10b981",
                  animation: "spin 1s linear infinite",
                }}
              />
              <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>
                AI sedang mengekstrak tugas...
              </h3>
              <p style={{ fontSize: 13, color: "#64748b" }}>
                Memilah poin tindakan dan memasukkannya ke rekomendasi kolom Kanban.
              </p>
            </div>
          ) : error ? (
            <div
              style={{
                padding: 16,
                borderRadius: 12,
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#991b1b",
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <AlertCircle width={16} height={16} />
              <span>{error}</span>
            </div>
          ) : extractedTasks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "#64748b", fontSize: 14 }}>
              Tidak ada tugas yang terdeteksi dari diskusi.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontSize: 13, color: "#475569", fontWeight: 600 }}>
                Pilih dan sesuaikan tugas yang ingin dimasukkan ke board:
              </div>

              {extractedTasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    background: task.selected ? "#f0fdf4" : "#f8fafc",
                    borderRadius: 12,
                    padding: 14,
                    border: task.selected ? "1.5px solid #86efac" : "1px solid var(--border)",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                    <input
                      type="checkbox"
                      checked={task.selected}
                      onChange={() => toggleSelectTask(task.id)}
                      style={{ marginTop: 3, cursor: "pointer", width: 16, height: 16 }}
                    />
                    <input
                      type="text"
                      value={task.title}
                      onChange={(e) => updateTaskTitle(task.id, e.target.value)}
                      disabled={!task.selected}
                      style={{
                        flex: 1,
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#0f172a",
                        border: "1px solid transparent",
                        background: "transparent",
                        padding: "2px 4px",
                        borderRadius: 4,
                        outline: "none",
                      }}
                    />
                  </div>

                  {task.description && (
                    <div style={{ fontSize: 12, color: "#64748b", marginLeft: 26, marginBottom: 10 }}>
                      {task.description}
                    </div>
                  )}

                  {/* Target Column selector */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 26 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                      Masuk ke Kolom <ArrowRight width={12} height={12} />
                    </span>
                    <select
                      value={task.columnId}
                      onChange={(e) => updateTaskColumn(task.id, e.target.value)}
                      disabled={!task.selected}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        border: "1px solid var(--border)",
                        fontSize: 12,
                        fontWeight: 600,
                        background: "#ffffff",
                        color: "#1e293b",
                        outline: "none",
                        cursor: "pointer",
                      }}
                    >
                      {columns.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!loading && extractedTasks.length > 0 && (
          <div
            style={{
              padding: "14px 24px",
              borderTop: "1px solid var(--border)",
              background: "#f8fafc",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>
              {selectedCount} dari {extractedTasks.length} tugas dipilih
            </span>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  background: "#e2e8f0",
                  color: "#475569",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleApplyTasks}
                disabled={submitting || selectedCount === 0}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 18px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  background: "#059669",
                  color: "#fff",
                  border: "none",
                  cursor: submitting || selectedCount === 0 ? "not-allowed" : "pointer",
                  opacity: submitting || selectedCount === 0 ? 0.6 : 1,
                  boxShadow: "0 2px 8px rgba(5, 150, 105, 0.3)",
                }}
              >
                <Plus width={14} height={14} />
                {submitting ? "Menambahkan..." : `Tambahkan (${selectedCount}) Tugas ke Board`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
