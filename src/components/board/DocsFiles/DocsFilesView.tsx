"use client";

import { useState } from "react";
import {
  FileText,
  Plus,
  Sparkles,
  Search,
  BookOpen,
  Calendar,
  Layers,
  Paperclip,
  Download,
  Trash2,
  Edit3,
  Check,
  CheckCircle2,
  Copy,
  ArrowUpRight,
  Upload,
  X,
  FileCode,
} from "lucide-react";
import {
  DocCategory,
  DocFileItem,
  getDocCategoryBadge,
  INITIAL_SAMPLE_DOCS,
  AIDocResponse,
} from "./docsfiles-utils";
import AIDocsAssistantModal from "./AIDocsAssistantModal";
import { formatFileSize } from "../MessageBoard/messageboard-utils";

interface Props {
  boardId: string;
  userEmail: string;
  canEdit: boolean;
}

export default function DocsFilesView({ boardId, userEmail, canEdit }: Props) {
  const [docs, setDocs] = useState<DocFileItem[]>(INITIAL_SAMPLE_DOCS);
  const [selectedDocId, setSelectedDocId] = useState<string>(INITIAL_SAMPLE_DOCS[0]?.id || "");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Editor mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState<DocCategory>("PRD");
  const [editContent, setEditContent] = useState("");

  // AI Modal state
  const [showAIModal, setShowAIModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // File upload state for documents
  const [docFile, setDocFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const selectedDoc = docs.find((d) => d.id === selectedDocId) || docs[0] || null;

  // Filter docs
  const filteredDocs = docs.filter((d) => {
    const matchesCategory = selectedCategory === "all" || d.category === selectedCategory;
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.content_markdown.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const startNewDoc = () => {
    const newDoc: DocFileItem = {
      id: `doc-${Date.now()}`,
      board_id: boardId,
      title: "Dokumen Baru Tanpa Judul",
      category: "PRD",
      content_markdown: "# Dokumen Baru\n\nTuliskan spesifikasi atau catatan proyek di sini...",
      author_email: userEmail || "Anonim",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setDocs([newDoc, ...docs]);
    setSelectedDocId(newDoc.id);
    setEditTitle(newDoc.title);
    setEditCategory(newDoc.category);
    setEditContent(newDoc.content_markdown);
    setIsEditing(true);
  };

  const startEditCurrent = () => {
    if (!selectedDoc) return;
    setEditTitle(selectedDoc.title);
    setEditCategory(selectedDoc.category);
    setEditContent(selectedDoc.content_markdown);
    setIsEditing(true);
  };

  const saveCurrentDoc = () => {
    if (!selectedDoc) return;
    setDocs(
      docs.map((d) =>
        d.id === selectedDoc.id
          ? {
              ...d,
              title: editTitle.trim() || "Dokumen Tanpa Judul",
              category: editCategory,
              content_markdown: editContent,
              updated_at: new Date().toISOString(),
            }
          : d
      )
    );
    setIsEditing(false);
  };

  const deleteCurrentDoc = (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus dokumen ini?")) return;
    const updated = docs.filter((d) => d.id !== id);
    setDocs(updated);
    if (updated.length > 0) {
      setSelectedDocId(updated[0].id);
    }
  };

  const handleApplyAIResult = (aiData: AIDocResponse["data"]) => {
    const newDoc: DocFileItem = {
      id: `doc-${Date.now()}`,
      board_id: boardId,
      title: aiData.title || "Dokumen Hasil Kanvexa AI",
      category: aiData.category || "PRD",
      content_markdown: aiData.content_markdown || "",
      summary_highlights: aiData.summary_highlights || [],
      action_items: aiData.action_items || [],
      author_email: userEmail || "Kanvexa AI",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setDocs([newDoc, ...docs]);
    setSelectedDocId(newDoc.id);
    setIsEditing(false);
  };

  const handleCopyMarkdown = () => {
    if (!selectedDoc) return;
    navigator.clipboard.writeText(selectedDoc.content_markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedDoc) return;

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("boardId", boardId);

      const res = await fetch("/API/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Gagal upload file.");
      const uploadData = await res.json();

      setDocs(
        docs.map((d) =>
          d.id === selectedDoc.id
            ? {
                ...d,
                file_url: uploadData.url,
                file_name: uploadData.name,
                file_size: uploadData.size,
              }
            : d
        )
      );
    } catch (err) {
      console.error(err);
      alert("Gagal mengunggah berkas lampiran.");
    } finally {
      setUploadingFile(false);
    }
  };

  return (
    <div style={{ padding: "20px 24px 40px", maxWidth: 1320, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
      {/* Header Bar Actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(109, 40, 217, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#6d28d9" }}>
              <FileText width={20} height={20} />
            </div>
            <span>Docs & Files Hub</span>
          </h2>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
            Pusat dokumentasi tim, PRD, spesifikasi teknis, dan berkas lampiran dengan Kanvexa AI.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => setShowAIModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 16px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              background: "rgba(109, 40, 217, 0.08)",
              color: "#6d28d9",
              border: "1px solid rgba(109, 40, 217, 0.2)",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <span>✦ Urai dengan AI</span>
          </button>

          {canEdit && (
            <button
              onClick={startNewDoc}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 18px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                background: "var(--v)",
                color: "#ffffff",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(109, 40, 217, 0.3)",
              }}
            >
              <Plus width={16} height={16} />
              <span>Buat Dokumen</span>
            </button>
          )}
        </div>
      </div>

      {/* 3 Column Split-Screen Layout (Sidebar Kiri: 280px, Main Workspace: Flex 1, Sidebar AI Kanan: 300px) */}
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        
        {/* SISI KIRI: Sidebar Dokumen & Filter Category */}
        <div style={{ width: 280, flexShrink: 0, display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Search Box */}
          <div style={{ position: "relative" }}>
            <Search width={14} height={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              type="text"
              placeholder="Cari dokumen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px 8px 34px",
                borderRadius: 10,
                border: "1px solid var(--border)",
                fontSize: 12,
                outline: "none",
                background: "#ffffff",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            <button
              onClick={() => setSelectedCategory("all")}
              style={{
                padding: "4px 10px",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 700,
                border: selectedCategory === "all" ? "1.5px solid #6d28d9" : "1px solid transparent",
                background: selectedCategory === "all" ? "rgba(109, 40, 217, 0.1)" : "#ffffff",
                color: selectedCategory === "all" ? "#6d28d9" : "#64748b",
                cursor: "pointer",
              }}
            >
              Semua ({docs.length})
            </button>
            {(["PRD", "Meeting Notes", "Briefing", "Technical Spec", "General"] as DocCategory[]).map((cat) => {
              const b = getDocCategoryBadge(cat);
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    border: isSelected ? `1.5px solid ${b.color}` : "1px solid transparent",
                    background: isSelected ? b.bg : "#ffffff",
                    color: isSelected ? b.color : "#64748b",
                    cursor: "pointer",
                  }}
                >
                  {b.label}
                </button>
              );
            })}
          </div>

          {/* Document Items List */}
          <div
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #faf5ff 50%, #f3e8ff 100%)",
              borderRadius: 16,
              padding: 12,
              border: "1.5px solid #d8b4fe",
              boxShadow: "0 4px 14px rgba(147, 51, 234, 0.08)",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              maxHeight: 520,
              overflowY: "auto",
            }}
          >
            {filteredDocs.length === 0 ? (
              <p style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", margin: "16px 0" }}>
                Tidak ada dokumen yang ditemukan.
              </p>
            ) : (
              filteredDocs.map((doc) => {
                const isSelected = selectedDocId === doc.id;
                const b = getDocCategoryBadge(doc.category);
                const BadgeIcon = b.icon;

                return (
                  <div
                    key={doc.id}
                    onClick={() => {
                      setSelectedDocId(doc.id);
                      setIsEditing(false);
                    }}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 10,
                      background: isSelected ? "#ffffff" : "transparent",
                      border: isSelected ? `2px solid ${b.color}` : "1px solid transparent",
                      boxShadow: isSelected ? "0 4px 12px rgba(109, 40, 217, 0.12)" : "none",
                      cursor: "pointer",
                      transition: "all 0.12s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 6px", borderRadius: 4, background: b.bg, color: b.color, display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <BadgeIcon width={10} height={10} />
                        {b.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", lineHeight: 1.35, marginBottom: 4 }}>
                      {doc.title}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>
                      {doc.author_email.split("@")[0]}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* AREA UTAMA: Main Workspace (Markdown Editor & Reader) */}
        <div style={{ flex: 1, minWidth: 340, display: "flex", flexDirection: "column", gap: 16 }}>
          {selectedDoc ? (
            <div
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #faf5ff 50%, #f3e8ff 100%)",
                borderRadius: 16,
                padding: 24,
                border: "1.5px solid #d8b4fe",
                boxShadow: "0 4px 14px rgba(147, 51, 234, 0.08)",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {/* Document Header Bar */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", borderBottom: "1px solid #e9d5ff", paddingBottom: 14 }}>
                <div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: "#0f172a",
                        padding: "6px 10px",
                        borderRadius: 8,
                        border: "1px solid #c084fc",
                        outline: "none",
                        width: "100%",
                        boxSizing: "border-box",
                      }}
                    />
                  ) : (
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 4px 0" }}>
                      {selectedDoc.title}
                    </h3>
                  )}

                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    {isEditing ? (
                      <select
                        value={editCategory}
                        onChange={(e: any) => setEditCategory(e.target.value)}
                        style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6, border: "1px solid #c084fc" }}
                      >
                        <option value="PRD">PRD</option>
                        <option value="Meeting Notes">Meeting Notes</option>
                        <option value="Briefing">Briefing</option>
                        <option value="Technical Spec">Technical Spec</option>
                        <option value="General">General</option>
                      </select>
                    ) : (
                      (() => {
                        const b = getDocCategoryBadge(selectedDoc.category);
                        const BadgeIcon = b.icon;
                        return (
                          <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 6, background: b.bg, color: b.color, border: `1px solid ${b.border}`, display: "inline-flex", alignItems: "center", gap: 5 }}>
                            <BadgeIcon width={12} height={12} />
                            {b.label}
                          </span>
                        );
                      })()
                    )}
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>• Dibuat oleh {selectedDoc.author_email}</span>
                  </div>
                </div>

                {/* Editor Action Buttons */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    onClick={handleCopyMarkdown}
                    style={{
                      display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
                      borderRadius: 8, fontSize: 12, fontWeight: 700, background: "#ffffff",
                      color: "#6d28d9", border: "1px solid #d8b4fe", cursor: "pointer"
                    }}
                  >
                    {copied ? <Check width={14} height={14} /> : <Copy width={14} height={14} />}
                    <span>{copied ? "Tersalin!" : "Salin Markdown"}</span>
                  </button>

                  {isEditing ? (
                    <button
                      onClick={saveCurrentDoc}
                      style={{
                        display: "flex", alignItems: "center", gap: 5, padding: "6px 14px",
                        borderRadius: 8, fontSize: 12, fontWeight: 700, background: "var(--v)",
                        color: "#ffffff", border: "none", cursor: "pointer"
                      }}
                    >
                      <Check width={14} height={14} />
                      <span>Simpan Dokumen</span>
                    </button>
                  ) : (
                    canEdit && (
                      <button
                        onClick={startEditCurrent}
                        style={{
                          display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
                          borderRadius: 8, fontSize: 12, fontWeight: 700, background: "rgba(109,40,217,0.1)",
                          color: "#6d28d9", border: "1px solid rgba(109,40,217,0.2)", cursor: "pointer"
                        }}
                      >
                        <Edit3 width={14} height={14} />
                        <span>Edit</span>
                      </button>
                    )
                  )}

                  {canEdit && (
                    <button
                      onClick={() => deleteCurrentDoc(selectedDoc.id)}
                      style={{
                        padding: "6px 8px", borderRadius: 8, background: "#ffffff",
                        color: "#ef4444", border: "1px solid #fca5a5", cursor: "pointer"
                      }}
                    >
                      <Trash2 width={14} height={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Main Content Area */}
              {isEditing ? (
                <textarea
                  rows={16}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  style={{
                    width: "100%",
                    padding: 16,
                    borderRadius: 12,
                    border: "1px solid #c084fc",
                    fontSize: 13,
                    lineHeight: 1.6,
                    fontFamily: "monospace",
                    outline: "none",
                    background: "#ffffff",
                    boxSizing: "border-box",
                  }}
                />
              ) : (
                <div
                  style={{
                    fontSize: 14,
                    lineHeight: 1.65,
                    color: "#334155",
                    whiteSpace: "pre-wrap",
                    fontFamily: "inherit",
                  }}
                >
                  {selectedDoc.content_markdown}
                </div>
              )}

              {/* File Attachment Upload Section */}
              <div style={{ marginTop: 10, paddingTop: 14, borderTop: "1px dashed #d8b4fe" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "flex", alignItems: "center", gap: 6 }}>
                    <Paperclip width={14} height={14} style={{ color: "#6d28d9" }} />
                    <span>Berkas Lampiran</span>
                  </span>
                  {canEdit && !selectedDoc.file_name && (
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#6d28d9", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                      <Upload width={13} height={13} />
                      <span>{uploadingFile ? "Mengunggah..." : "Unggah Berkas (Max 50MB)"}</span>
                      <input type="file" onChange={handleFileUpload} disabled={uploadingFile} style={{ display: "none" }} />
                    </label>
                  )}
                </div>

                {selectedDoc.file_name && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 10, background: "#ffffff", border: "1px solid #d8b4fe" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <FileCode width={18} height={18} style={{ color: "#6d28d9" }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{selectedDoc.file_name}</div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>{formatFileSize(selectedDoc.file_size)}</div>
                      </div>
                    </div>
                    {selectedDoc.file_url && (
                      <a href={selectedDoc.file_url} download target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, background: "var(--v)", color: "#ffffff", textDecoration: "none" }}>
                        <Download width={14} height={14} />
                        <span>Unduh</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ background: "#ffffff", borderRadius: 16, padding: 48, textAlign: "center", border: "1px dashed var(--border)" }}>
              <FileText width={36} height={36} style={{ color: "#cbd5e1", marginBottom: 12 }} />
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", margin: 0 }}>Pilih Dokumen untuk Dilihat</h3>
            </div>
          )}
        </div>

        {/* SISI KANAN: Panel AI Insights, Highlights, & Action Items (300px) */}
        <div style={{ width: 300, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Kanvexa AI Card */}
          <div
            style={{
              background: "linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%)",
              borderRadius: 16,
              padding: "18px 20px",
              color: "#ffffff",
              boxShadow: "0 10px 25px rgba(109, 40, 217, 0.22)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, marginBottom: 8 }}>
              <Sparkles width={16} height={16} style={{ color: "#fef08a" }} />
              <span>Kanvexa AI Assistant</span>
            </div>
            <p style={{ fontSize: 12, lineHeight: 1.5, opacity: 0.9, margin: "0 0 12px 0" }}>
              Gunakan AI untuk membuat PRD otomatis, merangkum file lampiran, atau merapikan catatan mentah.
            </p>
            <button
              onClick={() => setShowAIModal(true)}
              style={{
                width: "100%",
                padding: "8px 14px",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                background: "#ffffff",
                color: "#6d28d9",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <span>✦ Urai dengan AI</span>
              <ArrowUpRight width={14} height={14} />
            </button>
          </div>

          {/* Highlights & Action Items Card */}
          {selectedDoc && (
            <div style={{ background: "linear-gradient(135deg, #ffffff 0%, #faf5ff 50%, #f3e8ff 100%)", borderRadius: 16, padding: "18px 20px", border: "1.5px solid #d8b4fe", boxShadow: "0 4px 14px rgba(147, 51, 234, 0.08)", display: "flex", flexDirection: "column", gap: 14 }}>
              {selectedDoc.summary_highlights && selectedDoc.summary_highlights.length > 0 && (
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", margin: "0 0 8px 0" }}>
                    📌 Poin Utama Dokumen
                  </h4>
                  <ul style={{ paddingLeft: 16, margin: 0, fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
                    {selectedDoc.summary_highlights.map((h, i) => (
                      <li key={i} style={{ marginBottom: 4 }}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedDoc.action_items && selectedDoc.action_items.length > 0 && (
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 800, color: "#059669", margin: "0 0 8px 0", display: "flex", alignItems: "center", gap: 6 }}>
                    <CheckCircle2 width={14} height={14} />
                    <span>Action Items</span>
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {selectedDoc.action_items.map((act, i) => (
                      <div key={i} style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", background: "#ffffff", padding: "6px 10px", borderRadius: 8, border: "1px solid #d8b4fe" }}>
                        ✓ {act}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* AI Assistant Modal */}
      {showAIModal && (
        <AIDocsAssistantModal
          initialContent={selectedDoc?.content_markdown || ""}
          onApplyResult={handleApplyAIResult}
          onClose={() => setShowAIModal(false)}
        />
      )}
    </div>
  );
}
