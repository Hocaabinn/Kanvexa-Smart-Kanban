"use client";

import { useState } from "react";
import {
  Folder,
  FolderPlus,
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
  ChevronRight,
  ChevronDown,
  Tag,
  Eye,
  Filter,
  MoreVertical,
} from "lucide-react";
import {
  DocCategory,
  DocFileItem,
  DocFolderItem,
  getDocCategoryBadge,
  INITIAL_SAMPLE_DOCS,
  INITIAL_SAMPLE_FOLDERS,
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
  const [folders, setFolders] = useState<DocFolderItem[]>(INITIAL_SAMPLE_FOLDERS);
  const [docs, setDocs] = useState<DocFileItem[]>(INITIAL_SAMPLE_DOCS);
  
  const [selectedFolderId, setSelectedFolderId] = useState<string>("f-1");
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  
  const [sidebarTab, setSidebarTab] = useState<"folders" | "tags">("folders");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Folder Expansion State
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    "f-1": true,
    "f-1-1": true,
  });

  // Modal / Drawer States
  const [showDocDrawer, setShowDocDrawer] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showAIModal, setShowAIModal] = useState(false);

  // Editor mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState<DocCategory>("PRD");
  const [editContent, setEditContent] = useState("");
  const [copied, setCopied] = useState(false);

  // File upload state for documents
  const [uploadingFile, setUploadingFile] = useState(false);

  const selectedDoc = docs.find((d) => d.id === selectedDocId) || null;
  const currentFolder = folders.find((f) => f.id === selectedFolderId) || folders[0];

  const toggleFolderExpand = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolders((prev) => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const newFolder: DocFolderItem = {
      id: `f-${Date.now()}`,
      name: newFolderName.trim(),
      fileCount: 0,
    };

    setFolders([...folders, newFolder]);
    setSelectedFolderId(newFolder.id);
    setNewFolderName("");
    setShowCreateFolderModal(false);
  };

  const startNewDoc = () => {
    const newDoc: DocFileItem = {
      id: `doc-${Date.now()}`,
      board_id: boardId,
      folder_id: selectedFolderId,
      title: "Dokumen Baru Tanpa Judul",
      category: "PRD",
      content_markdown: "# Dokumen Baru\n\nTuliskan spesifikasi, ringkasan, atau catatan proyek di sini...",
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
    setShowDocDrawer(true);
  };

  const openDocPreview = (doc: DocFileItem) => {
    setSelectedDocId(doc.id);
    setEditTitle(doc.title);
    setEditCategory(doc.category);
    setEditContent(doc.content_markdown);
    setIsEditing(false);
    setShowDocDrawer(true);
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
    if (selectedDocId === id) {
      setSelectedDocId(null);
      setShowDocDrawer(false);
    }
  };

  const handleApplyAIResult = (aiData: AIDocResponse["data"]) => {
    const newDoc: DocFileItem = {
      id: `doc-${Date.now()}`,
      board_id: boardId,
      folder_id: selectedFolderId,
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
    openDocPreview(newDoc);
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

  // Tree View Helper Component
  const renderTreeFolder = (folder: DocFolderItem, depth = 0) => {
    const hasSub = folder.subfolders && folder.subfolders.length > 0;
    const isExpanded = expandedFolders[folder.id];
    const isSelected = selectedFolderId === folder.id;

    return (
      <div key={folder.id} style={{ display: "flex", flexDirection: "column" }}>
        <div
          onClick={() => setSelectedFolderId(folder.id)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: `6px 10px 6px ${12 + depth * 16}px`,
            borderRadius: 8,
            background: isSelected ? "rgba(109, 40, 217, 0.1)" : "transparent",
            color: isSelected ? "#6d28d9" : "#334155",
            fontWeight: isSelected ? 700 : 500,
            fontSize: 13,
            cursor: "pointer",
            transition: "all 0.12s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
            {hasSub ? (
              <span onClick={(e) => toggleFolderExpand(folder.id, e)} style={{ display: "flex", alignItems: "center", color: "#64748b" }}>
                {isExpanded ? <ChevronDown width={14} height={14} /> : <ChevronRight width={14} height={14} />}
              </span>
            ) : (
              <span style={{ width: 14 }} />
            )}
            <Folder width={16} height={16} style={{ color: isSelected ? "#6d28d9" : "#64748b", flexShrink: 0 }} />
            <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
              {folder.name}
            </span>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 10, background: isSelected ? "#6d28d9" : "#e2e8f0", color: isSelected ? "#ffffff" : "#64748b" }}>
            {folder.fileCount}
          </span>
        </div>

        {hasSub && isExpanded && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {folder.subfolders!.map((sub) => renderTreeFolder(sub, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: "20px 24px 40px", maxWidth: 1360, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
      {/* 2 Main Columns Layout: Left Knowledge Base Sidebar (280px), Right Explorer Area (Flex 1) */}
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        
        {/* SISI KIRI: Knowledge Base Sidebar (Sama persis seperti gambar yang diberikan pengguna) */}
        <div
          style={{
            width: 280,
            flexShrink: 0,
            background: "#ffffff",
            borderRadius: 16,
            padding: 16,
            border: "1px solid var(--border)",
            boxShadow: "0 4px 14px rgba(0,0,0,0.03)",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {/* Header Title + Action Buttons */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
              <span>Knowledge Base</span>
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button
                onClick={() => setShowCreateFolderModal(true)}
                title="Tambah Folder Baru"
                style={{
                  background: "rgba(109, 40, 217, 0.08)",
                  border: "1px solid rgba(109, 40, 217, 0.2)",
                  borderRadius: 6,
                  padding: 5,
                  cursor: "pointer",
                  color: "#6d28d9",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Plus width={14} height={14} />
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div style={{ position: "relative" }}>
            <Search width={14} height={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "7px 10px 7px 32px",
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                fontSize: 12,
                outline: "none",
                background: "#f8fafc",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Sidebar Tab Switcher: [ Folders ] [ Tags ] */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "#f1f5f9", padding: 3, borderRadius: 8 }}>
            <button
              onClick={() => setSidebarTab("folders")}
              style={{
                padding: "5px 0",
                fontSize: 12,
                fontWeight: 700,
                border: "none",
                borderRadius: 6,
                background: sidebarTab === "folders" ? "#ffffff" : "transparent",
                color: sidebarTab === "folders" ? "#0f172a" : "#64748b",
                boxShadow: sidebarTab === "folders" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                cursor: "pointer",
              }}
            >
              Folders
            </button>
            <button
              onClick={() => setSidebarTab("tags")}
              style={{
                padding: "5px 0",
                fontSize: 12,
                fontWeight: 700,
                border: "none",
                borderRadius: 6,
                background: sidebarTab === "tags" ? "#ffffff" : "transparent",
                color: sidebarTab === "tags" ? "#0f172a" : "#64748b",
                boxShadow: sidebarTab === "tags" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                cursor: "pointer",
              }}
            >
              Tags
            </button>
          </div>

          {/* Sidebar Content Tree or Tags */}
          {sidebarTab === "folders" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 2, maxHeight: 480, overflowY: "auto" }}>
              {folders.map((f) => renderTreeFolder(f))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { name: "prd", count: 8 },
                { name: "meeting", count: 12 },
                { name: "api-spec", count: 5 },
                { name: "design", count: 4 },
                { name: "general", count: 10 },
              ].map((t) => (
                <div
                  key={t.name}
                  onClick={() => setSelectedTag(selectedTag === t.name ? null : t.name)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "6px 10px",
                    borderRadius: 8,
                    background: selectedTag === t.name ? "rgba(109, 40, 217, 0.1)" : "transparent",
                    color: selectedTag === t.name ? "#6d28d9" : "#475569",
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Tag width={13} height={13} style={{ color: "#6d28d9" }} />
                    <span>#{t.name}</span>
                  </div>
                  <span style={{ fontSize: 11, color: "#64748b" }}>{t.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AREA UTAMA KANAN: Explorer Area (Folders Grid + Files Table + AI Bar) */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
          
          {/* Header Action & Selection Bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <span>{currentFolder.name}</span>
                <ChevronDown width={16} height={16} style={{ color: "#64748b" }} />
              </h2>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={() => setShowAIModal(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%)",
                  color: "#ffffff",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(109, 40, 217, 0.25)",
                }}
              >
                <Sparkles width={14} height={14} style={{ color: "#fef08a" }} />
                <span>✦ Urai dengan AI</span>
              </button>

              {canEdit && (
                <>
                  <button
                    onClick={() => setShowCreateFolderModal(true)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 14px",
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 700,
                      background: "#ffffff",
                      color: "#6d28d9",
                      border: "1px solid #d8b4fe",
                      cursor: "pointer",
                    }}
                  >
                    <FolderPlus width={15} height={15} />
                    <span>Buat Folder</span>
                  </button>

                  <button
                    onClick={startNewDoc}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 16px",
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
                </>
              )}
            </div>
          </div>

          {/* SECTION 1: Folders Grid (Authentic 3D Stacked Folder Cards seperti di Gambar) */}
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 16px 0" }}>
              Folders
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 18 }}>
              {[
                { id: "f-1-1", name: "Onboarding", files: 15 },
                { id: "f-1-2", name: "Integrations", files: 5 },
                { id: "f-1-3", name: "Technical Specs", files: 8 },
                { id: "f-2", name: "Team Interviews", files: 6 },
              ].map((fItem) => (
                <div
                  key={fItem.id}
                  onClick={() => setSelectedFolderId(fItem.id)}
                  style={{
                    background: "#f8fafc",
                    borderRadius: 20,
                    padding: "24px 20px 20px",
                    border: "1px solid #e2e8f0",
                    cursor: "pointer",
                    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.background = "#ffffff";
                    e.currentTarget.style.borderColor = "#c084fc";
                    e.currentTarget.style.boxShadow = "0 12px 25px rgba(109, 40, 217, 0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.background = "#f8fafc";
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Authentic 3D Stacked Folder Graphic */}
                  <div style={{ position: "relative", width: 140, height: 110, marginBottom: 12 }}>
                    {/* Document paper 1 (Back angled) */}
                    <div style={{
                      position: "absolute", top: 6, left: 24, width: 88, height: 65,
                      background: "#ffffff", borderRadius: 8, border: "1px solid #cbd5e1",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)", transform: "rotate(-5deg)",
                      padding: 8, display: "flex", flexDirection: "column", gap: 4
                    }}>
                      <div style={{ fontSize: 7, fontWeight: 800, color: "#ea4335" }}>PDF</div>
                      <div style={{ width: "70%", height: 3, background: "#cbd5e1", borderRadius: 2 }} />
                      <div style={{ width: "90%", height: 2, background: "#e2e8f0", borderRadius: 2 }} />
                    </div>

                    {/* Document paper 2 (Front angled) */}
                    <div style={{
                      position: "absolute", top: 2, left: 28, width: 84, height: 65,
                      background: "#ffffff", borderRadius: 8, border: "1px solid #cbd5e1",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)", transform: "rotate(4deg)",
                      padding: 8, display: "flex", flexDirection: "column", gap: 4
                    }}>
                      <div style={{ width: "40%", height: 4, background: "#7c3aed", borderRadius: 2 }} />
                      <div style={{ width: "80%", height: 2, background: "#e2e8f0", borderRadius: 2 }} />
                      <div style={{ width: "60%", height: 2, background: "#e2e8f0", borderRadius: 2 }} />
                    </div>

                    {/* Folder Back Tab */}
                    <div style={{
                      position: "absolute", bottom: 0, left: 10, width: 120, height: 80,
                      background: "#475569", borderRadius: 14,
                    }}>
                      <div style={{
                        position: "absolute", top: -8, left: 0, width: 44, height: 12,
                        background: "#475569", borderRadius: "6px 6px 0 0",
                      }} />
                    </div>

                    {/* Folder Front Pocket Cover */}
                    <div style={{
                      position: "absolute", bottom: 0, left: 4, width: 132, height: 72,
                      background: "linear-gradient(180deg, #475569 0%, #334155 100%)",
                      borderRadius: 14, boxShadow: "0 10px 20px rgba(15, 23, 42, 0.25)",
                      display: "flex", alignItems: "flex-end", padding: "10px 12px",
                      borderTop: "1px solid rgba(255, 255, 255, 0.2)",
                    }}>
                      {/* App Badges at bottom left */}
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
                          <span style={{ fontSize: 9 }}>📐</span>
                        </div>
                        <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#18181b", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900, border: "1px solid #3f3f46" }}>
                          N
                        </div>
                        <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#0284c7", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 800 }}>
                          ☁️
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Folder Details */}
                  <div style={{ textAlign: "center", marginTop: 4 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 2 }}>
                      {fItem.name}
                    </div>
                    <div style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>
                      {fItem.files} Files
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: Files & Documents List (Table Format seperti di Gambar) */}
          <div style={{ marginTop: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                Files & Documents
              </h3>
              <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                {docs.length} Berkas Ditemukan
              </span>
            </div>

            <div
              style={{
                background: "#ffffff",
                borderRadius: 16,
                border: "1px solid var(--border)",
                boxShadow: "0 4px 14px rgba(0,0,0,0.03)",
                overflow: "hidden",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: 12, fontWeight: 700, color: "#64748b" }}>
                    <th style={{ padding: "12px 16px" }}>Nama Dokumen</th>
                    <th style={{ padding: "12px 16px" }}>Kategori</th>
                    <th style={{ padding: "12px 16px" }}>Dibuat Oleh</th>
                    <th style={{ padding: "12px 16px" }}>Tanggal</th>
                    <th style={{ padding: "12px 16px", textAlign: "right" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {docs.map((doc) => {
                    const b = getDocCategoryBadge(doc.category);
                    const BadgeIcon = b.icon;

                    return (
                      <tr
                        key={doc.id}
                        onClick={() => openDocPreview(doc)}
                        style={{
                          borderBottom: "1px solid #f1f5f9",
                          fontSize: 13,
                          cursor: "pointer",
                          transition: "background 0.12s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#faf5ff")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                      >
                        <td style={{ padding: "12px 16px", fontWeight: 700, color: "#0f172a" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <FileText width={16} height={16} style={{ color: "#6d28d9" }} />
                            <span>{doc.title}</span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 6, background: b.bg, color: b.color, border: `1px solid ${b.border}`, display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <BadgeIcon width={11} height={11} />
                            {b.label}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", color: "#475569" }}>
                          {doc.author_email}
                        </td>
                        <td style={{ padding: "12px 16px", color: "#64748b", fontSize: 12 }}>
                          {new Date(doc.updated_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "right" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openDocPreview(doc);
                              }}
                              style={{ padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: "rgba(109, 40, 217, 0.1)", color: "#6d28d9", border: "none", cursor: "pointer" }}
                            >
                              Buka Dokumen
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* DOCUMENT PREVIEW & EDITOR DRAWER / MODAL */}
      {showDocDrawer && selectedDoc && (
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
            justifyContent: "flex-end",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 720,
              height: "100%",
              background: "#ffffff",
              boxShadow: "-10px 0 30px rgba(0,0,0,0.15)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Drawer Header */}
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(135deg, #ffffff 0%, #faf5ff 50%, #f3e8ff 100%)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <FileText width={20} height={20} style={{ color: "#6d28d9" }} />
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                  {selectedDoc.title}
                </h3>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={handleCopyMarkdown} style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, background: "#ffffff", color: "#6d28d9", border: "1px solid #d8b4fe", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                  {copied ? <Check width={14} height={14} /> : <Copy width={14} height={14} />}
                  <span>{copied ? "Tersalin!" : "Salin"}</span>
                </button>

                {canEdit && (
                  <button onClick={() => deleteCurrentDoc(selectedDoc.id)} style={{ padding: "6px 8px", borderRadius: 8, background: "#ffffff", color: "#ef4444", border: "1px solid #fca5a5", cursor: "pointer" }}>
                    <Trash2 width={14} height={14} />
                  </button>
                )}

                <button onClick={() => setShowDocDrawer(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 20 }}>
                  <X width={20} height={20} />
                </button>
              </div>
            </div>

            {/* Drawer Content Body */}
            <div style={{ flex: 1, padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 18 }}>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", padding: "8px 12px", borderRadius: 8, border: "1px solid #c084fc", outline: "none" }}
                  />
                  <textarea
                    rows={16}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    style={{ width: "100%", padding: 14, borderRadius: 10, border: "1px solid #c084fc", fontSize: 13, fontFamily: "monospace", lineHeight: 1.6, outline: "none", boxSizing: "border-box" }}
                  />
                  <button onClick={saveCurrentDoc} style={{ padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700, background: "var(--v)", color: "#ffffff", border: "none", cursor: "pointer", alignSelf: "flex-end" }}>
                    Simpan Perubahan
                  </button>
                </>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "#64748b" }}>Dibuat oleh {selectedDoc.author_email}</span>
                    {canEdit && (
                      <button onClick={() => setIsEditing(true)} style={{ padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700, background: "rgba(109, 40, 217, 0.1)", color: "#6d28d9", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                        <Edit3 width={13} height={13} />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: 14, lineHeight: 1.7, color: "#334155", whiteSpace: "pre-wrap" }}>
                    {selectedDoc.content_markdown}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE FOLDER MODAL */}
      {showCreateFolderModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.45)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
          <div style={{ background: "#ffffff", borderRadius: 16, padding: 24, width: "100%", maxWidth: 420, border: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "0 0 14px 0" }}>Buat Folder Baru</h3>
            <form onSubmit={handleCreateFolder} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input
                type="text"
                autoFocus
                required
                placeholder="Nama Folder (misal: Onboarding, Design Docs)"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 13, outline: "none", boxSizing: "border-box" }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" onClick={() => setShowCreateFolderModal(false)} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "none", border: "1px solid #cbd5e1", color: "#475569" }}>
                  Batal
                </button>
                <button type="submit" style={{ padding: "8px 18px", borderRadius: 8, fontSize: 12, fontWeight: 700, background: "var(--v)", color: "#ffffff", border: "none", cursor: "pointer" }}>
                  Buat Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
