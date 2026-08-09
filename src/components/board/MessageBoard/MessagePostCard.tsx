"use client";

import { useState } from "react";
import { Pin, Trash2, ChevronDown, ChevronUp, Paperclip, Download } from "lucide-react";
import { BoardPost, BoardPostComment, getCategoryBadge, formatTimeAgo, getAuthorInitials, formatFileSize } from "./messageboard-utils";
import { deletePost, togglePinPost } from "@/app/board/[id]/actions";
import { showConfirm, showAlert } from "@/lib/swal";
import PostCommentsThread from "./PostCommentsThread";

interface Props {
  boardId: string;
  post: BoardPost;
  comments: BoardPostComment[];
  canEdit: boolean;
  userEmail: string;
}

export default function MessagePostCard({
  boardId,
  post,
  comments,
  canEdit,
  userEmail,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pinning, setPinning] = useState(false);

  const badge = getCategoryBadge(post.category);
  const isMyPost = post.author_email === userEmail;

  async function handleDelete() {
    showConfirm(
      "Hapus Postingan?",
      "Apakah Anda yakin ingin menghapus postingan ini?",
      "Hapus",
      "Batal"
    ).then(async (result) => {
      if (result.isConfirmed) {
        setDeleting(true);
        try {
          await deletePost(boardId, post.id);
          showAlert("Sukses", "Postingan berhasil dihapus.", "success");
        } catch (err) {
          console.error(err);
          showAlert("Gagal", "Gagal menghapus postingan.", "error");
          setDeleting(false);
        }
      }
    });
  }

  async function handleTogglePin() {
    setPinning(true);
    try {
      await togglePinPost(boardId, post.id, !post.is_pinned);
    } catch (err) {
      console.error(err);
      alert("Gagal mengubah status pin.");
    } finally {
      setPinning(false);
    }
  }

  return (
    <div
      style={{
        background: post.is_pinned
          ? "linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)"
          : "linear-gradient(135deg, #ffffff 0%, #faf5ff 50%, #f3e8ff 100%)",
        borderRadius: 16,
        padding: "18px 22px",
        border: post.is_pinned ? "2px solid #a855f7" : "1.5px solid #d8b4fe",
        boxShadow: post.is_pinned
          ? "0 6px 20px rgba(168, 85, 247, 0.2)"
          : "0 4px 14px rgba(147, 51, 234, 0.08)",
        transition: "all 0.15s ease",
      }}
    >
      {/* Top Meta Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {(() => {
            const CategoryIcon = badge.icon;
            return (
              <span
                style={{
                  padding: "3px 9px",
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  background: badge.bg,
                  color: badge.color,
                  border: `1px solid ${badge.border}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <CategoryIcon width={12} height={12} />
                <span>{badge.label}</span>
              </span>
            );
          })()}

          {post.is_pinned && (
            <span
              style={{
                padding: "3px 8px",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 700,
                background: "rgba(124, 58, 237, 0.12)",
                color: "#7c3aed",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Pin width={11} height={11} />
              Disematkan
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {canEdit && (
            <button
              onClick={handleTogglePin}
              disabled={pinning}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                borderRadius: 6,
                color: post.is_pinned ? "#7c3aed" : "#94a3b8",
                display: "flex",
                alignItems: "center",
              }}
              title={post.is_pinned ? "Lepas Pin" : "Sematkan di Atas"}
            >
              <Pin width={14} height={14} />
            </button>
          )}

          {(canEdit || isMyPost) && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                borderRadius: 6,
                color: "#94a3b8",
                display: "flex",
                alignItems: "center",
              }}
              title="Hapus Postingan"
            >
              <Trash2 width={14} height={14} />
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 8px 0", lineHeight: 1.35 }}>
        {post.title}
      </h3>

      {/* Author & Date info */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "#6d28d9",
            color: "#fff",
            fontSize: 9,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {getAuthorInitials(post.author_email)}
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>
          {post.author_email.split("@")[0]}
        </span>
        <span style={{ fontSize: 12, color: "#cbd5e1" }}>•</span>
        <span style={{ fontSize: 12, color: "#94a3b8" }}>{formatTimeAgo(post.created_at)}</span>
      </div>

      {/* Content */}
      <div
        style={{
          fontSize: 14,
          color: "#334155",
          lineHeight: 1.55,
          whiteSpace: "pre-wrap",
          marginBottom: (post.file_name || post.file_url) ? 12 : 12,
        }}
      >
        {post.content}
      </div>

      {/* File Attachment Card */}
      {(post.file_name || post.file_url) && (
        <div
          style={{
            marginBottom: 14,
            padding: "10px 14px",
            borderRadius: 10,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: "rgba(109, 40, 217, 0.1)",
                color: "#6d28d9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Paperclip width={16} height={16} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                {post.file_name || "Lampiran File"}
              </div>
              <div style={{ fontSize: 11, color: "#64748b" }}>
                {formatFileSize(post.file_size)}
              </div>
            </div>
          </div>

          <a
            href={post.file_url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            download={post.file_name || "lampiran"}
            onClick={(e) => {
              if (!post.file_url) {
                e.preventDefault();
                alert("Postingan lama ini dibuat sebelum fitur URL unduhan diaktifkan. Silakan buat postingan baru dengan lampiran file.");
              }
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              background: "var(--v)",
              color: "#ffffff",
              border: "none",
              textDecoration: "none",
              boxShadow: "0 2px 6px rgba(109, 40, 217, 0.25)",
              cursor: "pointer",
              flexShrink: 0,
              transition: "all 0.15s ease",
            }}
          >
            <Download width={14} height={14} />
            <span>Unduh File</span>
          </a>
        </div>
      )}

      {/* Toggle comments button */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          background: "none",
          border: "none",
          padding: "4px 0",
          fontSize: 12,
          fontWeight: 600,
          color: "var(--v)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <span>{expanded ? "Sembunyikan Balasan" : `Lihat Balasan (${comments.length})`}</span>
        {expanded ? <ChevronUp width={14} height={14} /> : <ChevronDown width={14} height={14} />}
      </button>

      {/* Comments section */}
      {expanded && (
        <PostCommentsThread
          boardId={boardId}
          postId={post.id}
          comments={comments}
          canEdit={canEdit}
          userEmail={userEmail}
        />
      )}
    </div>
  );
}
