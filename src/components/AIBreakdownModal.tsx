"use client";

import { useState } from "react";

interface Props {
  onClose: () => void;
  onSubmit: (prompt: string, clearExisting: boolean) => void;
}

export default function AIBreakdownModal({ onClose, onSubmit }: Props) {
  const [prompt, setPrompt] = useState("");
  const [clearExisting, setClearExisting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed) return;
    onSubmit(trimmed, clearExisting);
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
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
            Urai dengan AI
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
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "20px 24px" }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Tulis tujuan proyek atau target kamu
              </label>
              <textarea
                required
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
              disabled={!prompt.trim()}
              style={{
                padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                background: "var(--v)", color: "#fff", border: "none",
                cursor: !prompt.trim() ? "not-allowed" : "pointer",
                boxShadow: "0 2px 8px rgba(109,40,217,0.25)",
                display: "flex", alignItems: "center", gap: 6,
                position: "relative",
              }}
            >
              Urai Jadi Tugas
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
