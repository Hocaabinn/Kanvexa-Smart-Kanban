"use client";

import { useState } from "react";
import { 
  GraduationCap, 
  FolderKanban, 
  Rocket, 
  Lightbulb, 
  Target, 
  Star, 
  BookOpen, 
  Heart, 
  Sparkles, 
  Zap, 
  Award, 
  ShieldCheck, 
  Layers, 
  Compass,
  Smile,
  Image as ImageIcon,
  Palette,
  X
} from "lucide-react";

export type IconType = "emoji" | "lucide" | "image";

export interface BoardIconData {
  type: IconType;
  value: string; // emoji char, lucide icon name, or image URL
  color?: string; // background accent color for lucide icon
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentIcon: BoardIconData;
  onSelectIcon: (icon: BoardIconData) => void;
  onRemoveIcon?: () => void;
}

const EMOJI_LIST = [
  "🎓", "🚀", "💡", "📋", "📊", "🎯", "📚", "🏖️", 
  "💰", "🎨", "💼", "⚡", "🏆", "☕", "🎮", "🏠", 
  "🧘", "🔬", "🌿", "✈️", "💻", "🍕", "🎵", "🍿", 
  "🎬", "🌟", "🔒", "🛠️", "📢", "🔑", "🗺️", "📦"
];

export const LUCIDE_ICONS_MAP: Record<string, any> = {
  GraduationCap,
  FolderKanban,
  Rocket,
  Lightbulb,
  Target,
  Star,
  BookOpen,
  Heart,
  Sparkles,
  Zap,
  Award,
  ShieldCheck,
  Layers,
  Compass
};

const ACCENT_COLORS = [
  "#f5f3ff", "#eff6ff", "#fffbeb", "#ecfdf5", "#fdf2f8", "#f0fdf4"
];

