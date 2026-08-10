"use client";

import { useState, useEffect } from "react";
import { Sparkles, Bot, Save, FileText, CheckSquare, Edit3, Eye, Code } from "lucide-react";
import { updateCardDescription, updateCardTitle } from "@/app/board/[id]/actions";
import { processCardWithAgent } from "@/lib/ai-client";
import { showAlert } from "@/lib/swal";

interface Props {
  id: string;
  boardId: string;
  title: string;
  description: string;
  onClose: () => void;
  canEdit: boolean;
}

// Simple client-side Markdown parser to avoid external dependencies
function renderMarkdown(md: string) {
  if (!md) return <p style={{ color: "var(--text-3)", fontStyle: "italic", fontSize: 13 }}>Belum ada deskripsi. Geser kartu ke kolom AI Agent atau tulis manual untuk mengisi.</p>;

  const lines = md.split("\n");
  let inCodeBlock = false;
  let codeContent: string[] = [];
  const renderedElements: React.ReactNode[] = [];

  lines.forEach((line, index) => {
    // Code block check
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        // End of code block
        inCodeBlock = false;
        renderedElements.push(
          <pre key={`code-${index}`} style={{
            background: "#1e293b",
            color: "#e2e8f0",
            padding: "14px",
            borderRadius: "10px",
            overflowX: "auto",
            fontSize: "12px",
            fontFamily: "var(--font-mono, monospace)",
            margin: "12px 0",
            border: "1px solid #334155"
          }}>
            <code>{codeContent.join("\n")}</code>
          </pre>
        );
        codeContent = [];
      } else {
        // Start of code block
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeContent.push(line);
      return;
    }

    const trimmed = line.trim();

    // Headings
    if (trimmed.startsWith("### ")) {
      renderedElements.push(<h3 key={index} style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-1)", marginTop: "18px", marginBottom: "8px", borderBottom: "1px solid var(--border)", paddingBottom: "4px" }}>{trimmed.slice(4)}</h3>);
      return;
    }
    if (trimmed.startsWith("## ")) {
      renderedElements.push(<h2 key={index} style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-1)", marginTop: "22px", marginBottom: "10px" }}>{trimmed.slice(3)}</h2>);
      return;
    }
    if (trimmed.startsWith("# ")) {
      renderedElements.push(<h1 key={index} style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-1)", marginTop: "24px", marginBottom: "12px" }}>{trimmed.slice(2)}</h1>);
      return;
    }

    // Checkboxes / Tasks
    if (trimmed.startsWith("- [ ] ") || trimmed.startsWith("- [x] ") || trimmed.startsWith("- [X] ")) {
      const checked = trimmed.startsWith("- [x] ") || trimmed.startsWith("- [X] ");
      const text = trimmed.slice(6);
      renderedElements.push(
        <div key={index} style={{ display: "flex", alignItems: "center", gap: "8px", margin: "4px 0", fontSize: "13px", color: "var(--text-1)" }}>
          <input type="checkbox" checked={checked} readOnly style={{ accentColor: "var(--v)" }} />
          <span style={{ textDecoration: checked ? "line-through" : "none", opacity: checked ? 0.6 : 1 }}>{text}</span>
        </div>
      );
      return;
    }

    // Bullet lists
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      renderedElements.push(
        <li key={index} style={{ marginLeft: "16px", fontSize: "13px", color: "var(--text-2)", margin: "4px 0" }}>
          {trimmed.slice(2)}
        </li>
      );
      return;
    }

    // Empty line
    if (!trimmed) {
      renderedElements.push(<div key={index} style={{ height: "8px" }} />);
      return;
    }

    // Normal paragraph
    renderedElements.push(
      <p key={index} style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: "1.6", margin: "6px 0", wordBreak: "break-word" }}>
        {trimmed}
      </p>
    );
  });

  return <div style={{ fontFamily: "inherit" }}>{renderedElements}</div>;
}

