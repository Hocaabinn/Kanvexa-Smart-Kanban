"use client";

import { useState, useEffect, useRef } from "react";
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
  Upload
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
  const [selectedIcon, setSelectedIcon] = useState<BoardIconData>(currentIcon);
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [selectedLucideColor, setSelectedLucideColor] = useState(currentIcon.color || "#f5f3ff");
  const [isMac, setIsMac] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detect OS on client mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMac(/Mac|iPod|iPhone|iPad/.test(navigator.userAgent || ""));
    }
  }, []);

  useEffect(() => {
    setSelectedIcon(currentIcon);
    setActiveTab(currentIcon.type || "emoji");
  }, [currentIcon, isOpen]);

  // Handle global paste event when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData) {
        if (e.clipboardData.files && e.clipboardData.files.length > 0) {
          const file = e.clipboardData.files[0];
          if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (evt) => {
              if (evt.target?.result) {
                const newIcon: BoardIconData = { type: "image", value: evt.target.result as string };
                setSelectedIcon(newIcon);
                setActiveTab("image");
              }
            };
            reader.readAsDataURL(file);
            return;
          }
        }

        const pastedText = e.clipboardData.getData("text");
        if (pastedText && (pastedText.startsWith("http://") || pastedText.startsWith("https://") || pastedText.startsWith("data:image"))) {
          const newIcon: BoardIconData = { type: "image", value: pastedText.trim() };
          setSelectedIcon(newIcon);
          setCustomImageUrl(pastedText.trim());
          setActiveTab("image");
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setSelectedIcon({ type: "image", value: evt.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSelectIcon(selectedIcon);
    onClose();
  };

  const shortcutText = isMac ? "⌘+V" : "Ctrl+V";

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0, 0, 0, 0.65)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1200, padding: 20
    }}>
      <div style={{
        background: "#202020", borderRadius: 14, border: "1px solid #2f2f2f",
        width: "100%", maxWidth: 460, boxShadow: "0 24px 48px rgba(0,0,0,0.5)",
        overflow: "hidden", color: "#e3e3e3", fontFamily: "sans-serif"
      }}>
        {/* Top Navigation Bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 20px 0", borderBottom: "1px solid #2f2f2f"
        }}>
          <div style={{ display: "flex", gap: 20 }}>
            <button
              type="button"
              onClick={() => setActiveTab("emoji")}
              style={{
                background: "none", border: "none", padding: "0 0 10px 0",
                fontSize: 14, fontWeight: 600, cursor: "pointer",
                color: activeTab === "emoji" ? "#ffffff" : "#9b9b9b",
                borderBottom: activeTab === "emoji" ? "2px solid #ffffff" : "2px solid transparent"
              }}
            >
              Emoji
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("lucide")}
              style={{
                background: "none", border: "none", padding: "0 0 10px 0",
                fontSize: 14, fontWeight: 600, cursor: "pointer",
                color: activeTab === "lucide" ? "#ffffff" : "#9b9b9b",
                borderBottom: activeTab === "lucide" ? "2px solid #ffffff" : "2px solid transparent"
              }}
            >
              Icons
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("image")}
              style={{
                background: "none", border: "none", padding: "0 0 10px 0",
                fontSize: 14, fontWeight: 600, cursor: "pointer",
                color: activeTab === "image" ? "#ffffff" : "#9b9b9b",
                borderBottom: activeTab === "image" ? "2px solid #ffffff" : "2px solid transparent"
              }}
            >
              Upload
            </button>
          </div>

          {/* Remove button on the top right */}
          {onRemoveIcon && (
            <button
              type="button"
              onClick={() => {
                onRemoveIcon();
                onClose();
              }}
              style={{
                background: "none", border: "none", padding: "0 0 10px 0",
                fontSize: 13, fontWeight: 500, color: "#9b9b9b", cursor: "pointer"
              }}
            >
              Remove
            </button>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />

        {/* Content Tab 1: Emoji */}
        {activeTab === "emoji" && (
          <div style={{ padding: 20, maxHeight: 280, overflowY: "auto" }}>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 8
            }}>
              {EMOJI_LIST.map((em, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    const newIcon: BoardIconData = { type: "emoji", value: em };
                    setSelectedIcon(newIcon);
                    onSelectIcon(newIcon);
                    onClose();
                  }}
                  style={{
                    fontSize: 22, border: "none", background: "transparent",
                    borderRadius: 8, padding: 8, cursor: "pointer",
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

        {/* Content Tab 2: Lucide Vector Icons */}
        {activeTab === "lucide" && (
          <div style={{ padding: 20, maxHeight: 300, overflowY: "auto" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#9b9b9b", marginBottom: 8, textTransform: "uppercase" }}>
              Accent Color:
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {ACCENT_COLORS.map((bgCol, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedLucideColor(bgCol)}
                  style={{
                    width: 24, height: 24, borderRadius: 12, background: bgCol,
                    border: selectedLucideColor === bgCol ? "2px solid #38bdf8" : "1px solid #3f3f46",
                    cursor: "pointer"
                  }}
                />
              ))}
            </div>

            <div style={{ fontSize: 11, fontWeight: 600, color: "#9b9b9b", marginBottom: 8, textTransform: "uppercase" }}>
              Select Symbol:
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
              {Object.keys(LUCIDE_ICONS_MAP).map((iconName) => {
                const IconComponent = LUCIDE_ICONS_MAP[iconName];
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => {
                      const newIcon: BoardIconData = {
                        type: "lucide",
                        value: iconName,
                        color: selectedLucideColor
                      };
                      setSelectedIcon(newIcon);
                      onSelectIcon(newIcon);
                      onClose();
                    }}
                    style={{
                      width: 40, height: 40, borderRadius: 8, background: selectedLucideColor,
                      border: "1px solid #3f3f46", display: "flex", alignItems: "center",
                      justifyContent: "center", cursor: "pointer", color: "#6d28d9"
                    }}
                  >
                    <IconComponent width={18} height={18} />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Content Tab 3: Upload / Custom Image URL (Notion Style) */}
        {activeTab === "image" && (
          <div style={{ padding: 20 }}>
            {selectedIcon.type === "image" && selectedIcon.value ? (
              <div style={{ width: "100%", marginBottom: 14, textAlign: "center" }}>
                <img
                  src={selectedIcon.value}
                  alt="Icon Preview"
                  style={{ width: 64, height: 64, borderRadius: 16, objectFit: "cover", border: "1px solid #3f3f46" }}
                />
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: "100%", padding: "16px 24px", borderRadius: 8,
                background: "#2c2c2c", border: "1px solid #3a3a3a",
                color: "#e3e3e3", fontSize: 14, fontWeight: 500,
                cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", gap: 10, transition: "background 0.15s ease"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#333333")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#2c2c2c")}
            >
              <Upload width={18} height={18} />
              <span>Upload an image</span>
            </button>

            <div style={{ fontSize: 13, color: "#787878", marginTop: 14, textAlign: "center" }}>
              or <span style={{ color: "#d4d4d4", fontWeight: 600 }}>{shortcutText}</span> to paste an image or link
            </div>

            <div style={{ marginTop: 16 }}>
              <input
                type="url"
                placeholder="https://example.com/logo.png"
                value={customImageUrl}
                onChange={(e) => {
                  setCustomImageUrl(e.target.value);
                  if (e.target.value.trim()) {
                    setSelectedIcon({ type: "image", value: e.target.value.trim() });
                  }
                }}
                style={{
                  width: "100%", padding: "8px 12px", borderRadius: 8,
                  background: "#2c2c2c", border: "1px solid #3a3a3a",
                  color: "#ffffff", fontSize: 12, outline: "none"
                }}
              />
            </div>
          </div>
        )}

        {/* Bottom Footer Bar */}
        <div style={{
          padding: "12px 20px", borderTop: "1px solid #2f2f2f",
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none", border: "none", fontSize: 14, fontWeight: 500,
              color: "#9b9b9b", cursor: "pointer"
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: "7px 18px", borderRadius: 6, fontSize: 13, fontWeight: 600,
              background: "#2383e2", color: "#ffffff", border: "none", cursor: "pointer",
              transition: "background 0.15s ease"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#1d74ca")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#2383e2")}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