export default function BoardIconPickerModal({
  isOpen,
  onClose,
  currentIcon,
  onSelectIcon,
  onRemoveIcon
}: Props) {
  const [activeTab, setActiveTab] = useState<IconType>(currentIcon.type || "emoji");
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [selectedLucideColor, setSelectedLucideColor] = useState(currentIcon.color || "#f5f3ff");

  if (!isOpen) return null;

  const handleImageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customImageUrl.trim()) {
      onSelectIcon({
        type: "image",
        value: customImageUrl.trim()
      });
      onClose();
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(15, 23, 42, 0.5)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1100, padding: 20
    }}>
      <div style={{
        background: "#ffffff", borderRadius: 20, border: "1px solid #e2e8f0",
        width: "100%", maxWidth: 440, boxShadow: "0 20px 40px -15px rgba(0,0,0,0.2)",
        overflow: "hidden", animation: "modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
      }}>
        {/* Header */}
        <div style={{
          padding: "16px 20px", borderBottom: "1px solid #f1f5f9",
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", margin: 0 }}>
            Pilih Ikon Papan
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "#f1f5f9", border: "none", cursor: "pointer",
              color: "#64748b", width: 28, height: 28, borderRadius: 14,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}
          >
            <X width={16} height={16} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: "flex", padding: "8px 16px", borderBottom: "1px solid #f1f5f9",
          gap: 6, background: "#f8fafc"
        }}>
          <button
            type="button"
            onClick={() => setActiveTab("emoji")}
            style={{
              flex: 1, padding: "8px 12px", borderRadius: 10, fontSize: 12, fontWeight: 700,
              border: "none", cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", gap: 6,
              background: activeTab === "emoji" ? "#ffffff" : "transparent",
              color: activeTab === "emoji" ? "#6d28d9" : "#64748b",
              boxShadow: activeTab === "emoji" ? "0 2px 6px rgba(0,0,0,0.06)" : "none"
            }}
          >
            <Smile width={14} height={14} />
            <span>Emoji</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("lucide")}
            style={{
              flex: 1, padding: "8px 12px", borderRadius: 10, fontSize: 12, fontWeight: 700,
              border: "none", cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", gap: 6,
              background: activeTab === "lucide" ? "#ffffff" : "transparent",
              color: activeTab === "lucide" ? "#6d28d9" : "#64748b",
              boxShadow: activeTab === "lucide" ? "0 2px 6px rgba(0,0,0,0.06)" : "none"
            }}
          >
            <Palette width={14} height={14} />
            <span>Vektor Icon</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("image")}
            style={{
              flex: 1, padding: "8px 12px", borderRadius: 10, fontSize: 12, fontWeight: 700,
              border: "none", cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", gap: 6,
              background: activeTab === "image" ? "#ffffff" : "transparent",
              color: activeTab === "image" ? "#6d28d9" : "#64748b",
              boxShadow: activeTab === "image" ? "0 2px 6px rgba(0,0,0,0.06)" : "none"
            }}
          >
            <ImageIcon width={14} height={14} />
            <span>Upload</span>
          </button>
        </div>

        {/* Content Tab 1: Emoji */}
        {activeTab === "emoji" && (
          <div style={{ padding: 20, maxHeight: 300, overflowY: "auto" }}>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 10
            }}>
              {EMOJI_LIST.map((em, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onSelectIcon({ type: "emoji", value: em });
                    onClose();
                  }}
                  style={{
                    fontSize: 22, border: "none", background: "transparent",
                    borderRadius: 10, padding: 8, cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                  className="emoji-picker-btn"
                >
                  {em}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content Tab 2: Lucide Vector Icon */}
        {activeTab === "lucide" && (
          <div style={{ padding: 20, maxHeight: 320, overflowY: "auto" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 8, textTransform: "uppercase" }}>
              Warna Latar Ikon:
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {ACCENT_COLORS.map((bgCol, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedLucideColor(bgCol)}
                  style={{
                    width: 24, height: 24, borderRadius: 12, background: bgCol,
                    border: selectedLucideColor === bgCol ? "2px solid #6d28d9" : "1px solid #cbd5e1",
                    cursor: "pointer"
                  }}
                />
              ))}
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 8, textTransform: "uppercase" }}>
              Pilih Simbol:
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
              {Object.keys(LUCIDE_ICONS_MAP).map((iconName) => {
                const IconComponent = LUCIDE_ICONS_MAP[iconName];
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => {
                      onSelectIcon({
                        type: "lucide",
                        value: iconName,
                        color: selectedLucideColor
                      });
                      onClose();
                    }}
                    style={{
                      width: 42, height: 42, borderRadius: 10, background: selectedLucideColor,
                      border: "1px solid #cbd5e1", display: "flex", alignItems: "center",
                      justifyContent: "center", cursor: "pointer", color: "#6d28d9"
                    }}
                  >
                    <IconComponent width={20} height={20} />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Content Tab 3: Upload / Custom Image URL */}
        {activeTab === "image" && (
          <form onSubmit={handleImageSubmit} style={{ padding: 20 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 8 }}>
              Tautan URL Gambar Logo / Ikon:
            </label>
            <input
              type="url"
              required
              placeholder="https://example.com/my-logo.png"
              value={customImageUrl}
              onChange={(e) => setCustomImageUrl(e.target.value)}
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13,
                border: "1px solid #cbd5e1", outline: "none", marginBottom: 16
              }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600,
                  background: "#f1f5f9", border: "none", color: "#475569", cursor: "pointer"
                }}
              >
                Batal
              </button>
              <button
                type="submit"
                style={{
                  padding: "8px 18px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                  background: "var(--v)", color: "#ffffff", border: "none", cursor: "pointer"
                }}
              >
                Terapkan Gambar
              </button>
            </div>
          </form>
        )}

        {/* Footer Remove Button */}
        {onRemoveIcon && (
          <div style={{ padding: "12px 20px", borderTop: "1px solid #f1f5f9", background: "#f8fafc", textAlign: "right" }}>
            <button
              type="button"
              onClick={() => {
                onRemoveIcon();
                onClose();
              }}
              style={{
                fontSize: 12, fontWeight: 600, color: "#ef4444", background: "none",
                border: "none", cursor: "pointer"
              }}
            >
              Hapus Ikon Kustom
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
