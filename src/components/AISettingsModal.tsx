"use client";

import React, { useState, useEffect } from "react";
import { X, Sparkles, Cpu, Check, Key, Globe, Layers, Bot, Search, Code, CheckSquare, ArrowRight, Settings2 } from "lucide-react";

interface AISettingsModalProps {
  onClose: () => void;
}

export default function AISettingsModal({ onClose }: AISettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"pipeline" | "model">("pipeline");

  // Model settings state
  const [selectedModel, setSelectedModel] = useState("google/gemini-2.5-flash");
  const [customUrl, setCustomUrl] = useState("https://api.openai.com/v1");
  const [customKey, setCustomKey] = useState("");
  const [customModel, setCustomModel] = useState("gpt-4o-mini");
  const [showKey, setShowKey] = useState(false);
  const [geminiKey, setGeminiKey] = useState("");
  const [claudeKey, setClaudeKey] = useState("");

  useEffect(() => {
    setSelectedModel(localStorage.getItem("kanvexa_selected_model") || "google/gemini-2.5-flash");
    setCustomUrl(localStorage.getItem("kanvexa_custom_url") || "https://api.openai.com/v1");
    setCustomKey(localStorage.getItem("kanvexa_custom_key") || "");
    setCustomModel(localStorage.getItem("kanvexa_custom_model") || "gpt-4o-mini");
    setGeminiKey(localStorage.getItem("kanvexa_gemini_key") || "");
    setClaudeKey(localStorage.getItem("kanvexa_claude_key") || "");
  }, []);

  const handleSave = () => {
    localStorage.setItem("kanvexa_selected_model", selectedModel);
    localStorage.setItem("kanvexa_custom_url", customUrl);
    localStorage.setItem("kanvexa_custom_key", customKey);
    localStorage.setItem("kanvexa_custom_model", customModel);
    localStorage.setItem("kanvexa_gemini_key", geminiKey);
    localStorage.setItem("kanvexa_claude_key", claudeKey);
    onClose();
  };

  const models = [
    {
      id: "google/gemini-2.5-flash",
      name: "Gemini",
      description: "Model bawaan yang cepat, hemat, dan andal untuk berbagai kebutuhan pemrosesan tugas.",
    },
    {
      id: "anthropic/claude-3.5-haiku",
      name: "Claude",
      description: "Model bawaan dengan kemampuan penulisan yang terstruktur, natural, dan kontekstual.",
    },
    {
      id: "custom",
      name: "Custom API (BYOK)",
      description: "Gunakan API Key Anda sendiri untuk Membangun Agent Anda Sendiri.",
    }
  ];

  const agents = [
    {
      type: "researcher",
      icon: <Search size={16} />,
      name: "Agen Riset & Analisis",
      role: "Mengumpulkan Ide & Informasi",
      shortLabel: "Riset",
      color: "#7c3aed",
      bg: "#f5f3ff",
      border: "#ddd6fe",
      description: "Menganalisis judul tugas, mengumpulkan ide dan informasi awal, menyusun kerangka rencana, serta merekomendasikan kebutuhan yang diperlukan.",
      output: "Hasil Analisis, Kerangka Rencana, Daftar Kebutuhan"
    },
    {
      type: "coder",
      icon: <Code size={16} />,
      name: "Agen Pembuat Draf & Solusi",
      role: "Menyusun Draf Kerja",
      shortLabel: "Draf",
      color: "#059669",
      bg: "#ecfdf5",
      border: "#a7f3d0",
      description: "Mengambil hasil riset dari tahap sebelumnya, lalu menyusun draf solusi yang siap pakai — bisa berupa kerangka teknis, draf dokumen, proposal, maupun konten kreatif.",
      output: "Penjelasan Solusi, Draf Hasil Kerja"
    },
    {
      type: "qa",
      icon: <CheckSquare size={16} />,
      name: "Agen Peninjau & Evaluasi",
      role: "Meninjau & Menguji Hasil",
      shortLabel: "Tinjau",
      color: "#d97706",
      bg: "#fef3c7",
      border: "#fde68a",
      description: "Meninjau hasil kerja dari tahap sebelumnya, mengidentifikasi potensi kekurangan atau risiko, memberikan saran perbaikan, dan menyusun daftar pengecekan akhir.",
      output: "Temuan & Risiko, Saran Perbaikan, Daftar Pengecekan"
    }
  ];

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
      background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16
    }}>
      <div style={{
        background: "#ffffff", borderRadius: 16, width: "100%", maxWidth: 540,
        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
        overflow: "hidden", border: "1px solid #e2e8f0",
        animation: "scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        display: "flex", flexDirection: "column", maxHeight: "90vh"
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", borderBottom: "1px solid #f1f5f9"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Bot size={18} style={{ color: "var(--v)" }} />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>Pengaturan AI Agent</h3>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer", color: "#64748b",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 4, borderRadius: 6
          }}>
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex", gap: 0, borderBottom: "1px solid #f1f5f9",
          padding: "0 20px", background: "#fafbfc"
        }}>
          <button
            onClick={() => setActiveTab("pipeline")}
            style={{
              padding: "10px 16px", fontSize: 12, fontWeight: 600,
              border: "none", background: "none", cursor: "pointer",
              color: activeTab === "pipeline" ? "var(--v)" : "#64748b",
              borderBottom: activeTab === "pipeline" ? "2px solid var(--v)" : "2px solid transparent",
              display: "flex", alignItems: "center", gap: 6,
              transition: "all 0.15s ease"
            }}
          >
            <Bot size={13} />
            Pipeline Agent
          </button>
          <button
            onClick={() => setActiveTab("model")}
            style={{
              padding: "10px 16px", fontSize: 12, fontWeight: 600,
              border: "none", background: "none", cursor: "pointer",
              color: activeTab === "model" ? "var(--v)" : "#64748b",
              borderBottom: activeTab === "model" ? "2px solid var(--v)" : "2px solid transparent",
              display: "flex", alignItems: "center", gap: 6,
              transition: "all 0.15s ease"
            }}
          >
            <Settings2 size={13} />
            Model AI
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 20, overflowY: "auto", flex: 1 }}>

          {/* Tab 1: Pipeline Agent */}
          {activeTab === "pipeline" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadeIn 0.2s ease" }}>
              {/* Intro */}
              <div style={{
                background: "#f8fafc", borderRadius: 10, padding: "12px 14px",
                border: "1px solid #e2e8f0"
              }}>
                <p style={{ fontSize: 12, color: "#334155", margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
                  Kanvexa menggunakan sistem <strong style={{ color: "var(--v)" }}>Multi-Agent Collaborative Board</strong> —
                  setiap kolom bisa diisi oleh AI Agent spesifik yang saling berkolaborasi. Anda bertindak sebagai <strong>Manager/Approver</strong> yang
                  mereview output setiap agent sebelum menggeser kartu ke tahap berikutnya.
                </p>
              </div>

              {/* Pipeline Flow Visual */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 6, padding: "8px 0"
              }}>
                {agents.map((agent, i) => (
                  <React.Fragment key={agent.type}>
                    <div style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                      padding: "8px 10px", borderRadius: 10,
                      background: agent.bg, border: `1px solid ${agent.border}`,
                      minWidth: 90, textAlign: "center"
                    }}>
                      <div style={{ color: agent.color, display: "flex", alignItems: "center" }}>
                        {agent.icon}
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 700, color: agent.color, lineHeight: 1.2 }}>
                        {agent.shortLabel}
                      </span>
                    </div>
                    {i < agents.length - 1 && (
                      <ArrowRight size={14} style={{ color: "#94a3b8", flexShrink: 0 }} />
                    )}
                  </React.Fragment>
                ))}
                <ArrowRight size={14} style={{ color: "#94a3b8", flexShrink: 0 }} />
                <div style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  padding: "8px 10px", borderRadius: 10,
                  background: "#f0fdf4", border: "1px solid #bbf7d0",
                  minWidth: 60, textAlign: "center"
                }}>
                  <span style={{ fontSize: 14 }}>✅</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#16a34a", lineHeight: 1.2 }}>Done</span>
                </div>
              </div>

              {/* Agent Cards */}
              {agents.map((agent, i) => (
                <div key={agent.type} style={{
                  borderRadius: 12, border: `1px solid ${agent.border}`,
                  overflow: "hidden"
                }}>
                  {/* Agent Header */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "10px 14px", background: agent.bg
                  }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: 8,
                      background: "#ffffff", border: `1px solid ${agent.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: agent.color, flexShrink: 0
                    }}>
                      {agent.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>
                        Kolom {i + 1}: {agent.name}
                      </div>
                      <div style={{ fontSize: 10, color: "#64748b", fontWeight: 500 }}>
                        {agent.role}
                      </div>
                    </div>
                  </div>

                  {/* Agent Body */}
                  <div style={{ padding: "10px 14px", background: "#ffffff" }}>
                    <p style={{ fontSize: 11, color: "#475569", margin: "0 0 8px 0", lineHeight: 1.5 }}>
                      {agent.description}
                    </p>
                    <div style={{
                      fontSize: 10, color: "#64748b", fontWeight: 600,
                      display: "flex", alignItems: "flex-start", gap: 4
                    }}>
                      <span style={{ color: agent.color, fontWeight: 700, whiteSpace: "nowrap" }}>Output:</span>
                      <span>{agent.output}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* How to use */}
              <div style={{
                background: "#fffbeb", borderRadius: 10, padding: "10px 14px",
                border: "1px solid #fde68a", marginTop: 2
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#92400e", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
                  <Sparkles size={12} />
                  Cara Menggunakan
                </div>
                <ol style={{ fontSize: 11, color: "#78350f", margin: 0, paddingLeft: 16, lineHeight: 1.6 }}>
                  <li>Klik ikon <Bot style={{ display: "inline", verticalAlign: "middle", width: 12, height: 12 }} /> di header kolom untuk mengatur peran Agent.</li>
                  <li>Geser (drag) kartu ke kolom ber-agent — AI otomatis memproses kartu.</li>
                  <li>Review output, edit jika perlu, lalu geser ke kolom agent berikutnya.</li>
                  <li>Setelah semua agent selesai, geser kartu ke <strong>Done</strong>.</li>
                </ol>
              </div>
            </div>
          )}

          {/* Tab 2: Model AI */}
          {activeTab === "model" && (
            <div style={{ animation: "fadeIn 0.2s ease" }}>
              <p style={{ fontSize: 12, color: "#64748b", marginTop: 0, marginBottom: 16, lineHeight: 1.45 }}>
                Pilih model AI yang digunakan oleh semua Agent di board ini. Model bawaan disediakan gratis, atau gunakan API mandiri Anda secara privat.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {models.map((model) => {
                  const isSelected = selectedModel === model.id;
                  return (
                    <div
                      key={model.id}
                      onClick={() => setSelectedModel(model.id)}
                      style={{
                        border: isSelected ? "2px solid var(--v)" : "1px solid #e2e8f0",
                        borderRadius: 12, padding: "12px 14px", cursor: "pointer",
                        background: isSelected ? "#fdfdff" : "#ffffff",
                        transition: "all 0.15s ease",
                        position: "relative"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Cpu size={14} style={{ color: isSelected ? "var(--v)" : "#64748b" }} />
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{model.name}</span>
                        </div>
                      </div>
                      <p style={{ fontSize: 11, color: "#64748b", margin: 0, lineHeight: 1.4 }}>
                        {model.description}
                      </p>

                      {isSelected && (
                        <div style={{
                          position: "absolute", right: -1, bottom: -1,
                          background: "var(--v)", color: "#ffffff",
                          borderRadius: "8px 0 10px 0", width: 18, height: 18,
                          display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                          <Check size={11} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Input form for Gemini API Key */}
              {selectedModel === "google/gemini-2.5-flash" && (
                <div style={{
                  marginTop: 16, padding: 14, borderRadius: 12, border: "1px dashed #cbd5e1",
                  background: "#f8fafc", display: "flex", flexDirection: "column", gap: 8,
                  animation: "fadeIn 0.2s ease"
                }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
                    <Key size={11} /> Gemini API Key
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showKey ? "text" : "password"}
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      placeholder="Masukkan API Key Gemini Anda "
                      style={{
                        width: "100%", padding: "8px 45px 8px 10px", borderRadius: 6, fontSize: 12,
                        border: "1px solid #cbd5e1", outline: "none", color: "#334155"
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      style={{
                        position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                        background: "none", border: "none", color: "var(--v)", fontSize: 10,
                        fontWeight: 700, cursor: "pointer"
                      }}
                    >
                      {showKey ? "Sembunyi" : "Lihat"}
                    </button>
                  </div>
                  <span style={{ fontSize: 9, color: "#94a3b8", lineHeight: 1.3 }}>
                    Jika dikosongkan, aplikasi akan menggunakan API server bawaan.
                  </span>
                </div>
              )}

              {/* Input form for Claude API Key */}
              {selectedModel === "anthropic/claude-3.5-haiku" && (
                <div style={{
                  marginTop: 16, padding: 14, borderRadius: 12, border: "1px dashed #cbd5e1",
                  background: "#f8fafc", display: "flex", flexDirection: "column", gap: 8,
                  animation: "fadeIn 0.2s ease"
                }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
                    <Key size={11} /> Claude API Key
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showKey ? "text" : "password"}
                      value={claudeKey}
                      onChange={(e) => setClaudeKey(e.target.value)}
                      placeholder="Masukkan API Key Claude Anda"
                      style={{
                        width: "100%", padding: "8px 45px 8px 10px", borderRadius: 6, fontSize: 12,
                        border: "1px solid #cbd5e1", outline: "none", color: "#334155"
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      style={{
                        position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                        background: "none", border: "none", color: "var(--v)", fontSize: 10,
                        fontWeight: 700, cursor: "pointer"
                      }}
                    >
                      {showKey ? "Sembunyi" : "Lihat"}
                    </button>
                  </div>
                  <span style={{ fontSize: 9, color: "#94a3b8", lineHeight: 1.3 }}>
                    Jika dikosongkan, aplikasi akan menggunakan API server bawaan.
                  </span>
                </div>
              )}

              {/* Custom API Inputs */}
              {selectedModel === "custom" && (
                <div style={{
                  marginTop: 16, padding: 14, borderRadius: 12, border: "1px dashed #cbd5e1",
                  background: "#f8fafc", display: "flex", flexDirection: "column", gap: 12,
                  animation: "fadeIn 0.2s ease"
                }}>
                  <h4 style={{ margin: "0 0 4px 0", fontSize: 12, fontWeight: 700, color: "#334155" }}>
                    Konfigurasi API Mandiri (BYOK)
                  </h4>

                  <div>
                    <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, color: "#475569", marginBottom: 4, textTransform: "uppercase" }}>
                      <Globe size={11} /> API Base URL
                    </label>
                    <input
                      type="text"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder="https://api.groq.com/openai/v1"
                      style={{
                        width: "100%", padding: "8px 10px", borderRadius: 6, fontSize: 12,
                        border: "1px solid #cbd5e1", outline: "none", color: "#334155"
                      }}
                    />
                    <span style={{ fontSize: 9, color: "#94a3b8", marginTop: 2, display: "block" }}>
                      Gunakan URL endpoint yang kompatibel dengan format OpenAI.
                    </span>
                  </div>

                  <div>
                    <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, color: "#475569", marginBottom: 4, textTransform: "uppercase" }}>
                      <Key size={11} /> API Key
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showKey ? "text" : "password"}
                        value={customKey}
                        onChange={(e) => setCustomKey(e.target.value)}
                        placeholder="Masukkan API Key Anda..."
                        style={{
                          width: "100%", padding: "8px 45px 8px 10px", borderRadius: 6, fontSize: 12,
                          border: "1px solid #cbd5e1", outline: "none", color: "#334155"
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        style={{
                          position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                          background: "none", border: "none", color: "var(--v)", fontSize: 10,
                          fontWeight: 700, cursor: "pointer"
                        }}
                      >
                        {showKey ? "Sembunyi" : "Lihat"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, color: "#475569", marginBottom: 4, textTransform: "uppercase" }}>
                      <Layers size={11} /> Nama Model AI
                    </label>
                    <input
                      type="text"
                      value={customModel}
                      onChange={(e) => setCustomModel(e.target.value)}
                      placeholder="llama-3.3-70b-versatile"
                      style={{
                        width: "100%", padding: "8px 10px", borderRadius: 6, fontSize: 12,
                        border: "1px solid #cbd5e1", outline: "none", color: "#334155"
                      }}
                    />
                    <span style={{ fontSize: 9, color: "#94a3b8", marginTop: 2, display: "block" }}>
                      Contoh: <code>llama-3.3-70b-versatile</code>, <code>gpt-4o-mini</code>, dll.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", justifyContent: "flex-end", gap: 8,
          padding: "12px 20px", borderTop: "1px solid #f1f5f9", background: "#f8fafc"
        }}>
          <button
            onClick={onClose}
            style={{
              padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: "#ffffff", border: "1px solid #cbd5e1", color: "#334155",
              cursor: "pointer"
            }}
          >
            {activeTab === "pipeline" ? "Tutup" : "Batal"}
          </button>
          {activeTab === "model" && (
            <button
              onClick={handleSave}
              style={{
                padding: "7px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: "var(--v)", border: "none", color: "#ffffff",
                cursor: "pointer", boxShadow: "0 2px 6px rgba(109,40,217,0.2)"
              }}
            >
              Simpan Pilihan
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scaleUp {
          from { transform: scale(0.96); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
