"use client";

import { useState } from "react";
import { Send, Trash2, MessageSquare } from "lucide-react";
import { BoardPostComment, formatTimeAgo, getAuthorInitials } from "./messageboard-utils";
import { createComment, deleteComment } from "@/app/board/[id]/actions";
import { showConfirm, showAlert } from "@/lib/swal";

interface Props {
  boardId: string;
  postId: string;
  comments: BoardPostComment[];
  canEdit: boolean;
  userEmail: string;
}

export default function PostCommentsThread({ boardId, postId, comments, canEdit, userEmail }: Props) {
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newComment.trim();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      await createComment(boardId, postId, trimmed);
      setNewComment("");
    } catch (err) {
      console.error("Gagal menambahkan komentar:", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteComment(commentId: string) {
    showConfirm(
      "Hapus Komentar?",
      "Hapus komentar ini?",
      "Hapus",
      "Batal"
    ).then(async (result) => {
      if (result.isConfirmed) {
        setDeletingId(commentId);
        try {
          await deleteComment(boardId, commentId);
          showAlert("Sukses", "Komentar berhasil dihapus.", "success");
        } catch (err) {
          console.error("Gagal menghapus komentar:", err);
          showAlert("Gagal", "Gagal menghapus komentar.", "error");
        } finally {
          setDeletingId(null);
        }
      }
    });
  }

  return (
    <div style={{ marginTop: 16, borderTop: "1px solid rgba(226, 232, 240, 0.7)", paddingTop: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, color: "#64748b", fontSize: 13, fontWeight: 600 }}>
        <MessageSquare width={14} height={14} />
        <span>Komentar ({comments.length})</span>
      </div>

      {/* List Komentar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
        {comments.length === 0 ? (
          <div style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>
            Belum ada komentar. Jadilah yang pertama memberikan respon!
          </div>
        ) : (
          comments.map((comment) => {
            const isMyComment = comment.author_email === userEmail;
            return (
              <div
                key={comment.id}
                style={{
                  display: "flex",
                  gap: 10,
                  background: "rgba(248, 250, 252, 0.8)",
                  borderRadius: 10,
                  padding: "10px 12px",
                  border: "1px solid rgba(226, 232, 240, 0.6)",
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #6d28d9, #4c1d95)",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {getAuthorInitials(comment.author_email)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}>
                      {comment.author_email.split("@")[0]}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>
                        {formatTimeAgo(comment.created_at)}
                      </span>
                      {(canEdit || isMyComment) && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={deletingId === comment.id}
                          style={{
                            background: "none",
                            border: "none",
                            padding: 2,
                            cursor: "pointer",
                            color: "#94a3b8",
                            display: "flex",
                            alignItems: "center",
                            opacity: deletingId === comment.id ? 0.5 : 1,
                          }}
                          title="Hapus Komentar"
                        >
                          <Trash2 width={12} height={12} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: "#334155", whiteSpace: "pre-wrap", lineHeight: 1.4 }}>
                    {comment.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Komentar Baru */}
      {canEdit && (
        <form onSubmit={handleAddComment} style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            placeholder="Tulis balasan atau komentar..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={submitting}
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              fontSize: 13,
              outline: "none",
              background: "#ffffff",
            }}
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              background: "var(--v)",
              color: "#fff",
              border: "none",
              cursor: submitting || !newComment.trim() ? "not-allowed" : "pointer",
              opacity: submitting || !newComment.trim() ? 0.6 : 1,
            }}
          >
            <Send width={13} height={13} />
            Kirim
          </button>
        </form>
      )}
    </div>
  );
}
