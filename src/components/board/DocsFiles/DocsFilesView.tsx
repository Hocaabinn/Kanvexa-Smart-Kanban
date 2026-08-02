"use client";

import { useState, useEffect } from "react";
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
import { AnimatedFolder } from "@/components/ui/3d-folder";
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
  const FOLDERS_STORAGE_KEY = `kanvexa_folders_${boardId}`;
  const DOCS_STORAGE_KEY = `kanvexa_docs_${boardId}`;

  const [folders, setFolders] = useState<DocFolderItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(FOLDERS_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse saved folders", e);
        }
      }
    }
    return INITIAL_SAMPLE_FOLDERS;
  });

  const [docs, setDocs] = useState<DocFileItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(DOCS_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse saved docs", e);
        }
      }
    }
    return INITIAL_SAMPLE_DOCS;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
      } catch (e) {
        console.error("Failed to save folders", e);
      }
    }
  }, [folders, FOLDERS_STORAGE_KEY]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(docs));
      } catch (e) {
        console.error("Failed to save docs", e);
      }
    }
  }, [docs, DOCS_STORAGE_KEY]);
  
  const [selectedFolderId, setSelectedFolderId] = useState<string>("f-1");
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  
  const [sidebarTab, setSidebarTab] = useState<"folders" | "tags">("folders");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Folder Context Menu & Rename States
  const [activeMenuFolderId, setActiveMenuFolderId] = useState<string | null>(null);
  const [renameFolderModal, setRenameFolderModal] = useState<{ id: string; currentName: string } | null>(null);
  const [renameInput, setRenameInput] = useState("");

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

  const findFolderInTree = (items: DocFolderItem[], targetId: string): DocFolderItem | null => {
    for (const item of items) {
      if (item.id === targetId) return item;
      if (item.subfolders && item.subfolders.length > 0) {
        const found = findFolderInTree(item.subfolders, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  const getFolderFileCount = (folderId: string): number => {
    if (folderId === "f-1") {
      return docs.length;
    }
    return docs.filter((d) => d.folder_id === folderId).length;
  };

  const currentFolderItem = findFolderInTree(folders, selectedFolderId);
  const currentFolder = {
    id: selectedFolderId,
    name: currentFolderItem ? currentFolderItem.name : "General Knowledge",
    fileCount: getFolderFileCount(selectedFolderId),
  };

  const selectedDoc = docs.find((d) => d.id === selectedDocId) || null;

  // Filter docs based on selected folder & search
  const currentFolderDocs = docs.filter((d) => {
    const matchesFolder =
      selectedFolderId === "f-1" || d.folder_id === selectedFolderId || (!d.folder_id && selectedFolderId === "f-1");
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.content_markdown.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const toggleFolderExpand = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolders((prev) => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const getGridFolders = (folderTree: DocFolderItem[]) => {
    const result: { id: string; name: string; files: string; projects: any[] }[] = [];

    const defaultProjectsMap: Record<string, any[]> = {
      "f-1-1": [
        { id: "ob-1", image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=60&w=150&auto=format&fit=crop", title: "Onboarding Guide" },
        { id: "ob-2", image: "https://images.unsplash.com/photo-1542744094-3a317272018a?q=60&w=150&auto=format&fit=crop", title: "Welcome Deck" },
        { id: "ob-3", image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=60&w=150&auto=format&fit=crop", title: "Design System" },
      ],
      "f-1-2": [
        { id: "it-1", image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=60&w=150&auto=format&fit=crop", title: "API Docs" },
        { id: "it-2", image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=60&w=150&auto=format&fit=crop", title: "Webhook Specs" },
        { id: "it-3", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=60&w=150&auto=format&fit=crop", title: "Auth Protocol" },
      ],
      "f-1-3": [
        { id: "ts-1", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=60&w=150&auto=format&fit=crop", title: "Architecture" },
        { id: "ts-2", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=60&w=150&auto=format&fit=crop", title: "Database Schema" },
        { id: "ts-3", image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=60&w=150&auto=format&fit=crop", title: "Vercel Setup" },
      ],
      "f-2": [
        { id: "ti-1", image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=60&w=150&auto=format&fit=crop", title: "User Research" },
        { id: "ti-2", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=60&w=150&auto=format&fit=crop", title: "Interview Notes" },
        { id: "ti-3", image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=60&w=150&auto=format&fit=crop", title: "Persona Specs" },
      ],
    };

    const traverse = (items: DocFolderItem[]) => {
      for (const item of items) {
        if (item.subfolders && item.subfolders.length > 0) {
          traverse(item.subfolders);
        } else {
          const count = getFolderFileCount(item.id);
          result.push({
            id: item.id,
            name: item.name,
            files: `${count} Files`,
            projects: defaultProjectsMap[item.id] || [
              { id: `${item.id}-1`, image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=60&w=150&auto=format&fit=crop", title: `${item.name} Doc 1` },
              { id: `${item.id}-2`, image: "https://images.unsplash.com/photo-1542744094-3a317272018a?q=60&w=150&auto=format&fit=crop", title: `${item.name} Doc 2` },
              { id: `${item.id}-3`, image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=60&w=150&auto=format&fit=crop", title: `${item.name} Doc 3` },
            ],
          });
        }
      }
    };

    traverse(folderTree);

    for (const item of folderTree) {
      if (!result.some((r) => r.id === item.id)) {
        const count = getFolderFileCount(item.id);
        result.push({
          id: item.id,
          name: item.name,
          files: `${count} Files`,
          projects: defaultProjectsMap[item.id] || [
            { id: `${item.id}-1`, image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=60&w=150&auto=format&fit=crop", title: `${item.name} Doc 1` },
            { id: `${item.id}-2`, image: "https://images.unsplash.com/photo-1542744094-3a317272018a?q=60&w=150&auto=format&fit=crop", title: `${item.name} Doc 2` },
            { id: `${item.id}-3`, image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=60&w=150&auto=format&fit=crop", title: `${item.name} Doc 3` },
          ],
        });
      }
    }

    return result;
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const newFolder: DocFolderItem = {
      id: `f-${Date.now()}`,
      name: newFolderName.trim(),
      fileCount: 0,
    };

    setFolders((prev) => [...prev, newFolder]);
    setSelectedFolderId(newFolder.id);
    setNewFolderName("");
    setShowCreateFolderModal(false);
  };

  const handleStartRename = (id: string, currentName: string) => {
    setRenameFolderModal({ id, currentName });
    setRenameInput(currentName);
  };

  const handleSaveRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameFolderModal || !renameInput.trim()) return;

    const renameRecursive = (items: DocFolderItem[]): DocFolderItem[] => {
      return items.map((item) => {
        if (item.id === renameFolderModal.id) {
          return { ...item, name: renameInput.trim() };
        }
        if (item.subfolders && item.subfolders.length > 0) {
          return { ...item, subfolders: renameRecursive(item.subfolders) };
        }
        return item;
      });
    };

    setFolders(renameRecursive(folders));
    setRenameFolderModal(null);
  };

  const handleDeleteFolder = (id: string, folderName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus folder "${folderName}" beserta seluruh isinya?`)) return;

    const deleteRecursive = (items: DocFolderItem[]): DocFolderItem[] => {
      return items
        .filter((item) => item.id !== id)
        .map((item) => {
          if (item.subfolders && item.subfolders.length > 0) {
            return { ...item, subfolders: deleteRecursive(item.subfolders) };
          }
          return item;
        });
    };

    setFolders(deleteRecursive(folders));
    if (selectedFolderId === id) {
      setSelectedFolderId("f-1");
    }
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

  // Tree View Helper Component: Document File Item in Tree
  const renderTreeDocItem = (docItem: DocFileItem, depth: number) => {
    const isDocSelected = selectedDocId === docItem.id;
    return (
      <div
        key={docItem.id}
        onClick={(e) => {
          e.stopPropagation();
          openDocPreview(docItem);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: `5px 8px 5px ${12 + depth * 16 + 14}px`,
          borderRadius: 6,
          background: isDocSelected ? "rgba(109, 40, 217, 0.12)" : "transparent",
          color: isDocSelected ? "#6d28d9" : "#475569",
          fontSize: 12,
          fontWeight: isDocSelected ? 600 : 400,
          cursor: "pointer",
          transition: "all 0.12s ease",
          marginTop: 1,
        }}
        onMouseEnter={(e) => {
          if (!isDocSelected) e.currentTarget.style.background = "#f1f5f9";
        }}
        onMouseLeave={(e) => {
          if (!isDocSelected) e.currentTarget.style.background = "transparent";
        }}
      >
        <FileText width={13} height={13} style={{ color: isDocSelected ? "#6d28d9" : "#94a3b8", flexShrink: 0 }} />
        <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", flex: 1 }}>
          {docItem.title}
        </span>
      </div>
    );
  };

  const getAllFolderIds = (items: DocFolderItem[]): Set<string> => {
    const set = new Set<string>();
    const traverse = (list: DocFolderItem[]) => {
      for (const item of list) {
        set.add(item.id);
        if (item.subfolders && item.subfolders.length > 0) {
          traverse(item.subfolders);
        }
      }
    };
    traverse(items);
    return set;
  };

  // Tree View Helper Component: Folder Node in Tree
  const renderTreeFolder = (folder: DocFolderItem, depth = 0) => {
    const subfolders = folder.subfolders || [];
    const validFolderIds = getAllFolderIds(folders);

    const folderFiles = docs.filter((d) => {
      if (folder.id === "f-1") {
        return !d.folder_id || d.folder_id === "f-1" || !validFolderIds.has(d.folder_id);
      }
      return d.folder_id === folder.id;
    });

    const hasChildren = subfolders.length > 0 || folderFiles.length > 0;
    const isExpanded = expandedFolders[folder.id] ?? true;
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
            {hasChildren ? (
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
            {getFolderFileCount(folder.id)}
          </span>
        </div>

        {hasChildren && isExpanded && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {subfolders.map((sub) => renderTreeFolder(sub, depth + 1))}
            {folderFiles.map((docFile) => renderTreeDocItem(docFile, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="docs-view-container" style={{ padding: "20px 24px 40px", maxWidth: 1360, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
      <style>{`
        @media (max-width: 900px) {
          .docs-columns-wrapper {
            flex-direction: column !important;
            gap: 20px !important;
          }
          .docs-sidebar-pane {
            width: 100% !important;
          }
          .docs-folders-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)) !important;
          }
          .docs-table-container {
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch;
          }
          .docs-table-container table {
            min-width: 650px !important;
          }
        }

        @media (max-width: 600px) {
          .docs-view-container {
            padding: 12px 16px 30px !important;
          }
          .docs-header-bar {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
          .docs-buttons-group {
            width: 100% !important;
            justify-content: flex-start !important;
            gap: 8px !important;
          }
          .docs-buttons-group button {
            flex: 1 !important;
            padding: 8px 10px !important;
            font-size: 12px !important;
            justify-content: center !important;
          }
          .docs-folders-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      
      {/* 2 Main Columns Layout: Left Knowledge Base Sidebar (280px), Right Explorer Area (Flex 1) */}
      <div className="docs-columns-wrapper" style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        
        {/* SISI KIRI: Knowledge Base Sidebar */}
        <div
          className="docs-sidebar-pane"
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
          {/* Header Title */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
              <span>Knowledge Base</span>
            </h3>
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

        {/* AREA UTAMA KANAN: Explorer Area */}
        <div className="docs-explorer-pane" style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
          
          {/* Header Action & Selection Bar */}
          <div className="docs-header-bar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <span>{currentFolder.name}</span>
                <ChevronDown width={16} height={16} style={{ color: "#64748b" }} />
              </h2>
            </div>

            <div className="docs-buttons-group" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
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
                <span>Urai dengan AI</span>
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

          {/* SECTION 1: Folders Grid (dengan Tombol Titik 3 Menu Context) */}
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 16px 0" }}>
              Folders
            </h3>
            <div className="docs-folders-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 16 }}>
              {getGridFolders(folders).map((fItem) => (
                <div key={fItem.id} style={{ position: "relative", zIndex: 1 }}>
                  {/* Tombol Titik 3 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuFolderId(activeMenuFolderId === fItem.id ? null : fItem.id);
                    }}
                    title="Opsi Folder"
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      zIndex: 35,
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "#ffffff",
                      border: "1.5px solid #d8b4fe",
                      color: "#6d28d9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(109, 40, 217, 0.15)",
                    }}
                  >
                    <MoreVertical width={14} height={14} />
                  </button>

                  {/* Context Menu Dropdown */}
                  {activeMenuFolderId === fItem.id && (
                    <div
                      style={{
                        position: "absolute",
                        top: 42,
                        right: 10,
                        zIndex: 100,
                        background: "#ffffff",
                        borderRadius: 12,
                        padding: 6,
                        boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                        border: "1px solid #e2e8f0",
                        minWidth: 160,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuFolderId(null);
                          handleStartRename(fItem.id, fItem.name);
                        }}
                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#334155", background: "none", border: "none", cursor: "pointer" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#faf5ff")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                      >
                        <Edit3 width={14} height={14} style={{ color: "#6d28d9" }} />
                        <span>Ubah Nama</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuFolderId(null);
                          setSelectedFolderId(fItem.id);
                          startNewDoc();
                        }}
                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#334155", background: "none", border: "none", cursor: "pointer" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#faf5ff")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                      >
                        <Plus width={14} height={14} style={{ color: "#059669" }} />
                        <span>Buat Dokumen</span>
                      </button>

                      <div style={{ height: 1, background: "#f1f5f9", margin: "2px 0" }} />

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuFolderId(null);
                          handleDeleteFolder(fItem.id, fItem.name);
                        }}
                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                      >
                        <Trash2 width={14} height={14} />
                        <span>Hapus Folder</span>
                      </button>
                    </div>
                  )}

                  <div onClick={() => setSelectedFolderId(fItem.id)}>
                    <AnimatedFolder
                      title={fItem.name}
                      subtitle={fItem.files}
                      projects={fItem.projects}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: Files & Documents List (Filter Sesuai Folder Aktif) */}
          <div style={{ marginTop: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                Files & Documents ({currentFolder.name})
              </h3>
              <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                {currentFolderDocs.length} Berkas Ditemukan
              </span>
            </div>

            {currentFolderDocs.length === 0 ? (
              <div
                style={{
                  padding: "40px 24px",
                  background: "#ffffff",
                  borderRadius: 16,
                  border: "1px dashed #cbd5e1",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  textAlign: "center",
                }}
              >
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(109, 40, 217, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#6d28d9" }}>
                  <Folder width={24} height={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", margin: "0 0 4px 0" }}>
                    Belum ada berkas di folder "{currentFolder.name}"
                  </h4>
                  <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                    Buat dokumen baru untuk menambahkan berkas ke dalam folder ini.
                  </p>
                </div>
                <button
                  onClick={startNewDoc}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700, background: "var(--v)", color: "#ffffff", border: "none", cursor: "pointer", boxShadow: "0 4px 12px rgba(109, 40, 217, 0.25)" }}
                >
                  <Plus width={14} height={14} />
                  <span>Buat Dokumen Pertama</span>
                </button>
              </div>
            ) : (
              <div
                className="docs-table-container"
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
                    {currentFolderDocs.map((doc) => {
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
            )}
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

      {/* RENAME FOLDER MODAL */}
      {renameFolderModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.45)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
          <div style={{ background: "#ffffff", borderRadius: 16, padding: 24, width: "100%", maxWidth: 420, border: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "0 0 14px 0" }}>Ubah Nama Folder</h3>
            <form onSubmit={handleSaveRename} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input
                type="text"
                autoFocus
                required
                value={renameInput}
                onChange={(e) => setRenameInput(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 13, outline: "none", boxSizing: "border-box" }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" onClick={() => setRenameFolderModal(null)} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "none", border: "1px solid #cbd5e1", color: "#475569" }}>
                  Batal
                </button>
                <button type="submit" style={{ padding: "8px 18px", borderRadius: 8, fontSize: 12, fontWeight: 700, background: "var(--v)", color: "#ffffff", border: "none", cursor: "pointer" }}>
                  Simpan Nama
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
