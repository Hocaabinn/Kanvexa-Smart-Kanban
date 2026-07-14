"use client";

import { useState, useRef, useEffect } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import KanbanCard from "./KanbanCard";
import { createCard, deleteColumn } from "../app/board/[id]/actions";

interface Card { id: string; title: string; position: number; }

interface Props {
    id: string;
    boardId: string;
    name: string;
    accentColor: string;
    cards: Card[];
    isAdmin: boolean;
    canEdit: boolean;
}

export default function KanbanColumn({ id, boardId, name, accentColor, cards, isAdmin, canEdit }: Props) {
    const [addingCard, setAddingCard] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [saving, setSaving] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const { setNodeRef, isOver } = useDroppable({ id });

    useEffect(() => {
        if (addingCard) textareaRef.current?.focus();
    }, [addingCard]);

    async function handleAddCard() {
        const trimmed = newTitle.trim();
        if (!trimmed) { setAddingCard(false); return; }
        setSaving(true);
        await createCard(boardId, id, trimmed);
        setNewTitle("");
        setSaving(false);
        setAddingCard(false);
    }

    async function handleDeleteColumn() {
        if (!confirm(`Hapus kolom "${name}" beserta semua kartunya?`)) return;
        await deleteColumn(boardId, id);
    }

    const sortedCards = [...cards].sort((a, b) => a.position - b.position);
    const cardIds = sortedCards.map(c => c.id);

    return (
        <div style={{
            width: 272, flexShrink: 0,
            background: isOver ? "#EDEBFF" : "#F2F1EE",
            borderRadius: 12, border: `1px solid ${isOver ? "#C4B5FD" : "var(--border)"}`,
            display: "flex", flexDirection: "column",
            maxHeight: "calc(100vh - 140px)",
            transition: "background 0.15s, border-color 0.15s",
        }}>
            {/* Column header */}
            <div style={{
                padding: "11px 12px 9px",
                display: "flex", alignItems: "center", gap: 7,
                borderBottom: "1px solid var(--border)", flexShrink: 0,
            }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: accentColor, flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", flex: 1 }}>{name}</span>
                <span style={{
                    fontSize: 11, fontWeight: 600, borderRadius: 100,
                    background: "rgba(0,0,0,0.07)", color: "var(--text-2)",
                    padding: "1px 7px", marginRight: isAdmin ? 2 : 0,
                }}>
                    {cards.length}
                </span>
                {isAdmin && (
                    <button
                        onClick={handleDeleteColumn}
                        title={`Hapus kolom "${name}"`}
                        style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: "var(--text-3)", fontSize: 16, lineHeight: 1,
                            padding: "1px 3px", borderRadius: 4,
                            transition: "color 0.15s",
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#DC2626"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-3)"}
                    >×</button>
                )}
            </div>

            {/* Cards drop area */}
            <div
                ref={setNodeRef}
                style={{ flex: 1, overflowY: "auto", padding: "8px 8px 0" }}
            >
                <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
                    {sortedCards.map(card => (
                        <KanbanCard
                            key={card.id}
                            id={card.id}
                            boardId={boardId}
                            title={card.title}
                            accentColor={accentColor}
                            canEdit={canEdit}
                        />
                    ))}
                </SortableContext>

                {/* Placeholder when column is empty and being hovered */}
                {cards.length === 0 && !isOver && !addingCard && (
                    <div style={{
                        border: "1.5px dashed var(--border-strong)", borderRadius: 8,
                        padding: "18px 12px", textAlign: "center", marginBottom: 8,
                    }}>
                        <p style={{ margin: 0, fontSize: 12, color: "var(--text-3)" }}>Belum ada kartu</p>
                    </div>
                )}
            </div>

            {/* Add card area */}
            {canEdit && (
                <div style={{ padding: "6px 8px 8px", flexShrink: 0 }}>
                    {addingCard ? (
                        <div style={{
                            background: "var(--card)", border: "1px solid var(--v)",
                            borderRadius: 8, padding: "8px",
                            boxShadow: "0 0 0 3px rgba(109,40,217,0.1)",
                        }}>
                            <textarea
                                ref={textareaRef}
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                                placeholder="Judul kartu..."
                                rows={2}
                                disabled={saving}
                                onKeyDown={e => {
                                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddCard(); }
                                    if (e.key === "Escape") { setNewTitle(""); setAddingCard(false); }
                                }}
                                style={{
                                    width: "100%", resize: "none", border: "none", outline: "none",
                                    background: "transparent", fontSize: 13, color: "var(--text-1)",
                                    fontFamily: "inherit", lineHeight: 1.45, marginBottom: 8,
                                }}
                            />
                            <div style={{ display: "flex", gap: 6 }}>
                                <button
                                    onClick={handleAddCard}
                                    disabled={saving || !newTitle.trim()}
                                    style={{
                                        flex: 1, padding: "6px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                                        background: "var(--v)", color: "#fff", border: "none",
                                        cursor: saving || !newTitle.trim() ? "not-allowed" : "pointer",
                                        opacity: saving || !newTitle.trim() ? 0.6 : 1,
                                    }}
                                >
                                    {saving ? "Menyimpan..." : "Simpan"}
                                </button>
                                <button
                                    onClick={() => { setNewTitle(""); setAddingCard(false); }}
                                    style={{
                                        padding: "6px 10px", borderRadius: 6, fontSize: 12,
                                        background: "none", border: "1px solid var(--border-strong)",
                                        color: "var(--text-2)", cursor: "pointer",
                                    }}
                                >
                                    Batal
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setAddingCard(true)}
                            style={{
                                width: "100%", padding: "7px", borderRadius: 8, fontSize: 13,
                                border: "1px dashed var(--border-strong)", background: "transparent",
                                color: "var(--text-3)", cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                                transition: "background 0.15s, color 0.15s, border-color 0.15s",
                            }}
                            onMouseEnter={e => {
                                const el = e.currentTarget as HTMLElement;
                                el.style.background = "var(--card)";
                                el.style.color = "var(--text-1)";
                                el.style.borderColor = "var(--v)";
                            }}
                            onMouseLeave={e => {
                                const el = e.currentTarget as HTMLElement;
                                el.style.background = "transparent";
                                el.style.color = "var(--text-3)";
                                el.style.borderColor = "var(--border-strong)";
                            }}
                        >
                            <span style={{ fontSize: 16 }}>+</span> Tambah kartu
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
