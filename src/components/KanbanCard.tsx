"use client";

import { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, Clock, User, FileText } from "lucide-react";
import { updateCardTitle, deleteCard } from "../app/board/[id]/actions";

interface Props {
    id: string;
    boardId: string;
    title: string;
    accentColor: string;
    canEdit: boolean;
}

function parseCardTitle(rawTitle: string) {
    const match = rawTitle.match(/^(.*?)(?:\s*\((.*?)\))?$/);
    if (!match) return { mainTitle: rawTitle, meta: null };

    const mainTitle = match[1].trim() || rawTitle;
    const metaStr = match[2];

    if (!metaStr) return { mainTitle, meta: null };

    let dueDate: string | null = null;
    let dueTime: string | null = null;
    let assignee: string | null = null;
    let notes: string | null = null;

    const parts = metaStr.split("•").map(p => p.trim());
    for (const part of parts) {
        if (part.startsWith("📅")) {
            dueDate = part.replace("📅", "").trim();
        } else if (part.startsWith("⏰")) {
            dueTime = part.replace("⏰", "").trim();
        } else if (part.startsWith("👤")) {
            assignee = part.replace("👤", "").trim();
        } else if (part.startsWith("📝")) {
            notes = part.replace("📝", "").trim();
        } else if (part.length > 0) {
            notes = notes ? `${notes} • ${part}` : part;
        }
    }

    return { mainTitle, meta: (dueDate || dueTime || assignee || notes) ? { dueDate, dueTime, assignee, notes } : null };
}

