"use client";

import React, { useState, useEffect } from "react";
import { X, Sparkles, Cpu, Check, Key, Globe, Layers } from "lucide-react";

interface AISettingsModalProps {
  onClose: () => void;
}

export default function AISettingsModal({ onClose }: AISettingsModalProps) {
  const [selectedModel, setSelectedModel] = useState("google/gemini-2.5-flash");
  const [customUrl, setCustomUrl] = useState("https://api.openai.com/v1");
  const [customKey, setCustomKey] = useState("");
  const [customModel, setCustomModel] = useState("gpt-4o-mini");
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    setSelectedModel(localStorage.getItem("kanvexa_selected_model") || "google/gemini-2.5-flash");
    setCustomUrl(localStorage.getItem("kanvexa_custom_url") || "https://api.openai.com/v1");
    setCustomKey(localStorage.getItem("kanvexa_custom_key") || "");
    setCustomModel(localStorage.getItem("kanvexa_custom_model") || "gpt-4o-mini");
  }, []);

  const handleSave = () => {
    localStorage.setItem("kanvexa_selected_model", selectedModel);
    localStorage.setItem("kanvexa_custom_url", customUrl);
    localStorage.setItem("kanvexa_custom_key", customKey);
    localStorage.setItem("kanvexa_custom_model", customModel);
    onClose();
  };

  const models = [
    {
      id: "google/gemini-2.5-flash",
      name: "Gemini 2.5 Flash",
      description: "Model bawaan gratis, sangat cepat, hemat, dan andal untuk penggunaan umum.",
      badge: "Gratis & Cepat",
      badgeColor: "#6366f1",
      badgeBg: "#e0e7ff"
    },
    {
      id: "anthropic/claude-3.5-haiku",
      name: "Claude 3.5 Haiku",
      description: "Model bawaan gratis dari Anthropic dengan tata bahasa luwes dan responsif.",
      badge: "Gratis & Luwes",
      badgeColor: "#d97706",
      badgeBg: "#fef3c7"
    },
    {
      id: "custom",
      name: "Custom API (BYOK)",
      description: "Gunakan API Key Anda sendiri untuk menghubungkan Groq, DeepSeek, Minimax, Kiro, atau Ollama lokal.",
      badge: "Kustom / Mandiri",
      badgeColor: "#7c3aed",
      badgeBg: "#f3e8ff"
    }
  ];

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
      background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16
    }}>
      <div style={{
        background: "#ffffff", borderRadius: 16, width: "100%", maxWidth: 480,
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
            <Sparkles size={18} style={{ color: "var(--v)" }} />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>Pengaturan Model AI</h3>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer", color: "#64748b",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 4, borderRadius: 6
          }}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 20, overflowY: "auto", flex: 1 }}>
          <p style={{ fontSize: 12, color: "#64748b", marginTop: 0, marginBottom: 16, lineHeight: 1.45 }}>
            Pilih kecerdasan buatan (AI) yang ingin Anda gunakan. Model bawaan disediakan gratis, atau gunakan API mandiri Anda secara privat.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: selectedModel === "custom" ? 16 : 0 }}>
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
                    <span style={{
                      fontSize: 9, fontWeight: 700, color: model.badgeColor,
                      background: model.badgeBg, padding: "2px 6px", borderRadius: 4
                    }}>
                      {model.badge}
                    </span>
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
                  Contoh: <code>llama-3.3-70b-versatile</code> (Groq), <code>gpt-4o-mini</code> (OpenAI), dll.
                </span>
              </div>
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
            Batal
          </button>
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