export default function CardDetailsModal({ id, boardId, title, description, onClose, canEdit }: Props) {
  const [activeTab, setActiveTab] = useState<"preview" | "edit">("preview");
  const [descText, setDescText] = useState(description || "");
  const [cardTitle, setCardTitle] = useState(title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiRunning, setAiRunning] = useState(false);
  const [aiAgent, setAiAgent] = useState<"researcher" | "coder" | "qa" | "none">("none");

  useEffect(() => {
    setDescText(description || "");
    setCardTitle(title);
  }, [description, title]);

  const handleSaveDescription = async () => {
    setSaving(true);
    try {
      await updateCardDescription(boardId, id, descText);
      showAlert("Sukses", "Deskripsi berhasil disimpan!", "success");
    } catch (err: any) {
      showAlert("Gagal", err.message || "Gagal menyimpan deskripsi", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTitle = async () => {
    if (!cardTitle.trim() || cardTitle.trim() === title) {
      setCardTitle(title);
      setIsEditingTitle(false);
      return;
    }
    setSaving(true);
    try {
      await updateCardTitle(boardId, id, cardTitle.trim());
      setIsEditingTitle(false);
    } catch (err: any) {
      showAlert("Gagal", err.message || "Gagal memperbarui judul", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleRunAgent = async (agent: "researcher" | "coder" | "qa") => {
    setAiAgent(agent);
    setAiRunning(true);
    try {
      const res = await processCardWithAgent(cardTitle, descText, agent, "");
      if (res.success && res.content) {
        setDescText(res.content);
        await updateCardDescription(boardId, id, res.content);
        setActiveTab("preview");
        showAlert("AI Sukses", `Agen ${agent} selesai memproses kartu!`, "success");
      } else {
        showAlert("AI Gagal", res.error || "Gagal memproses dengan agen.", "error");
      }
    } catch (err) {
      showAlert("Error", "Gagal memproses dengan AI Agent.", "error");
    } finally {
      setAiAgent("none");
      setAiRunning(false);
    }
  };

  return (
    <div 
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
    >
      <div style={{
        background: "var(--card)",
        border: "1px solid var(--border-strong)",
        borderRadius: 16,
        width: "100%",
        maxWidth: 700,
        height: "80vh",
        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        animation: "modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      }}>
        {/* Header Title */}
        <div style={{
          padding: "20px 24px 16px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {isEditingTitle ? (
              <input
                type="text"
                value={cardTitle}
                onChange={e => setCardTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={e => {
                  if (e.key === "Enter") handleSaveTitle();
                  if (e.key === "Escape") { setCardTitle(title); setIsEditingTitle(false); }
                }}
                autoFocus
                style={{
                  width: "100%", fontSize: 18, fontWeight: 800, color: "var(--text-1)",
                  border: "none", borderBottom: "2px solid var(--v)", outline: "none",
                  background: "transparent", padding: "2px 0"
                }}
              />
            ) : (
              <h3 
                onDoubleClick={() => canEdit && setIsEditingTitle(true)}
                title={canEdit ? "Double click untuk edit judul" : undefined}
                style={{ fontSize: 18, fontWeight: 800, color: "var(--text-1)", margin: 0, cursor: canEdit ? "text" : "default" }}
              >
                {cardTitle}
              </h3>
            )}
            <span style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4, display: "block" }}>
              Double-click judul atau edit deskripsi Markdown di bawah.
            </span>
          </div>
          <button 
            onClick={onClose} 
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--text-3)", fontSize: 24, padding: 0, lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Tab & Action Bar (Obsidian Style) */}
        <div style={{
          padding: "8px 24px",
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10
        }}>
          {/* Preview / Edit Toggle */}
          <div style={{
            display: "flex",
            gap: 2,
            background: "rgba(0, 0, 0, 0.04)",
            padding: 2,
            borderRadius: 8,
          }}>
            <button
              onClick={() => setActiveTab("preview")}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 6, fontSize: 12,
                fontWeight: 600, border: "none",
                background: activeTab === "preview" ? "#ffffff" : "transparent",
                color: activeTab === "preview" ? "var(--v)" : "var(--text-2)",
                cursor: "pointer", transition: "all 0.15s ease", boxShadow: activeTab === "preview" ? "0 1px 3px rgba(0,0,0,0.08)" : "none"
              }}
            >
              <Eye width={12} height={12} />
              Tampilan Format
            </button>
            <button
              onClick={() => setActiveTab("edit")}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 6, fontSize: 12,
                fontWeight: 600, border: "none",
                background: activeTab === "edit" ? "#ffffff" : "transparent",
                color: activeTab === "edit" ? "var(--v)" : "var(--text-2)",
                cursor: "pointer", transition: "all 0.15s ease", boxShadow: activeTab === "edit" ? "0 1px 3px rgba(0,0,0,0.08)" : "none"
              }}
            >
              <Edit3 width={12} height={12} />
              Edit Teks
            </button>
          </div>

          {/* AI Quick actions */}
          {canEdit && (
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase" }}>Urai dengan Agen:</span>
              <button
                onClick={() => handleRunAgent("researcher")}
                disabled={aiRunning}
                style={{
                  padding: "5px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                  background: "#f5f3ff", border: "1px solid #ddd6fe", color: "var(--v)", cursor: aiRunning ? "wait" : "pointer",
                  display: "flex", alignItems: "center", gap: 4
                }}
              >
                <Bot width={12} height={12} />
                Riset & Analisis
              </button>
              <button
                onClick={() => handleRunAgent("coder")}
                disabled={aiRunning}
                style={{
                  padding: "5px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                  background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#059669", cursor: aiRunning ? "wait" : "pointer",
                  display: "flex", alignItems: "center", gap: 4
                }}
              >
                <Code width={12} height={12} />
                Draf & Solusi
              </button>
              <button
                onClick={() => handleRunAgent("qa")}
                disabled={aiRunning}
                style={{
                  padding: "5px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                  background: "#fef3c7", border: "1px solid #fde68a", color: "#d97706", cursor: aiRunning ? "wait" : "pointer",
                  display: "flex", alignItems: "center", gap: 4
                }}
              >
                <CheckSquare width={12} height={12} />
                Review & Evaluasi
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, padding: "24px", overflowY: "auto", background: activeTab === "preview" ? "#ffffff" : "#f8fafc" }}>
          {aiRunning ? (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12
            }}>
              <div className="agent-thinking-spinner" style={{
                width: 36, height: 36, borderRadius: "50%", border: "3px solid #e2e8f0", borderTopColor: "var(--v)",
                animation: "spin 1s linear infinite"
              }} />
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", margin: 0 }}>
                Agen {aiAgent === "researcher" ? "Researcher" : aiAgent === "coder" ? "Coder" : "QA"} sedang menganalisis & menulis...
              </p>
              <span style={{ fontSize: 11, color: "var(--text-3)" }}>Membaca judul dan menyusun konten Markdown...</span>
            </div>
          ) : activeTab === "preview" ? (
            <div style={{ maxWidth: "100%" }}>
              {renderMarkdown(descText)}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 12 }}>
              <textarea
                value={descText}
                onChange={e => setDescText(e.target.value)}
                placeholder="Tulis deskripsi kartu dalam Markdown..."
                style={{
                  flex: 1, width: "100%", padding: "16px", borderRadius: 10, fontSize: 13,
                  border: "1px solid var(--border-strong)", outline: "none",
                  background: "#ffffff", color: "#0f172a",
                  fontFamily: "var(--font-mono, monospace)", lineHeight: 1.6, resize: "none"
                }}
              />
              {canEdit && (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={handleSaveDescription}
                    disabled={saving}
                    style={{
                      padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                      background: "var(--v)", color: "#fff", border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 6, boxShadow: "0 2px 8px rgba(109,40,217,0.2)"
                    }}
                  >
                    <Save width={14} height={14} />
                    {saving ? "Menyimpan..." : "Simpan Deskripsi"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
