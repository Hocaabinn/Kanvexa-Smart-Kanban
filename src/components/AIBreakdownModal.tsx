"use client";

import { useState, useEffect } from "react";
import { insertAIBreakdown } from "../app/board/[id]/actions";

interface Props {
  boardId: string;
  onClose: () => void;
  onDone: () => void;
}

const STEPS = [
  { id: 1, label: "Query Rewrite", desc: "Menganalisis dan menyusun ulang perintah..." },
  { id: 2, label: "Classify Agent", desc: "Mengklasifikasikan tugas dengan AI..." },
  { id: 3, label: "Router & Mapper", desc: "Mencocokkan kolom & memetakan struktur Kanban..." },
  { id: 4, label: "Database Sync", desc: "Sinkronisasi seluruh kartu tugas ke database..." },
];

export default function AIBreakdownModal({ boardId, onClose, onDone }: Props) {
  const [prompt, setPrompt] = useState("");
  const [clearExisting, setClearExisting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Fake progressive loading timer for steps 1-3
  useEffect(() => {
    if (!loading) {
      setCurrentStep(0);
      return;
    }

    setCurrentStep(1);

    const t2 = setTimeout(() => {
      setCurrentStep(2);
    }, 1500);

    const t3 = setTimeout(() => {
      setCurrentStep(3);
    }, 3200);

    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Fetch breakdown from the API endpoint
      const res = await fetch("/API/ai-breakdown", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ goal: trimmed }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData?.error || "Gagal menghubungi AI.");
      }

      const data = await res.json();
      if (!data.columns || !Array.isArray(data.columns)) {
        throw new Error("Format hasil AI tidak valid.");
      }

      // 2. Insert the breakdown into Supabase
      await insertAIBreakdown(boardId, data.columns, clearExisting);
      
      // Step 4 is successful database sync
      setCurrentStep(4);
      
      // Delay slightly so user sees the completed state
      setTimeout(() => {
        onDone();
      }, 1000);

    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Terjadi kesalahan saat mengurai rencana kerja dengan AI.");
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(15, 23, 42, 0.45)",
      backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000,
      padding: "20px",
    }}>
      <div style={{
        background: "var(--card)",
        border: "1px solid var(--border-strong)",
        borderRadius: 16,
        width: "100%",
        maxWidth: 580, // Expanded width for the workflow nodes canvas
        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        animation: "modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 24px 16px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
            Urai dengan AI
          </h3>
          <button 
            onClick={onClose} 
            disabled={loading}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--text-3)", fontSize: 20, padding: 0, lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Loading/Progress workflow state */}
        {loading ? (
          <div style={{ padding: "24px", display: "flex", flexDirection: "column", alignItems: "stretch" }}>
            {/* Visual Dotted Canvas Background (n8n Style) */}
            <div className="workflow-canvas" style={{
              height: 240,
              background: "#0b0f19",
              backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.08) 1.2px, transparent 1.2px)",
              backgroundSize: "16px 16px",
              position: "relative",
              borderRadius: 12,
              border: "1px solid #1e293b",
              overflow: "hidden",
              marginBottom: 20,
              boxShadow: "inset 0 2px 8px rgba(0, 0, 0, 0.8)",
            }}>
              {/* SVG Connecting Paths */}
              <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1 }}>
                <defs>
                  <linearGradient id="activeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Path 1: Query Rewrite -> Classify */}
                <path d="M 140 120 L 175 120" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="2" fill="none" />
                {currentStep === 1 && (
                  <path d="M 140 120 L 175 120" stroke="url(#activeGrad)" strokeWidth="2.5" fill="none" strokeDasharray="6 12" className="path-flow" filter="url(#glow)" />
                )}
                {currentStep > 1 && (
                  <path d="M 140 120 L 175 120" stroke="#10B981" strokeWidth="2" fill="none" />
                )}

                {/* Path 2: Classify -> Router */}
                <path d="M 260 120 L 290 120" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="2" fill="none" />
                {currentStep === 2 && (
                  <path d="M 260 120 L 290 120" stroke="url(#activeGrad)" strokeWidth="2.5" fill="none" strokeDasharray="6 12" className="path-flow" filter="url(#glow)" />
                )}
                {currentStep > 2 && (
                  <path d="M 260 120 L 290 120" stroke="#10B981" strokeWidth="2" fill="none" />
                )}

                {/* Path 3, 4, 5: Router Branches -> AI Breakdown */}
                {/* Branch Q&A */}
                <path d="M 390 98 C 405 98, 405 120, 420 120" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="2" fill="none" />
                {currentStep === 3 && (
                  <path d="M 390 98 C 405 98, 405 120, 420 120" stroke="url(#activeGrad)" strokeWidth="2.5" fill="none" strokeDasharray="6 12" className="path-flow" filter="url(#glow)" />
                )}
                {currentStep > 3 && (
                  <path d="M 390 98 C 405 98, 405 120, 420 120" stroke="#10B981" strokeWidth="2" fill="none" />
                )}

                {/* Branch Fact Finding */}
                <path d="M 390 125 C 405 125, 405 120, 420 120" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="2" fill="none" />
                {currentStep === 3 && (
                  <path d="M 390 125 C 405 125, 405 120, 420 120" stroke="url(#activeGrad)" strokeWidth="2.5" fill="none" strokeDasharray="6 12" className="path-flow" filter="url(#glow)" />
                )}
                {currentStep > 3 && (
                  <path d="M 390 125 C 405 125, 405 120, 420 120" stroke="#10B981" strokeWidth="2" fill="none" />
                )}

                {/* Branch Else */}
                <path d="M 390 157 C 405 157, 405 120, 420 120" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="2" fill="none" />
                {currentStep === 3 && (
                  <path d="M 390 157 C 405 157, 405 120, 420 120" stroke="url(#activeGrad)" strokeWidth="2.5" fill="none" strokeDasharray="6 12" className="path-flow" filter="url(#glow)" />
                )}
                {currentStep > 3 && (
                  <path d="M 390 157 C 405 157, 405 120, 420 120" stroke="#10B981" strokeWidth="2" fill="none" />
                )}
              </svg>

              {/* Node Cards */}
              {/* 1. Query Rewrite Node */}
              <div 
                className={`node-card ${currentStep === 1 ? "active" : ""} ${currentStep > 1 ? "completed" : ""}`}
                style={{ left: 20, top: 98, width: 120, height: 44 }}
              >
                <div className={`node-icon-wrapper ${currentStep > 1 ? "completed" : ""}`} style={{ color: "#a78bfa", background: "rgba(139, 92, 246, 0.15)" }}>
                  {currentStep > 1 ? "✓" : "🔍"}
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#f4f4f5", lineHeight: 1.1 }}>Query rewrite</div>
                  <div style={{ fontSize: 8, color: "#71717a" }}>Agent</div>
                </div>
              </div>

              {/* 2. Classify Node */}
              <div 
                className={`node-card ${currentStep === 2 ? "active" : ""} ${currentStep > 2 ? "completed" : ""}`}
                style={{ left: 175, top: 98, width: 85, height: 44 }}
              >
                <div className={`node-icon-wrapper ${currentStep > 2 ? "completed" : ""}`} style={{ color: "#60a5fa", background: "rgba(59, 130, 246, 0.15)" }}>
                  {currentStep > 2 ? "✓" : "{ }"}
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#f4f4f5", lineHeight: 1.1 }}>Classify</div>
                  <div style={{ fontSize: 8, color: "#71717a" }}>Agent</div>
                </div>
              </div>

              {/* 3. Router Node (If Yellow Header Stack) */}
              <div 
                className={`node-card ${currentStep === 3 ? "active" : ""} ${currentStep > 3 ? "completed" : ""}`}
                style={{ left: 290, top: 55, width: 100, height: 130, flexDirection: "column", alignItems: "stretch", padding: 0, gap: 0, overflow: "hidden" }}
              >
                <div style={{ 
                  background: currentStep > 3 ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)", 
                  color: currentStep > 3 ? "#10B981" : "#f59e0b", 
                  fontSize: 10, 
                  fontWeight: 800, 
                  padding: "6px 8px",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.08)" 
                }}>
                  If (Router)
                </div>
                <div style={{ display: "flex", flexDirection: "column", fontSize: 9, color: "#a1a1aa", fontWeight: 500 }}>
                  <div style={{ padding: "6px 8px", borderBottom: "1px solid rgba(255, 255, 255, 0.04)", background: currentStep === 3 ? "rgba(139, 92, 246, 0.1)" : "none" }}>Q&A</div>
                  <div style={{ padding: "6px 8px", borderBottom: "1px solid rgba(255, 255, 255, 0.04)", background: currentStep === 3 ? "rgba(139, 92, 246, 0.1)" : "none" }}>Fact finding</div>
                  <div style={{ padding: "6px 8px", background: currentStep === 3 ? "rgba(139, 92, 246, 0.1)" : "none" }}>Else</div>
                </div>
              </div>

              {/* 4. AI Breakdown Node */}
              <div 
                className={`node-card ${currentStep === 4 ? "active completed" : ""}`}
                style={{ left: 420, top: 98, width: 100, height: 44 }}
              >
                <div className={`node-icon-wrapper ${currentStep === 4 ? "completed" : ""}`} style={{ color: "#34d399", background: "rgba(16, 185, 129, 0.15)" }}>
                  {currentStep === 4 ? "✓" : "⚡"}
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#f4f4f5", lineHeight: 1.1 }}>Kanban Sync</div>
                  <div style={{ fontSize: 8, color: "#71717a" }}>DB Sync</div>
                </div>
              </div>
            </div>

            {/* Steps explanations */}
            <div style={{ 
              textAlign: "center", 
              background: "var(--surface)", 
              border: "1px solid var(--border)", 
              borderRadius: 12, 
              padding: "16px 20px",
              minHeight: 82 
            }}>
              <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>
                {STEPS[Math.max(1, currentStep) - 1]?.label}
              </p>
              <p style={{ 
                margin: 0, 
                fontSize: 12, 
                color: "var(--text-2)", 
                animation: currentStep < 4 ? "pulseText 1.5s infinite" : "none" 
              }}>
                {STEPS[Math.max(1, currentStep) - 1]?.desc}
              </p>
            </div>
          </div>
        ) : (
          /* Form Body */
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "20px 24px" }}>
              {error && (
                <div style={{
                  background: "#FEF2F2", border: "1px solid #FECACA",
                  borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "#DC2626",
                  marginBottom: 16, lineHeight: 1.45,
                }}>
                  {error}
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Tulis tujuan proyek atau target kamu
                </label>
                <textarea
                  required
                  disabled={loading}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="misal: Rencanakan peluncuran produk UMKM keripik pisang lokal dalam 1 bulan, termasuk pemasaran digital dan logistik."
                  rows={4}
                  style={{
                    width: "100%", padding: "12px", borderRadius: 8, fontSize: 13,
                    border: "1px solid var(--border-strong)", outline: "none",
                    background: "var(--surface)", color: "var(--text-1)",
                    fontFamily: "inherit", lineHeight: 1.5, resize: "none",
                  }}
                />
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}>
                <input
                  type="checkbox"
                  disabled={loading}
                  checked={clearExisting}
                  onChange={e => setClearExisting(e.target.checked)}
                  style={{
                    width: 16, height: 16, borderRadius: 4, accentColor: "var(--v)",
                    cursor: "pointer",
                  }}
                />
                <span style={{ fontSize: 13, color: "var(--text-2)" }}>
                  Bersihkan board saat ini sebelum mengurai (Fresh start)
                </span>
              </label>
            </div>

            {/* Footer Actions */}
            <div style={{
              padding: "16px 24px 20px",
              background: "var(--surface)",
              borderTop: "1px solid var(--border)",
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
            }}>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                style={{
                  padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                  background: "none", border: "1px solid var(--border-strong)",
                  color: "var(--text-2)", cursor: "pointer",
                }}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                style={{
                  padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                  background: "var(--v)", color: "#fff", border: "none",
                  cursor: loading || !prompt.trim() ? "not-allowed" : "pointer",
                  boxShadow: "0 2px 8px rgba(109,40,217,0.25)",
                  display: "flex", alignItems: "center", gap: 6,
                  position: "relative",
                }}
              >
                Urai Jadi Tugas
              </button>
            </div>
          </form>
        )}
      </div>

      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .node-card {
          position: absolute;
          background: #141923;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 6px 10px;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 2;
        }

        .node-card.active {
          border-color: #8b5cf6;
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.35);
          transform: translateY(-1px);
        }

        .node-card.completed {
          border-color: #10B981;
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.2);
        }

        .node-icon-wrapper {
          width: 22px;
          height: 22px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          color: #94a3b8;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .node-icon-wrapper.completed {
          background: rgba(16, 185, 129, 0.15) !important;
          color: #10B981 !important;
          font-weight: bold;
        }

        .path-flow {
          stroke-dasharray: 6 12;
          animation: flow 1.2s linear infinite;
        }

        @keyframes flow {
          from {
            stroke-dashoffset: 18;
          }
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes pulseText {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
