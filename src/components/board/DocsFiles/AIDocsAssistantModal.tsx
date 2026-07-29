"use client";

import { useState } from "react";
import { X, Sparkles, FileText, FileSearch, Wand2, Check, RotateCw } from "lucide-react";
import { DocCategory, AIDocResponse } from "./docsfiles-utils";

interface Props {
  initialContent?: string;
  onApplyResult: (result: AIDocResponse["data"]) => void;
  onClose: () => void;
}

export default function AIDocsAssistantModal({ initialContent = "", onApplyResult, onClose }: Props) {
  const [action, setAction] = useState<"generate_doc" | "summarize_doc" | "improve_doc">("generate_doc");
  const [category, setCategory] = useState<DocCategory>("PRD");
  const [prompt, setPrompt] = useState("");
  const [content, setContent] = useState(initialContent);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRunAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && !content.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/API/ai-docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          prompt: prompt.trim(),
          currentContent: content.trim(),
          category,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson?.error || "Gagal memproses dokumen dengan AI.");
      }

      const result: AIDocResponse = await res.json();
      onApplyResult(result.data);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Terjadi kesalahan pada Kanvexa AI.");
    } finally {
      setLoading(false);
    }
  };

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
        zIndex: 1000,
        padding: 16,
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: 20,
          width: "100%",
          maxWidth: 580,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 22px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%)",
            color: "#ffffff",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles width={20} height={20} style={{ color: "#fef08a" }} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>
                Kanvexa AI Document Assistant
              </h3>
              <p style={{ fontSize: 12, opacity: 0.85, margin: 0 }}>
                Generasi PRD, Rangkuman Berkas, dan Penyempurnaan Dokumen Otomatis.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#ffffff",
              opacity: 0.8,
              padding: 4,
            }}
          >
            <X width={20} height={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleRunAI} style={{ padding: 22, display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Action Mode Selector */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 8 }}>
              Pilih Kemampuan AI
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              <button
                type="button"
                onClick={() => setAction("generate_doc")}
                style={{
                  padding: "10px 8px",
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  border: action === "generate_doc" ? "2px solid #6d28d9" : "1px solid #cbd5e1",
                  background: action === "generate_doc" ? "rgba(109, 40, 217, 0.1)" : "#f8fafc",
                  color: action === "generate_doc" ? "#6d28d9" : "#64748b",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <FileText width={16} height={16} />
                <span>Buat Draft Doc</span>
              </button>

              <button
                type="button"
                onClick={() => setAction("summarize_doc")}
                style={{
                  padding: "10px 8px",
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  border: action === "summarize_doc" ? "2px solid #2563eb" : "1px solid #cbd5e1",
                  background: action === "summarize_doc" ? "rgba(37, 99, 235, 0.1)" : "#f8fafc",
                  color: action === "summarize_doc" ? "#2563eb" : "#64748b",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <FileSearch width={16} height={16} />
                <span>Rangkum Doc</span>
              </button>

              <button
                type="button"
                onClick={() => setAction("improve_doc")}
                style={{
                  padding: "10px 8px",
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  border: action === "improve_doc" ? "2px solid #059669" : "1px solid #cbd5e1",
                  background: action === "improve_doc" ? "rgba(16, 185, 129, 0.1)" : "#f8fafc",
                  color: action === "improve_doc" ? "#059669" : "#64748b",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Wand2 width={16} height={16} />
                <span>Sempurnakan</span>
              </button>
            </div>
          </div>

          {/* Category Selector (For generate_doc) */}
          {action === "generate_doc" && (
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                Kategori Dokumen Target
              </label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                  background: "#f8fafc",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#0f172a",
                  outline: "none",
                }}
              >
                <option value="PRD">PRD (Product Requirement Document)</option>
                <option value="Meeting Notes">Catatan Rapat (Meeting Notes)</option>
                <option value="Briefing">Briefing Tim (Briefing)</option>
                <option value="Technical Spec">Spesifikasi Teknis (Technical Spec)</option>
                <option value="General">Umum (General)</option>
              </select>
            </div>
          )}

          {/* Prompt Input */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
              {action === "generate_doc"
                ? "Topik atau Inti Dokumen yang Ingin Dibuat"
                : action === "summarize_doc"
                ? "Instruksi Rangkuman Tambahan (Opsional)"
                : "Instruksi Penyempurnaan (Misal: Perbaiki struktur & buat bullet point)"}
            </label>
            <input
              type="text"
              placeholder={
                action === "generate_doc"
                  ? "Contoh: PRD Fitur Sistem Autentikasi OAuth2 dan Role Permission"
                  : "Contoh: Fokus pada poin kunci teknis dan jadwal"
              }
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #cbd5e1",
                fontSize: 13,
                outline: "none",
                background: "#f8fafc",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Context Content (For summarize or improve) */}
          {(action === "summarize_doc" || action === "improve_doc" || content.trim()) && (
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                Isi Dokumen / Teks Mentah yang Diproses
              </label>
              <textarea
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tempelkan teks atau dokumen mentah di sini..."
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 10,
                  fontSize: 13,
                  border: "1px solid #cbd5e1",
                  outline: "none",
                  background: "#f8fafc",
                  color: "#0f172a",
                  resize: "vertical",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />
            </div>
          )}

          {error && (
            <div style={{ fontSize: 12, color: "#ef4444", fontWeight: 600 }}>
              ⚠️ {error}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: "9px 16px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                background: "none",
                border: "1px solid #cbd5e1",
                color: "#475569",
                cursor: "pointer",
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || (!prompt.trim() && !content.trim())}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 20px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                background: "var(--v)",
                color: "#ffffff",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading || (!prompt.trim() && !content.trim()) ? 0.6 : 1,
                boxShadow: "0 4px 12px rgba(109, 40, 217, 0.3)",
              }}
            >
              {loading ? <RotateCw width={14} height={14} className="animate-spin" /> : <Sparkles width={14} height={14} />}
              <span>{loading ? "Memproses AI..." : "✦ Urai dengan AI"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
