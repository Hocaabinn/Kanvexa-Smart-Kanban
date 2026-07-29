"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, CheckCircle2, Copy, FileText, Check, Lightbulb, AlertCircle } from "lucide-react";
import { BoardPost, BoardPostComment } from "./messageboard-utils";

interface Props {
  posts: BoardPost[];
  comments: BoardPostComment[];
  onClose: () => void;
}

interface SummaryResult {
  summary: string;
  keyPoints: string[];
  decisions: string[];
}

export default function AIMessageSummaryModal({ posts, comments, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function generateSummary() {
      if (posts.length === 0) {
        setError("Belum ada postingan untuk dirangkum oleh AI.");
        setLoading(false);
        return;
      }

      // Format all posts and comments into a cohesive string for OpenRouter API
      const formatted = posts
        .map((p) => {
          const postComments = comments.filter((c) => c.post_id === p.id);
          const commentsFormatted = postComments.length
            ? postComments.map((c) => `  - [Komentar oleh ${c.author_email}]: ${c.content}`).join("\n")
            : "  - (Belum ada komentar)";

          return `Postingan [${p.category.toUpperCase()}] "${p.title}" oleh ${p.author_email}:\n${p.content}\nKomentar:\n${commentsFormatted}`;
        })
        .join("\n\n---\n\n");

      try {
        const res = await fetch("/API/ai-message-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postsContent: formatted }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData?.error || "Gagal membuat rangkuman AI.");
        }

        const data: SummaryResult = await res.json();
        setResult(data);
      } catch (err: any) {
        console.error(err);
        setError(err?.message || "Terjadi kesalahan saat menghubungi layanan AI.");
      } finally {
        setLoading(false);
      }
    }

    generateSummary();
  }, [posts, comments]);

  function handleCopy() {
    if (!result) return;
    const text = `RINGKASAN DISKUSI AI\n\n${result.summary}\n\nPOIN UTAMA:\n${result.keyPoints
      .map((k) => `- ${k}`)
      .join("\n")}\n\nKEPUTUSAN:\n${result.decisions.map((d) => `- ${d}`).join("\n")}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

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
          maxWidth: 620,
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(109, 40, 217, 0.25)",
          border: "1.5px solid rgba(124, 58, 237, 0.3)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 24px",
            background: "linear-gradient(135deg, #6d28d9, #4c1d95)",
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
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>AI Discussion Summarizer</h2>
              <p style={{ fontSize: 12, margin: 0, opacity: 0.85 }}>
                Menganalisis dan merangkum seluruh ide & pengumuman tim
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
                  border: "4px solid rgba(124, 58, 237, 0.15)",
                  borderTopColor: "#7c3aed",
                  animation: "spin 1s linear infinite",
                }}
              />
              <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>
                AI sedang menyusun ringkasan...
              </h3>
              <p style={{ fontSize: 13, color: "#64748b" }}>
                Memproses postingan & komentar untuk menyajikan poin-poin utama.
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
          ) : result ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Executive Summary */}
              <div
                style={{
                  background: "rgba(245, 243, 255, 0.8)",
                  borderRadius: 12,
                  padding: 16,
                  border: "1px solid rgba(124, 58, 237, 0.2)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, color: "#6d28d9", fontWeight: 700, fontSize: 13 }}>
                  <FileText width={15} height={15} />
                  <span>RINGKASAN EKSEKUTIF</span>
                </div>
                <p style={{ fontSize: 14, color: "#334155", margin: 0, lineHeight: 1.55 }}>
                  {result.summary}
                </p>
              </div>

              {/* Key Points */}
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  <Lightbulb width={15} height={15} style={{ color: "#d97706" }} />
                  <span>Poin-Poin Utama</span>
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {result.keyPoints.map((point, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                        fontSize: 13,
                        color: "#334155",
                        background: "#f8fafc",
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: "1px solid var(--border)",
                      }}
                    >
                      <span style={{ color: "#7c3aed", fontWeight: 700 }}>•</span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decisions */}
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  <CheckCircle2 width={15} height={15} style={{ color: "#059669" }} />
                  <span>Keputusan & Rekomendasi</span>
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {result.decisions.map((dec, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                        fontSize: 13,
                        color: "#065f46",
                        background: "#ecfdf5",
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: "1px solid #a7f3d0",
                      }}
                    >
                      <CheckCircle2 width={15} height={15} style={{ marginTop: 2, flexShrink: 0 }} />
                      <span>{dec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        {!loading && result && (
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
            <span style={{ fontSize: 12, color: "#94a3b8" }}>
              Rangkuman dihasilkan otomatis oleh AI Kanvexa
            </span>
            <button
              onClick={handleCopy}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                background: copied ? "#059669" : "var(--v)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {copied ? <Check width={14} height={14} /> : <Copy width={14} height={14} />}
              {copied ? "Tersalin!" : "Salin Ringkasan"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
