"use client";

import React, { useEffect, useState } from "react";
import { FolderKanban } from "lucide-react";

interface BoardLoaderModalProps {
  isOpen: boolean;
  boardTitle?: string;
  onClose?: () => void;
}

const loadingSubtitles = [
  "Memuat data board & kartu tugas...",
  "Menyinkronkan dokumen & riwayat...",
  "Menyiapkan ruang kerja...",
];

export default function BoardLoaderModal({ isOpen, boardTitle }: BoardLoaderModalProps) {
  const [subtitleIndex, setSubtitleIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setSubtitleIndex((prev) => (prev + 1) % loadingSubtitles.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        animation: "kvFadeIn 0.2s ease-out forwards",
      }}
    >
      <style>{`
        @keyframes kvFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes kvPopIn {
          from {
            opacity: 0;
            transform: scale(0.94) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes kvSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes kvProgress {
          0% { width: 15%; }
          50% { width: 70%; }
          100% { width: 92%; }
        }
      `}</style>

      <div
        style={{
          width: "100%",
          maxWidth: "380px",
          background: "#ffffff",
          borderRadius: "20px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 20px 40px -12px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.03)",
          padding: "28px 24px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          position: "relative",
          animation: "kvPopIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
      >
        {/* Minimal Icon with Outer Ring Spinner */}
        <div style={{ position: "relative", width: "56px", height: "56px", marginBottom: "18px" }}>
          {/* Ring Spinner */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "3px solid #f1f5f9",
              borderTopColor: "#7c3aed",
              animation: "kvSpin 0.9s linear infinite",
            }}
          />
          {/* Center Icon Box */}
          <div
            style={{
              position: "absolute",
              inset: "5px",
              borderRadius: "50%",
              background: "#f8fafc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#7c3aed",
            }}
          >
            <FolderKanban style={{ width: "22px", height: "22px" }} />
          </div>
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: "16px",
            fontWeight: "700",
            color: "#0f172a",
            margin: "0 0 4px",
            letterSpacing: "-0.01em",
            lineHeight: 1.3,
            maxWidth: "300px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {boardTitle ? boardTitle : "Membuka Board..."}
        </h3>

        {/* Subtitle */}
        <p
          key={subtitleIndex}
          style={{
            fontSize: "13px",
            color: "#64748b",
            margin: "0 0 20px",
            fontWeight: "500",
            minHeight: "20px",
            animation: "kvFadeIn 0.2s ease-out forwards",
          }}
        >
          {loadingSubtitles[subtitleIndex]}
        </p>

        {/* Minimal Progress Bar */}
        <div
          style={{
            width: "100%",
            height: "4px",
            background: "#f1f5f9",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              background: "#7c3aed",
              borderRadius: "4px",
              animation: "kvProgress 2s ease-in-out infinite",
            }}
          />
        </div>
      </div>
    </div>
  );
}
