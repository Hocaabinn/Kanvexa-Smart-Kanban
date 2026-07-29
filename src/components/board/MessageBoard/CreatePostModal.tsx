"use client";

import { useState } from "react";
import { X, Send, Pin, MessageSquare, Paperclip, FileText, Upload, AlertCircle } from "lucide-react";
import { PostCategory, getCategoryBadge, formatFileSize } from "./messageboard-utils";
import { createPost } from "@/app/board/[id]/actions";

interface Props {
  boardId: string;
  onClose: () => void;
}

const CATEGORIES: PostCategory[] = ["announcement", "idea", "discussion", "qa"];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export default function CreatePostModal({ boardId, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<PostCategory>("discussion");
  const [isPinned, setIsPinned] = useState(false);
  
  // File upload state
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFileError("Ukuran file melebihi batas maksimum 50 MB!");
      setFile(null);
      return;
    }

    setFileError(null);
    setFile(selectedFile);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim() || fileError) return;

    setSubmitting(true);
    let fileUrl: string | null = null;
    let fileName: string | null = null;
    let fileSize: number | null = null;

    try {
      if (file) {
        fileName = file.name;
        fileSize = file.size;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("boardId", boardId);

        const uploadRes = await fetch("/API/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const errJson = await uploadRes.json();
          throw new Error(errJson?.error || "Gagal mengunggah berkas.");
        }

        const uploadData = await uploadRes.json();
        fileUrl = uploadData.url;
      }

      await createPost(
        boardId,
        title.trim(),
        content.trim(),
        category,
        isPinned,
        fileUrl,
        fileName,
        fileSize
      );
      onClose();
    } catch (err: any) {
      console.error("Gagal membuat postingan:", err);
      alert(err?.message || "Gagal membuat postingan baru.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(8px)",
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
          borderRadius: 16,
          width: "100%",
          maxWidth: 540,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <MessageSquare width={18} height={18} style={{ color: "#6d28d9" }} />
            <span>Buat Postingan Baru</span>
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#94a3b8",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X width={18} height={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: 20, overflowY: "auto", flex: 1 }}>
          {/* Category Selector */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
              Kategori Postingan
            </label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {CATEGORIES.map((cat) => {
                const b = getCategoryBadge(cat);
                const isSelected = category === cat;
                const CategoryIcon = b.icon;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      border: isSelected ? `2px solid ${b.color}` : "1px solid var(--border)",
                      background: isSelected ? b.bg : "#ffffff",
                      color: isSelected ? b.color : "#64748b",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      transition: "all 0.15s ease",
                    }}
                  >
                    <CategoryIcon width={13} height={13} />
                    <span>{b.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
              Judul
            </label>
            <input
              type="text"
              placeholder="Contoh: Rencana Peluncuran Fitur Baru"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={submitting}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Content */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
              Isi Diskusi / Pengumuman
            </label>
            <textarea
              placeholder="Tuliskan detail ide, pertanyaan, atau pengumuman di sini..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={4}
              disabled={submitting}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                fontSize: 14,
                outline: "none",
                resize: "vertical",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />
          </div>

          {/* File Attachment Upload (Max 50MB) */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "#475569" }}>
                <Paperclip width={14} height={14} style={{ color: "#7c3aed" }} />
                <span>Lampiran File</span>
              </label>
              <span style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>Maksimal 50 MB</span>
            </div>

            {file ? (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 14px", borderRadius: 10, background: "#f8fafc",
                border: "1px solid #cbd5e1", fontSize: 13,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
                  <FileText width={18} height={18} style={{ color: "#6d28d9", flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: "#0f172a", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                      {file.name}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>
                      {formatFileSize(file.size)}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}
                >
                  <X width={16} height={16} />
                </button>
              </div>
            ) : (
              <label style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "12px 16px", borderRadius: 10, border: "2px dashed #cbd5e1",
                background: "#f8fafc", cursor: "pointer", fontSize: 13, color: "#64748b",
                fontWeight: 500, transition: "all 0.15s ease",
              }}>
                <Upload width={16} height={16} style={{ color: "#7c3aed" }} />
                <span>Pilih File untuk Diunggah (Max 50MB)</span>
                <input
                  type="file"
                  onChange={handleFileChange}
                  disabled={submitting}
                  style={{ display: "none" }}
                />
              </label>
            )}

            {fileError && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#dc2626", marginTop: 6, fontWeight: 600 }}>
                <AlertCircle width={14} height={14} />
                <span>{fileError}</span>
              </div>
            )}
          </div>

          {/* Pin option */}
          <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              id="isPinnedCheck"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              disabled={submitting}
              style={{ cursor: "pointer" }}
            />
            <label
              htmlFor="isPinnedCheck"
              style={{ fontSize: 13, color: "#334155", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
            >
              <Pin width={13} height={13} style={{ color: "#7c3aed" }} />
              <span>Sematkan postingan ini di bagian atas (Pinned Post)</span>
            </label>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                background: "#f1f5f9",
                color: "#475569",
                border: "none",
                cursor: "pointer",
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim() || !content.trim() || !!fileError}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 18px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                background: "var(--v)",
                color: "#fff",
                border: "none",
                cursor: submitting || !!fileError ? "not-allowed" : "pointer",
                opacity: submitting || !title.trim() || !content.trim() || !!fileError ? 0.6 : 1,
              }}
            >
              <Send width={14} height={14} />
              {submitting ? "Publishing..." : "Posting"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
