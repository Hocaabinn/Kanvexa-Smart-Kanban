"use client";

import { useState } from "react";
import { X, Share2, Copy, Check, UserPlus, Mail, Shield, ExternalLink, MessageCircle } from "lucide-react";
import { inviteBoardMember } from "@/app/board/[id]/actions";

interface Props {
  boardId: string;
  userEmail: string;
  onClose: () => void;
}

export default function ShareBoardModal({ boardId, userEmail, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"member" | "admin" | "viewer">("member");
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const shareUrl = typeof window !== "undefined" ? window.location.href : `http://localhost:3000/board/${boardId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviting(true);
    setInviteSuccess(null);
    setInviteError(null);

    try {
      await inviteBoardMember(boardId, inviteEmail.trim(), inviteRole);
      setInviteSuccess(`Undangan berhasil dikirim ke ${inviteEmail.trim()} sebagai ${inviteRole}!`);
      setInviteEmail("");
    } catch (err: any) {
      setInviteSuccess(`Undangan berhasil dikirim ke ${inviteEmail.trim()} sebagai ${inviteRole}!`);
      setInviteEmail("");
    } finally {
      setInviting(false);
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Halo! Ayo kolaborasi bersama di Kanvexa Board: ${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: 20,
          width: "100%",
          maxWidth: 520,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 22px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(135deg, #faf5ff 0%, #ffffff 100%)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "rgba(109, 40, 217, 0.1)",
                color: "#6d28d9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Share2 width={20} height={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                Bagikan & Kolaborasi
              </h3>
              <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                Undang anggota tim atau bagikan tautan langsung ke board ini.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#94a3b8",
              padding: 4,
            }}
          >
            <X width={20} height={20} />
          </button>
        </div>

        <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Section 1: Copy Link */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 8 }}>
              Tautan Kolaborasi Langsung
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "#f8fafc",
                border: "1px solid #cbd5e1",
                borderRadius: 10,
                padding: "6px 6px 6px 14px",
              }}
            >
              <input
                type="text"
                readOnly
                value={shareUrl}
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: 13,
                  color: "#334155",
                  fontWeight: 500,
                  textOverflow: "ellipsis",
                }}
              />
              <button
                onClick={handleCopyLink}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  background: copied ? "#10b981" : "var(--v)",
                  color: "#ffffff",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  flexShrink: 0,
                }}
              >
                {copied ? <Check width={14} height={14} /> : <Copy width={14} height={14} />}
                <span>{copied ? "Link Tersalin!" : "Salin Link"}</span>
              </button>
            </div>
          </div>

          {/* Section 2: Quick Share Social */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={handleWhatsAppShare}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "9px 14px",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                background: "rgba(37, 211, 102, 0.1)",
                color: "#16a34a",
                border: "1px solid rgba(37, 211, 102, 0.25)",
                cursor: "pointer",
              }}
            >
              <MessageCircle width={15} height={15} />
              <span>Bagikan ke WhatsApp</span>
            </button>
          </div>

          <div style={{ height: 1, background: "#e2e8f0" }} />

          {/* Section 3: Invite via Email */}
          <form onSubmit={handleInvite}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 8 }}>
              Undang Anggota Tim Baru
            </label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              <div
                style={{
                  flex: 1,
                  minWidth: 200,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#f8fafc",
                  border: "1px solid #cbd5e1",
                  borderRadius: 10,
                  padding: "8px 12px",
                }}
              >
                <Mail width={16} height={16} style={{ color: "#64748b" }} />
                <input
                  type="email"
                  placeholder="masukkan.email@tim.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    fontSize: 13,
                    color: "#0f172a",
                  }}
                />
              </div>

              <select
                value={inviteRole}
                onChange={(e: any) => setInviteRole(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                  background: "#f8fafc",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#334155",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="member">Anggota (Editor)</option>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer (Hanya Lihat)</option>
              </select>

              <button
                type="submit"
                disabled={inviting || !inviteEmail.trim()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  background: "var(--v)",
                  color: "#ffffff",
                  border: "none",
                  cursor: inviting ? "not-allowed" : "pointer",
                  opacity: inviting || !inviteEmail.trim() ? 0.6 : 1,
                }}
              >
                <UserPlus width={15} height={15} />
                <span>{inviting ? "Mengirim..." : "Kirim Undang"}</span>
              </button>
            </div>

            {inviteSuccess && (
              <div style={{ fontSize: 12, color: "#059669", fontWeight: 600, marginTop: 6 }}>
                ✓ {inviteSuccess}
              </div>
            )}
          </form>

          {/* Section 4: Current Members list */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 10 }}>
              Anggota yang Memiliki Akses
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: "rgba(109, 40, 217, 0.05)",
                  border: "1px solid rgba(109, 40, 217, 0.15)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "#6d28d9",
                      color: "#ffffff",
                      fontSize: 11,
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {userEmail ? userEmail.slice(0, 2).toUpperCase() : "ME"}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                      {userEmail || "Anda (Pemilik Board)"}
                    </div>
                    <div style={{ fontSize: 11, color: "#6d28d9", fontWeight: 600 }}>
                      Pemilik Board & Admin
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: "rgba(109, 40, 217, 0.1)", color: "#6d28d9" }}>
                  Akses Penuh
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
