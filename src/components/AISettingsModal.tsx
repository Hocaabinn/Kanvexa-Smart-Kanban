"use client";

import React, { useState, useEffect } from "react";
import { X, Sparkles, Cpu, Check } from "lucide-react";

interface AISettingsModalProps {
  onClose: () => void;
}

export default function AISettingsModal({ onClose }: AISettingsModalProps) {
  const [selectedModel, setSelectedModel] = useState("google/gemini-2.5-flash");

  useEffect(() => {
    const saved = localStorage.getItem("kanvexa_selected_model") || "google/gemini-2.5-flash";
    setSelectedModel(saved);
  }, []);

  const handleSave = () => {
    localStorage.setItem("kanvexa_selected_model", selectedModel);
    onClose();
  };

  const models = [
    {
      id: "google/gemini-2.5-flash",
      name: "Gemini 2.5 Flash",
      description: "Sangat cepat, hemat kuota, dan seimbang untuk semua jenis analisis.",
      badge: "Rekomendasi",
      badgeColor: "#6366f1",
      badgeBg: "#e0e7ff"
    },
    {
      id: "meta-llama/llama-3.3-70b-instruct",
      name: "Llama 3.3 70B",
      description: "Model open-source terkuat, sangat baik untuk draf panjang dan terperinci.",
      badge: "Detail & Informatif",
      badgeColor: "#059669",
      badgeBg: "#d1fae5"
    },
    {
      id: "anthropic/claude-3.5-haiku",
      name: "Claude 3.5 Haiku",
      description: "Model dari Anthropic yang sangat cepat dengan penalaran dan bahasa yang natural.",
      badge: "Bahasa Luwes",
      badgeColor: "#d97706",
      badgeBg: "#fef3c7"
    },
    {
      id: "anthropic/claude-3.5-sonnet",
      name: "Claude 3.5 Sonnet",
      description: "Kualitas terbaik untuk analisis kompleks dan penulisan kode program tingkat lanjut.",
      badge: "Kualitas Premium",
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
        animation: "scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
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
        <div style={{ padding: 20 }}>
          <p style={{ fontSize: 12, color: "#64748b", marginTop: 0, marginBottom: 16, lineHeight: 1.45 }}>
            Pilih kecerdasan buatan (AI) yang ingin Anda gunakan untuk mengurai tugas. Semua API Key dikelola dengan aman di server kami.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 320, overflowY: "auto", paddingRight: 4 }}>
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
      `}</style>
    </div>
  );
}
