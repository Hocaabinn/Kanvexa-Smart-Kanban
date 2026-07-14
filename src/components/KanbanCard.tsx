"use client";

import { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { updateCardTitle, deleteCard } from "../app/board/[id]/actions";

interface Props {
    id: string;
    boardId: string;
    title: string;
    accentColor: string;
    canEdit: boolean;
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
    const inputRef = useRef<HTMLTextAreaElement>(null);

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
                background: "var(--card)", border: "1px solid var(--border)",
                borderRadius: 8, padding: "10px 10px 10px 12px",
                borderLeft: `3px solid ${accentColor}`,
                marginBottom: 7, position: "relative",
                transition: "box-shadow 0.15s, border-color 0.15s",
                boxShadow: hovered && !isDragging ? "0 2px 8px rgba(0,0,0,0.07)" : "none",
                cursor: isDragging ? "grabbing" : "default",
            }}>
                {/* Drag handle — only the grip icon triggers drag */}
                {canEdit && (
                    <div
                        {...attributes}
                        {...listeners}
                        style={{
                            position: "absolute", top: 8, left: 3,
                            cursor: isDragging ? "grabbing" : "grab",
                            color: hovered ? "var(--text-3)" : "transparent",
                            transition: "color 0.15s", fontSize: 12, lineHeight: 1,
                            userSelect: "none",
                        }}
                        title="Drag untuk pindahkan"
                    >⠿</div>
                )}

                {/* DELETE button */}
                {hovered && !editing && canEdit && (
                    <button
                        onClick={handleDelete}
                        style={{
                            position: "absolute", top: 6, right: 6,
                            background: "none", border: "none", cursor: "pointer",
                            color: "var(--text-3)", fontSize: 14, lineHeight: 1,
                            padding: "2px 4px", borderRadius: 4,
                            transition: "color 0.15s, background 0.15s",
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#DC2626"; (e.currentTarget as HTMLElement).style.background = "#FEF2F2"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--text-3)"; (e.currentTarget as HTMLElement).style.background = "none"; }}
                        title="Hapus kartu"
                    >×</button>
                )}

                {/* TITLE — inline edit on double click */}
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
                            background: "transparent", fontSize: 13, fontWeight: 500,
                            color: "var(--text-1)", lineHeight: 1.45, fontFamily: "inherit",
                            paddingLeft: 12,
                        }}
                    />
                ) : (
                    <p
                        onDoubleClick={() => canEdit && setEditing(true)}
                        title={canEdit ? "Klik dua kali untuk edit" : undefined}
                        style={{
                            margin: 0, fontSize: 13, fontWeight: 500,
                            color: "var(--text-1)", lineHeight: 1.45,
                            paddingLeft: 12, paddingRight: hovered && canEdit ? 20 : 0,
                            cursor: canEdit ? "text" : "default",
                        }}
                    >
                        {title}
                    </p>
                )}
            </div>
        </div>
    );
}
