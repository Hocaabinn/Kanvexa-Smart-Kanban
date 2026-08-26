"use client";

import { useState, useEffect, useRef } from "react";
import { Image as ImageIcon, Trash2, Sparkles, Upload } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"presets" | "upload" | "link">("presets");
  const [selectedCover, setSelectedCover] = useState<CoverData | null>(cover);
  const [customUrl, setCustomUrl] = useState("");
  const [isMac, setIsMac] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detect OS on client mount (Mac: ⌘+V, Windows/Linux: Ctrl+V)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMac(/Mac|iPod|iPhone|iPad/.test(navigator.userAgent || ""));
    }
  }, []);

  // Update selectedCover when prop changes
  useEffect(() => {
    setSelectedCover(cover);
  }, [cover]);

  // Handle global paste event when modal is open
  useEffect(() => {
    if (!showPicker) return;

    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData) {
        // Handle pasted image file
        if (e.clipboardData.files && e.clipboardData.files.length > 0) {
          const file = e.clipboardData.files[0];
          if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (evt) => {
              if (evt.target?.result) {
                setSelectedCover({ type: "image", value: evt.target.result as string });
                setActiveTab("upload");
              }
            };
            reader.readAsDataURL(file);
            return;
          }
        }

        // Handle pasted text URL
        const pastedText = e.clipboardData.getData("text");
        if (pastedText && (pastedText.startsWith("http://") || pastedText.startsWith("https://") || pastedText.startsWith("data:image"))) {
          setSelectedCover({ type: "image", value: pastedText.trim() });
          setCustomUrl(pastedText.trim());
          setActiveTab("link");
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [showPicker]);

  const activeBg = cover 
    ? (cover.type === "gradient" ? cover.value : `url('${cover.value}') center/cover no-repeat`)
    : "linear-gradient(135deg, #6d28d9 0%, #4c1d95 50%, #1e1b4b 100%)";

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setSelectedCover({ type: "image", value: evt.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onUpdateCover(selectedCover);
    setShowPicker(false);
  };

  const shortcutText = isMac ? "⌘+V" : "Ctrl+V";

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
        {/* Action button overlay */}
        {canEdit && (
          <div style={{
            position: "absolute",
            bottom: 12,
            right: 20,
            display: "flex",
            gap: 8,
            zIndex: 35,
            pointerEvents: "auto"
          }}>
            <button
              type="button"
              onClick={() => {
                setSelectedCover(cover);
                setShowPicker(true);
              }}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(10px)",
                color: "#ffffff", border: "1px solid rgba(255, 255, 255, 0.25)",
                cursor: "pointer", boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
                transition: "transform 0.15s ease, background 0.15s ease"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(15, 23, 42, 0.9)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(15, 23, 42, 0.75)")}
            >
              <ImageIcon width={14} height={14} />
              <span>Ubah Sampul</span>
            </button>

            {cover && (
              <button
                type="button"
                onClick={() => onUpdateCover(null)}
                title="Hapus Sampul"
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                  background: "rgba(239, 68, 68, 0.8)", backdropFilter: "blur(10px)",
                  color: "#ffffff", border: "none", cursor: "pointer"
                }}
              >
                <Trash2 width={13} height={13} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Notion-Style Dark Mode Cover Picker Modal */}
      {showPicker && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0, 0, 0, 0.65)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1200, padding: 20
        }}>
          <div style={{
            background: "#202020", borderRadius: 14, border: "1px solid #2f2f2f",
            width: "100%", maxWidth: 500, boxShadow: "0 24px 48px rgba(0,0,0,0.5)",
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
                  onClick={() => setActiveTab("presets")}
                  style={{
                    background: "none", border: "none", padding: "0 0 10px 0",
                    fontSize: 14, fontWeight: 600, cursor: "pointer",
                    color: activeTab === "presets" ? "#ffffff" : "#9b9b9b",
                    borderBottom: activeTab === "presets" ? "2px solid #ffffff" : "2px solid transparent"
                  }}
                >
                  Presets
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("upload")}
                  style={{
                    background: "none", border: "none", padding: "0 0 10px 0",
                    fontSize: 14, fontWeight: 600, cursor: "pointer",
                    color: activeTab === "upload" ? "#ffffff" : "#9b9b9b",
                    borderBottom: activeTab === "upload" ? "2px solid #ffffff" : "2px solid transparent"
                  }}
                >
                  Upload
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("link")}
                  style={{
                    background: "none", border: "none", padding: "0 0 10px 0",
                    fontSize: 14, fontWeight: 600, cursor: "pointer",
                    color: activeTab === "link" ? "#ffffff" : "#9b9b9b",
                    borderBottom: activeTab === "link" ? "2px solid #ffffff" : "2px solid transparent"
                  }}
                >
                  Link
                </button>
              </div>

              {/* Remove button on the top right */}
              <button
                type="button"
                onClick={() => {
                  setSelectedCover(null);
                }}
                style={{
                  background: "none", border: "none", padding: "0 0 10px 0",
                  fontSize: 13, fontWeight: 500, color: "#9b9b9b", cursor: "pointer"
                }}
              >
                Remove
              </button>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />

            {/* Content Area */}
            <div style={{ padding: 20, minHeight: 180 }}>
              {/* Presets Tab */}
              {activeTab === "presets" && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#9b9b9b", marginBottom: 12, textTransform: "uppercase" }}>
                    Kanvexa Mesh Gradients:
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                    {COVER_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedCover({ type: "gradient", value: preset.value });
                        }}
                        style={{
                          height: 56, borderRadius: 8, background: preset.value,
                          border: selectedCover?.value === preset.value ? "2px solid #38bdf8" : "1px solid #3f3f46",
                          cursor: "pointer", display: "flex", alignItems: "flex-end", padding: "6px 10px"
                        }}
                      >
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#ffffff", textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}>
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Tab (Notion Style) */}
              {activeTab === "upload" && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "10px 0" }}>
                  {selectedCover?.type === "image" && selectedCover.value.startsWith("data:image") ? (
                    <div style={{ width: "100%", marginBottom: 14, textAlign: "center" }}>
                      <img
                        src={selectedCover.value}
                        alt="Preview"
                        style={{ width: "100%", height: 110, borderRadius: 8, objectFit: "cover", border: "1px solid #3f3f46" }}
                      />
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      width: "100%", padding: "18px 24px", borderRadius: 8,
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

                  <div style={{ fontSize: 13, color: "#787878", marginTop: 14 }}>
                    or <span style={{ color: "#d4d4d4", fontWeight: 600 }}>{shortcutText}</span> to paste an image or link
                  </div>
                </div>
              )}

              {/* Link Tab */}
              {activeTab === "link" && (
                <div style={{ padding: "10px 0" }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#9b9b9b", marginBottom: 8 }}>
                    Paste an image link below:
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={customUrl}
                    onChange={(e) => {
                      setCustomUrl(e.target.value);
                      if (e.target.value.trim()) {
                        setSelectedCover({ type: "image", value: e.target.value.trim() });
                      }
                    }}
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: 8,
                      background: "#2c2c2c", border: "1px solid #3a3a3a",
                      color: "#ffffff", fontSize: 13, outline: "none"
                    }}
                  />
                  <div style={{ fontSize: 12, color: "#787878", marginTop: 8 }}>
                    or <span style={{ color: "#d4d4d4", fontWeight: 600 }}>{shortcutText}</span> to paste anywhere in modal
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Footer Bar */}
            <div style={{
              padding: "12px 20px", borderTop: "1px solid #2f2f2f",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <button
                type="button"
                onClick={() => setShowPicker(false)}
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
      )}
    </div>
  );
}
