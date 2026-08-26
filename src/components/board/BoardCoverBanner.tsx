"use client";

import { useState } from "react";
import { Image as ImageIcon, X, Trash2, Sparkles } from "lucide-react";

export interface CoverData {
  type: "gradient" | "image";
  value: string; // CSS gradient string or image URL
}

interface Props {
  cover: CoverData | null;
  onUpdateCover: (cover: CoverData | null) => void;
  canEdit: boolean;
}

export const COVER_PRESETS: { name: string; value: string }[] = [
  { name: "Purple Velvet", value: "linear-gradient(135deg, #6d28d9 0%, #4c1d95 50%, #1e1b4b 100%)" },
  { name: "Ocean Wave Blue", value: "linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #0f172a 100%)" },
  { name: "Sunset Amber", value: "linear-gradient(135deg, #d97706 0%, #b45309 50%, #451a03 100%)" },
  { name: "Emerald Fresh", value: "linear-gradient(135deg, #059669 0%, #047857 50%, #064e3b 100%)" },
  { name: "Cyberpunk Pink", value: "linear-gradient(135deg, #db2777 0%, #7c3aed 50%, #0f172a 100%)" },
  { name: "Dark Slate Minimal", value: "linear-gradient(135deg, #334155 0%, #1e293b 50%, #0f172a 100%)" },
];

export default function BoardCoverBanner({ cover, onUpdateCover, canEdit }: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const [customUrl, setCustomUrl] = useState("");

  const activeBg = cover 
    ? (cover.type === "gradient" ? cover.value : `url('${cover.value}') center/cover no-repeat`)
    : "linear-gradient(135deg, #6d28d9 0%, #4c1d95 50%, #1e1b4b 100%)";

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* Cover Banner Box */}
      <div 
        style={{
          width: "100%",
          height: 160,
          background: activeBg,
          position: "relative",
          transition: "all 0.3s ease",
          boxShadow: "inset 0 -10px 20px rgba(0,0,0,0.15)"
        }}
        className="board-cover-container"
      >
        {/* Action button overlay on hover */}
        {canEdit && (
          <div style={{
            position: "absolute",
            bottom: 12,
            right: 20,
            display: "flex",
            gap: 8,
            zIndex: 10
          }}>
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                background: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(8px)",
                color: "#ffffff", border: "1px solid rgba(255, 255, 255, 0.2)",
                cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
              }}
            >
              <ImageIcon width={14} height={14} />
              <span>Ubah Sampul</span>
            </button>

            {cover && (
              <button
                type="button"
                onClick={() => onUpdateCover(null)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                  background: "rgba(239, 68, 68, 0.75)", backdropFilter: "blur(8px)",
                  color: "#ffffff", border: "none", cursor: "pointer"
                }}
              >
                <Trash2 width={13} height={13} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Cover Picker Modal */}
      {showPicker && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(15, 23, 42, 0.5)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1100, padding: 20
        }}>
          <div style={{
            background: "#ffffff", borderRadius: 20, border: "1px solid #e2e8f0",
            width: "100%", maxWidth: 480, boxShadow: "0 20px 40px -15px rgba(0,0,0,0.2)",
            overflow: "hidden", animation: "modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
          }}>
            <div style={{
              padding: "16px 20px", borderBottom: "1px solid #f1f5f9",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                <Sparkles width={16} height={16} style={{ color: "#6d28d9" }} />
                <span>Pilih Sampul Papan</span>
              </h3>
              <button
                onClick={() => setShowPicker(false)}
                style={{
                  background: "#f1f5f9", border: "none", cursor: "pointer",
                  color: "#64748b", width: 28, height: 28, borderRadius: 14,
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}
              >
                <X width={16} height={16} />
              </button>
            </div>

            <div style={{ padding: 20, maxHeight: 360, overflowY: "auto" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Preset Mesh Gradient Khas Kanvexa:
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 20 }}>
                {COVER_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onUpdateCover({ type: "gradient", value: preset.value });
                      setShowPicker(false);
                    }}
                    style={{
                      height: 64, borderRadius: 12, background: preset.value,
                      border: "2px solid #ffffff", cursor: "pointer",
                      display: "flex", alignItems: "flex-end", padding: "8px 10px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)", textAlign: "left"
                    }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#ffffff", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>

              <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Atau Pakai Tautan Gambar Kustom:
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (customUrl.trim()) {
                  onUpdateCover({ type: "image", value: customUrl.trim() });
                  setShowPicker(false);
                }
              }} style={{ display: "flex", gap: 8 }}>
                <input
                  type="url"
                  placeholder="https://example.com/banner-image.jpg"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  style={{
                    flex: 1, padding: "8px 12px", borderRadius: 10, fontSize: 12,
                    border: "1px solid #cbd5e1", outline: "none"
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                    background: "var(--v)", color: "#fff", border: "none", cursor: "pointer"
                  }}
                >
                  Terapkan
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