export default function KanbanCard({ id, boardId, title, accentColor, canEdit }: Props) {
    const [editing, setEditing] = useState(false);
    const [prevTitle, setPrevTitle] = useState(title);
    const [value, setValue] = useState(title);
    if (title !== prevTitle) {
        setValue(title);
        setPrevTitle(title);
    }
    const [hovered, setHovered] = useState(false);
    const [saving, setSaving] = useState(false);
    const [completed, setCompleted] = useState(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const { mainTitle, meta } = parseCardTitle(title);

    // Sync completion state from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(`card_completed_${id}`);
            if (stored !== null) {
                setCompleted(JSON.parse(stored));
            }
        } catch (e) {
            console.error("Gagal memuat status centang:", e);
        }
    }, [id]);

    const toggleCompleted = (e: React.MouseEvent) => {
        e.stopPropagation();
        const nextState = !completed;
        setCompleted(nextState);
        try {
            localStorage.setItem(`card_completed_${id}`, JSON.stringify(nextState));
            window.dispatchEvent(new Event("card_completion_changed"));
        } catch (e) {
            console.error("Gagal menyimpan status centang:", e);
        }
    };

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id, disabled: !canEdit });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.45 : 1,
        zIndex: isDragging ? 999 : undefined,
    };

    useEffect(() => {
        if (editing) inputRef.current?.focus();
    }, [editing]);

    async function handleSave() {
        const trimmed = value.trim();
        if (!trimmed || trimmed === title) { setValue(title); setEditing(false); return; }
        setSaving(true);
        await updateCardTitle(boardId, id, trimmed);
        setSaving(false);
        setEditing(false);
    }

    async function handleDelete(e: React.MouseEvent) {
        e.stopPropagation();
        if (!confirm("Hapus kartu ini?")) return;
        await deleteCard(boardId, id);
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: "12px",
                borderLeft: `4px solid ${accentColor}`,
                marginBottom: 8,
                position: "relative",
                transition: "all 0.15s ease",
                boxShadow: hovered && !isDragging
                  ? "0 8px 18px -4px rgba(0,0,0,0.06), 0 4px 6px -2px rgba(0,0,0,0.02)"
                  : "0 2px 4px rgba(0,0,0,0.02)",
                cursor: isDragging ? "grabbing" : "default",
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
            }}>
                {/* Drag handle — only the grip icon triggers drag */}
                {canEdit && (
                    <div
                        {...attributes}
                        {...listeners}
                        style={{
                            position: "absolute", top: 10, left: 3,
                            cursor: isDragging ? "grabbing" : "grab",
                            color: hovered ? "#94a3b8" : "transparent",
                            transition: "color 0.15s", fontSize: 12, lineHeight: 1,
                            userSelect: "none",
                        }}
                        title="Drag untuk pindahkan"
                    >⠿</div>
                )}

                {/* Checkbox / Kotak Centang */}
                <button
                    type="button"
                    onClick={toggleCompleted}
                    title={completed ? "Tandai belum selesai" : "Tandai selesai"}
                    style={{
                        width: 17,
                        height: 17,
                        borderRadius: 5,
                        border: completed ? "none" : "1.5px solid #cbd5e1",
                        background: completed ? "var(--v)" : "#ffffff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: 2,
                        marginLeft: canEdit ? 8 : 0,
                        padding: 0,
                        transition: "all 0.15s ease",
                    }}
                >
                    {completed && (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    )}
                </button>

                {/* DELETE button */}
                {hovered && !editing && canEdit && (
                    <button
                        onClick={handleDelete}
                        style={{
                            position: "absolute", top: 8, right: 8,
                            background: "none", border: "none", cursor: "pointer",
                            color: "#94a3b8", fontSize: 14, lineHeight: 1,
                            padding: "2px 5px", borderRadius: 4,
                            transition: "color 0.15s, background 0.15s",
                            zIndex: 10,
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#DC2626"; (e.currentTarget as HTMLElement).style.background = "#FEF2F2"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#94a3b8"; (e.currentTarget as HTMLElement).style.background = "none"; }}
                        title="Hapus kartu"
                    >×</button>
                )}

                {/* TITLE & RICH CARD CONTENT */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    {editing ? (
                        <textarea
                            ref={inputRef}
                            value={value}
                            onChange={e => setValue(e.target.value)}
                            onBlur={handleSave}
                            onKeyDown={e => {
                                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSave(); }
                                if (e.key === "Escape") { setValue(title); setEditing(false); }
                            }}
                            rows={2}
                            disabled={saving}
                            style={{
                                width: "100%", resize: "none", border: "none", outline: "none",
                                background: "transparent", fontSize: 13, fontWeight: 600,
                                color: "#0f172a", lineHeight: 1.45, fontFamily: "inherit",
                            }}
                        />
                    ) : (
                        <div>
                            {/* Main Title */}
                            <p
                                onDoubleClick={() => canEdit && setEditing(true)}
                                title={canEdit ? "Klik dua kali untuk edit" : undefined}
                                style={{
                                    margin: 0,
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: completed ? "#94a3b8" : "#0f172a",
                                    textDecoration: completed ? "line-through" : "none",
                                    opacity: completed ? 0.65 : 1,
                                    lineHeight: 1.4,
                                    paddingRight: hovered && canEdit ? 18 : 0,
                                    cursor: canEdit ? "text" : "default",
                                    transition: "all 0.15s ease",
                                }}
                            >
                                {mainTitle}
                            </p>

                            {/* Rich Metadata Card Pills & Badges */}
                            {meta && (
                                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                                        {meta.dueDate && (
                                            <span style={{
                                                display: "inline-flex", alignItems: "center", gap: 5,
                                                fontSize: 11, fontWeight: 600, color: "#4f46e5",
                                                background: "#eef2ff", border: "1px solid #e0e7ff",
                                                padding: "3px 8px", borderRadius: 6,
                                            }}>
                                                <Calendar style={{ width: 12, height: 12 }} />
                                                {meta.dueDate}
                                            </span>
                                        )}
                                        {meta.dueTime && (
                                            <span style={{
                                                display: "inline-flex", alignItems: "center", gap: 5,
                                                fontSize: 11, fontWeight: 600, color: "#d97706",
                                                background: "#fef3c7", border: "1px solid #fde68a",
                                                padding: "3px 8px", borderRadius: 6,
                                            }}>
                                                <Clock style={{ width: 12, height: 12 }} />
                                                {meta.dueTime}
                                            </span>
                                        )}
                                        {meta.assignee && (
                                            <span style={{
                                                display: "inline-flex", alignItems: "center", gap: 5,
                                                fontSize: 11, fontWeight: 600, color: "#059669",
                                                background: "#ecfdf5", border: "1px solid #a7f3d0",
                                                padding: "3px 8px", borderRadius: 6,
                                            }}>
                                                <User style={{ width: 12, height: 12 }} />
                                                {meta.assignee}
                                            </span>
                                        )}
                                    </div>
                                    {meta.notes && (
                                        <div style={{
                                            display: "flex", alignItems: "flex-start", gap: 6,
                                            fontSize: 11, color: "#475569", background: "#f8fafc",
                                            border: "1px solid #f1f5f9", borderRadius: 6, padding: "6px 8px",
                                            lineHeight: 1.4, fontWeight: 500,
                                        }}>
                                            <FileText style={{ width: 12, height: 12, marginTop: 2, flexShrink: 0, color: "#94a3b8" }} />
                                            <span>{meta.notes}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
