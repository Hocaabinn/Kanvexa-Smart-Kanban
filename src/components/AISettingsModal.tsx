"use client";

import { useState, useEffect } from "react";
import { Key, Cpu, Sparkles, Check, AlertCircle } from "lucide-react";
import { showAlert } from "@/lib/swal";

interface Props {
  onClose: () => void;
}

export default function AISettingsModal({ onClose }: Props) {
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState<"gemini" | "openrouter" | "ollama">("gemini");
  const [openrouterKey, setOpenrouterKey] = useState("");
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434");
  const [ollamaModel, setOllamaModel] = useState("llama3");
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    // Load config from localStorage
    const savedKey = localStorage.getItem("kanvexa_gemini_api_key") || "";
    const savedProvider = (localStorage.getItem("kanvexa_ai_provider") as "gemini" | "openrouter" | "ollama") || "gemini";
    const savedOpenrouterKey = localStorage.getItem("kanvexa_openrouter_api_key") || "";
    const savedOllamaUrl = localStorage.getItem("kanvexa_ollama_url") || "http://localhost:11434";
    const savedOllamaModel = localStorage.getItem("kanvexa_ollama_model") || "llama3";

    setApiKey(savedKey);
    setProvider(savedProvider);
    setOpenrouterKey(savedOpenrouterKey);
    setOllamaUrl(savedOllamaUrl);
    setOllamaModel(savedOllamaModel);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem("kanvexa_ai_provider", provider);
      if (provider === "gemini") {
        localStorage.setItem("kanvexa_gemini_api_key", apiKey.trim());
      } else if (provider === "openrouter") {
        localStorage.setItem("kanvexa_openrouter_api_key", openrouterKey.trim());
      } else {
        localStorage.setItem("kanvexa_ollama_url", ollamaUrl.trim());
        localStorage.setItem("kanvexa_ollama_model", ollamaModel.trim());
      }
      showAlert("Sukses", "Pengaturan AI Agent berhasil disimpan!", "success");
      onClose();
    } catch (err) {
      showAlert("Gagal", "Gagal menyimpan ke penyimpanan lokal.", "error");
    }
  };

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
        maxWidth: 500,
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
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles width={18} height={18} style={{ color: "var(--v)" }} />
            Pengaturan AI Agent
          </h3>
          <button 
            onClick={onClose} 
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--text-3)", fontSize: 20, padding: 0, lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "20px 24px" }}>
            
            {/* Provider Selector */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-2)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Pilih Mesin AI (Engine Provider)
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setProvider("gemini")}
                  style={{
                    padding: "10px 6px", borderRadius: 10, fontSize: 12, fontWeight: 600,
                    border: provider === "gemini" ? "2px solid var(--v)" : "1px solid var(--border-strong)",
                    background: provider === "gemini" ? "rgba(109, 40, 217, 0.04)" : "var(--surface)",
                    color: provider === "gemini" ? "var(--v)" : "var(--text-2)",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    transition: "all 0.2s ease"
                  }}
                >
                  <Key width={14} height={14} />
                  Gemini
                </button>
                <button
                  type="button"
                  onClick={() => setProvider("openrouter")}
                  style={{
                    padding: "10px 6px", borderRadius: 10, fontSize: 12, fontWeight: 600,
                    border: provider === "openrouter" ? "2px solid var(--v)" : "1px solid var(--border-strong)",
                    background: provider === "openrouter" ? "rgba(109, 40, 217, 0.04)" : "var(--surface)",
                    color: provider === "openrouter" ? "var(--v)" : "var(--text-2)",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    transition: "all 0.2s ease"
                  }}
                >
                  <Sparkles width={14} height={14} />
                  OpenRouter
                </button>
                <button
                  type="button"
                  onClick={() => setProvider("ollama")}
                  style={{
                    padding: "10px 6px", borderRadius: 10, fontSize: 12, fontWeight: 600,
                    border: provider === "ollama" ? "2px solid var(--v)" : "1px solid var(--border-strong)",
                    background: provider === "ollama" ? "rgba(109, 40, 217, 0.04)" : "var(--surface)",
                    color: provider === "ollama" ? "var(--v)" : "var(--text-2)",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    transition: "all 0.2s ease"
                  }}
                >
                  <Cpu width={14} height={14} />
                  Ollama
                </button>
              </div>
            </div>

            {/* Provider Specific Settings */}
            {provider === "gemini" ? (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-2)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Gemini API Key (BYOK)
                </label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <input
                    type={showKey ? "text" : "password"}
                    required
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="Masukkan AIzaSy..."
                    style={{
                      width: "100%", padding: "10px 40px 10px 12px", borderRadius: 8, fontSize: 13,
                      border: "1px solid var(--border-strong)", outline: "none",
                      background: "var(--surface)", color: "var(--text-1)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    style={{
                      position: "absolute", right: 10, background: "none", border: "none",
                      color: "var(--text-3)", cursor: "pointer", fontSize: 12, fontWeight: 600
                    }}
                  >
                    {showKey ? "Sembunyikan" : "Tampilkan"}
                  </button>
                </div>
                <span style={{ display: "flex", gap: 6, alignItems: "flex-start", marginTop: 8, fontSize: 11, color: "var(--text-3)", lineHeight: 1.4 }}>
                  <AlertCircle width={12} height={12} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>API Key disimpan lokal di browser. Dapatkan key di <a href="https://ai.google.dev" target="_blank" rel="noopener noreferrer" style={{ color: "var(--v)" }}>ai.google.dev</a></span>
                </span>
              </div>
            ) : provider === "openrouter" ? (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-2)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  OpenRouter API Key
                </label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <input
                    type={showKey ? "text" : "password"}
                    required
                    value={openrouterKey}
                    onChange={e => setOpenrouterKey(e.target.value)}
                    placeholder="Masukkan sk-or-v1-..."
                    style={{
                      width: "100%", padding: "10px 40px 10px 12px", borderRadius: 8, fontSize: 13,
                      border: "1px solid var(--border-strong)", outline: "none",
                      background: "var(--surface)", color: "var(--text-1)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    style={{
                      position: "absolute", right: 10, background: "none", border: "none",
                      color: "var(--text-3)", cursor: "pointer", fontSize: 12, fontWeight: 600
                    }}
                  >
                    {showKey ? "Sembunyikan" : "Tampilkan"}
                  </button>
                </div>
                <span style={{ display: "flex", gap: 6, alignItems: "flex-start", marginTop: 8, fontSize: 11, color: "var(--text-3)", lineHeight: 1.4 }}>
                  <AlertCircle width={12} height={12} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>Gratis! Pakai model Llama, Qwen, Gemma tanpa bayar. Daftar di <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" style={{ color: "var(--v)" }}>openrouter.ai/keys</a></span>
                </span>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-2)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Ollama URL Endpoint
                  </label>
                  <input
                    type="text"
                    required
                    value={ollamaUrl}
                    onChange={e => setOllamaUrl(e.target.value)}
                    placeholder="http://localhost:11434"
                    style={{
                      width: "100%", padding: "10px 12px", borderRadius: 8, fontSize: 13,
                      border: "1px solid var(--border-strong)", outline: "none",
                      background: "var(--surface)", color: "var(--text-1)",
                    }}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-2)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Nama Model
                  </label>
                  <input
                    type="text"
                    required
                    value={ollamaModel}
                    onChange={e => setOllamaModel(e.target.value)}
                    placeholder="llama3, mistral, gemma, dll."
                    style={{
                      width: "100%", padding: "10px 12px", borderRadius: 8, fontSize: 13,
                      border: "1px solid var(--border-strong)", outline: "none",
                      background: "var(--surface)", color: "var(--text-1)",
                    }}
                  />
                </div>
              </div>
            )}

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
              style={{
                padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                background: "var(--v)", color: "#fff", border: "none",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(109,40,217,0.25)",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              Simpan Pengaturan
            </button>
          </div>
        </form>
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
