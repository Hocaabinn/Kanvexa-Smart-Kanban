"use client";

import { useState } from "react";
import { Calendar, Clock, User, FileText } from "lucide-react";
import { createCard } from "@/app/board/[id]/actions";

interface Props {
    boardId: string;
    columnId: string;
    userEmail?: string;
    onDone: () => void;
    onCancel: () => void;
}

export default function AddTodoListCardForm({ boardId, columnId, userEmail = "", onDone, onCancel }: Props) {
    const [taskName, setTaskName] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [dueTime, setDueTime] = useState("");
    const [assignee, setAssignee] = useState("");
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);

    // List of registered members / users
    const registeredUsers = Array.from(new Set([
        ...(userEmail ? [userEmail] : []),
        "bintangwcproger@gmail.com",
        "andi@kanvexa.com",
        "budi@kanvexa.com",
        "siti@kanvexa.com"
    ]));

    async function handleAddCard() {
        const trimmedTask = taskName.trim();
        if (!trimmedTask) return;

        setSaving(true);
        let fullTitle = trimmedTask;
        const metaParts = [];
        if (dueDate) metaParts.push(`📅 ${dueDate}`);
        if (dueTime) metaParts.push(`⏰ ${dueTime}`);
        if (assignee.trim()) metaParts.push(`👤 ${assignee.trim()}`);
        if (notes.trim()) metaParts.push(`📝 ${notes.trim()}`);

        if (metaParts.length > 0) {
            fullTitle += ` (${metaParts.join(" • ")})`;
        }

        try {
            await createCard(boardId, columnId, fullTitle);
            onDone();
        } catch (e: any) {
            alert("Gagal menambah kartu: " + e.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div style={{
            background: "#ffffff",
            border: "1px solid var(--v)",
            borderRadius: 12,
            padding: "14px",
            boxShadow: "0 10px 25px rgba(109,40,217,0.12)",
            display: "flex", flexDirection: "column", gap: 10,
        }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--v)" }}>
                Tambah Tugas Baru
            </div>

            {/* 1. Nama Tugas */}
            <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Nama Tugas
                </label>
                <input
                    autoFocus
                    value={taskName}
                    onChange={e => setTaskName(e.target.value)}
                    placeholder="misal: ayo makan, kerjakan revisi..."
                    style={{
                        width: "100%", padding: "7px 10px", borderRadius: 8, fontSize: 13,
                        border: "1px solid #cbd5e1", outline: "none", color: "#0f172a",
                        background: "#f8fafc",
                    }}
                />
            </div>

            {/* 2. Tanggal Selesai & Jam */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
                    <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                        <Calendar style={{ width: 12, height: 12, color: "#4f46e5" }} />
                        <span>Tanggal</span>
                    </label>
                    <input
                        type="date"
                        value={dueDate}
                        onChange={e => setDueDate(e.target.value)}
                        style={{
                            width: "100%", padding: "6px 8px", borderRadius: 7, fontSize: 11,
                            border: "1px solid #cbd5e1", outline: "none", color: "#0f172a",
                            background: "#f8fafc",
                        }}
                    />
                </div>
                <div>
                    <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                        <Clock style={{ width: 12, height: 12, color: "#d97706" }} />
                        <span>Jam</span>
                    </label>
                    <input
                        type="time"
                        value={dueTime}
                        onChange={e => setDueTime(e.target.value)}
                        style={{
                            width: "100%", padding: "6px 8px", borderRadius: 7, fontSize: 11,
                            border: "1px solid #cbd5e1", outline: "none", color: "#0f172a",
                            background: "#f8fafc",
                        }}
                    />
                </div>
            </div>

            {/* 3. Ditugaskan Kepada */}
            <div>
                <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    <User style={{ width: 12, height: 12, color: "#059669" }} />
                    <span>Ditugaskan Kepada (User Terdaftar)</span>
                </label>
                <select
                    value={assignee}
                    onChange={e => setAssignee(e.target.value)}
                    style={{
                        width: "100%", padding: "7px 10px", borderRadius: 8, fontSize: 12,
                        border: "1px solid #cbd5e1", outline: "none", color: "#0f172a",
                        background: "#f8fafc", cursor: "pointer", fontWeight: 500
                    }}
                >
                    <option value="">-- Pilih User Terdaftar --</option>
                    {registeredUsers.map((uEmail) => {
                        const namePart = uEmail.split("@")[0];
                        const isMe = userEmail && uEmail.toLowerCase() === userEmail.toLowerCase();
                        return (
                            <option key={uEmail} value={namePart}>
                                👤 {namePart} ({uEmail}){isMe ? " - Saya" : ""}
                            </option>
                        );
                    })}
                </select>
            </div>

            {/* 4. Catatan / Instructions */}
            <div>
                <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    <FileText style={{ width: 12, height: 12, color: "#64748b" }} />
                    <span>Catatan / Instructions</span>
                </label>
                <textarea
                    rows={2}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Catatan atau instruksi..."
                    style={{
                        width: "100%", padding: "7px 10px", borderRadius: 8, fontSize: 12,
                        border: "1px solid #cbd5e1", outline: "none", color: "#0f172a",
                        background: "#f8fafc", resize: "none", fontFamily: "inherit"
                    }}
                />
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                <button
                    onClick={handleAddCard}
                    disabled={saving || !taskName.trim()}
                    style={{
                        flex: 1, padding: "7px", borderRadius: 7, fontSize: 12, fontWeight: 700,
                        background: "var(--v)", color: "#fff", border: "none",
                        cursor: saving || !taskName.trim() ? "not-allowed" : "pointer",
                        opacity: saving || !taskName.trim() ? 0.6 : 1,
                    }}
                >
                    {saving ? "Menyimpan..." : "Tambah Kartu"}
                </button>
                <button
                    onClick={onCancel}
                    style={{
                        padding: "7px 12px", borderRadius: 7, fontSize: 12,
                        background: "none", border: "1px solid #cbd5e1",
                        color: "#475569", cursor: "pointer",
                    }}
                >
                    Batal
                </button>
            </div>
        </div>
    );
}
