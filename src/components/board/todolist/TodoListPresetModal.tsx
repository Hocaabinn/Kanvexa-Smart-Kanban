"use client";

import { useState } from "react";
import { Calendar, Clock, User, FileText } from "lucide-react";
import { createColumnWithCard } from "@/app/board/[id]/actions";

interface Props {
    boardId: string;
    presetType: string;
    onClose: () => void;
}

export default function TodoListPresetModal({ boardId, presetType, onClose }: Props) {
    const defaultColTitle = presetType === "To-Do List" ? "To-dos" : presetType;

    const [presetColTitle, setPresetColTitle] = useState(defaultColTitle);
    const [presetSubTitle, setPresetSubTitle] = useState("");
    const [presetDueDate, setPresetDueDate] = useState("");
    const [presetDueTime, setPresetDueTime] = useState("");
    const [presetAssignee, setPresetAssignee] = useState("");
    const [presetNotes, setPresetNotes] = useState("");
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const colName = presetColTitle.trim() || defaultColTitle;
        const cardTaskName = presetSubTitle.trim() || "Tugas Pertama";

        setSaving(true);
        try {
            await createColumnWithCard(
                boardId,
                colName,
                cardTaskName,
                {
                    dueDate: presetDueDate,
                    dueTime: presetDueTime,
                    assignee: presetAssignee.trim(),
                    notes: presetNotes.trim(),
                }
            );
            onClose();
        } catch (err: any) {
            alert("Gagal membuat kolom: " + err.message);
        } finally {
            setSaving(false);
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
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 20,
                width: "100%",
                maxWidth: 500,
                boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
                overflow: "hidden",
                animation: "modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}>
                {/* Modal Header */}
                <div style={{
                    padding: "20px 24px 16px",
                    borderBottom: "1px solid #e2e8f0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ color: "var(--v)" }}>✦</span> Konfigurasi Kolom ({presetType})
                    </h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: "#94a3b8", fontSize: 22, padding: 0, lineHeight: 1
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Modal Form */}
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 16, maxHeight: "68vh", overflowY: "auto" }}>
                        
                        {/* 1. Item Tugas / Kartu Pertama (dengan Kotak Centang) */}
                        <div>
                            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                                Nama Tugas / Item Checklist
                            </label>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 10, padding: "8px 12px" }}>
                                <div style={{
                                    width: 18, height: 18, borderRadius: 4, border: "2px solid var(--v)",
                                    display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f3ff", flexShrink: 0
                                }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--v)" strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg>
                                </div>
                                <input
                                    required
                                    autoFocus
                                    value={presetSubTitle}
                                    onChange={(e) => setPresetSubTitle(e.target.value)}
                                    placeholder="misal: Ayo gym, Kerjakan tugas, dll..."
                                    style={{
                                        flex: 1, border: "none", outline: "none", fontSize: 14,
                                        background: "transparent", color: "#0f172a",
                                    }}
                                />
                            </div>
                        </div>

                        {/* 2. Tanggal & Jam */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <div>
                                <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                                    <Calendar style={{ width: 13, height: 13, color: "#4f46e5" }} />
                                    <span>Tanggal Selesai</span>
                                </label>
                                <input
                                    type="date"
                                    value={presetDueDate}
                                    onChange={(e) => setPresetDueDate(e.target.value)}
                                    style={{
                                        width: "100%", padding: "10px 12px", borderRadius: 10, fontSize: 13,
                                        border: "1px solid #cbd5e1", outline: "none",
                                        background: "#f8fafc", color: "#0f172a",
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                                    <Clock style={{ width: 13, height: 13, color: "#d97706" }} />
                                    <span>Jam</span>
                                </label>
                                <input
                                    type="time"
                                    value={presetDueTime}
                                    onChange={(e) => setPresetDueTime(e.target.value)}
                                    style={{
                                        width: "100%", padding: "10px 12px", borderRadius: 10, fontSize: 13,
                                        border: "1px solid #cbd5e1", outline: "none",
                                        background: "#f8fafc", color: "#0f172a",
                                    }}
                                />
                            </div>
                        </div>

                        {/* 3. Ditugaskan Kepada */}
                        <div>
                            <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                                <User style={{ width: 13, height: 13, color: "#059669" }} />
                                <span>Ditugaskan Kepada</span>
                            </label>
                            <input
                                type="text"
                                value={presetAssignee}
                                onChange={(e) => setPresetAssignee(e.target.value)}
                                placeholder="misal: Andi, Budi"
                                style={{
                                    width: "100%", padding: "10px 12px", borderRadius: 10, fontSize: 13,
                                    border: "1px solid #cbd5e1", outline: "none",
                                    background: "#f8fafc", color: "#0f172a",
                                }}
                            />
                        </div>

                        {/* 4. Catatan */}
                        <div>
                            <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                                <FileText style={{ width: 13, height: 13, color: "#64748b" }} />
                                <span>Catatan / Instructions</span>
                            </label>
                            <textarea
                                rows={3}
                                value={presetNotes}
                                onChange={(e) => setPresetNotes(e.target.value)}
                                placeholder="Tulis catatan tambahan, referensi, atau instruksi..."
                                style={{
                                    width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13,
                                    border: "1px solid #cbd5e1", outline: "none",
                                    background: "#f8fafc", color: "#0f172a", resize: "vertical",
                                    fontFamily: "inherit"
                                }}
                            />
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div style={{
                        padding: "16px 24px 20px",
                        background: "#f8fafc",
                        borderTop: "1px solid #e2e8f0",
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 10,
                    }}>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            style={{
                                padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                                background: "none", border: "1px solid #cbd5e1",
                                color: "#475569", cursor: "pointer"
                            }}
                        >
                            Batalkan
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            style={{
                                padding: "10px 22px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                                background: "var(--v)", color: "#fff", border: "none",
                                cursor: saving ? "not-allowed" : "pointer",
                                boxShadow: "0 4px 14px rgba(109,40,217,0.25)",
                                display: "flex", alignItems: "center", gap: 6,
                            }}
                        >
                            {saving ? "Membuat..." : "Buat Papan Ini ✦"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
