"use client";

import { useState, useEffect } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Share2 } from "lucide-react";
import TodoListCard from "./TodoListCard";
import AddTodoListCardForm from "./AddTodoListCardForm";
import { deleteColumn } from "@/app/board/[id]/actions";

interface Card { id: string; title: string; position: number; }

interface Props {
    id: string;
    boardId: string;
    userEmail?: string;
    name: string;
    accentColor: string;
    cards: Card[];
    isAdmin: boolean;
    canEdit: boolean;
}

export default function TodoListColumn({ id, boardId, userEmail = "", name, accentColor, cards, isAdmin, canEdit }: Props) {
    const [addingCard, setAddingCard] = useState(false);
    const [allCompleted, setAllCompleted] = useState(false);
    const [copied, setCopied] = useState(false);

    const { setNodeRef, isOver } = useDroppable({ id });

    const handleShare = () => {
        try {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2200);
        } catch (e) {
            console.error("Gagal menyalin link:", e);
        }
    };

    // Check if all cards in this column are marked as completed
    useEffect(() => {
        if (!cards || cards.length === 0) {
            setAllCompleted(false);
            return;
        }

        const checkCompletion = () => {
            try {
                const isEveryCardDone = cards.every(card => {
                    const stored = localStorage.getItem(`card_completed_${card.id}`);
                    return stored !== null && JSON.parse(stored) === true;
                });
                setAllCompleted(isEveryCardDone);
            } catch (e) {
                setAllCompleted(false);
            }
        };

        checkCompletion();
        window.addEventListener("card_completion_changed", checkCompletion);
        window.addEventListener("storage", checkCompletion);
        const interval = setInterval(checkCompletion, 500);

        return () => {
            window.removeEventListener("card_completion_changed", checkCompletion);
            window.removeEventListener("storage", checkCompletion);
            clearInterval(interval);
        };
    }, [cards]);

    async function handleDeleteColumn() {
        if (!confirm(`Hapus "${name}" beserta semua kartunya?`)) return;
        await deleteColumn(boardId, id);
    }

    const sortedCards = [...cards].sort((a, b) => a.position - b.position);
    const cardIds = sortedCards.map(c => c.id);

    return (
        <div style={{
            width: 290, flexShrink: 0,
            display: "flex", flexDirection: "column",
            maxHeight: "calc(100vh - 140px)",
        }}>
            {/* Column Header Title above Card Container */}
            <div style={{
                padding: "4px 4px 10px 4px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                flexShrink: 0,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 20, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.01em" }}>
                        {name}
                    </span>
                    <span style={{
                        fontSize: 11, fontWeight: 700, borderRadius: 100,
                        background: "rgba(0,0,0,0.06)", color: "var(--text-2)",
                        padding: "2px 8px",
                    }}>
                        {cards.length}
                    </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button
                        onClick={handleShare}
                        title="Bagikan link proyek untuk kolaborasi"
                        style={{
                            background: copied ? "#ecfdf5" : "none",
                            border: copied ? "1px solid #a7f3d0" : "1px solid transparent",
                            cursor: "pointer",
                            color: copied ? "#059669" : "var(--text-3)",
                            fontSize: 12,
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "3px 6px",
                            borderRadius: 6,
                            transition: "all 0.15s ease",
                        }}
                        onMouseEnter={e => {
                            if (!copied) (e.currentTarget as HTMLElement).style.color = "var(--v)";
                        }}
                        onMouseLeave={e => {
                            if (!copied) (e.currentTarget as HTMLElement).style.color = "var(--text-3)";
                        }}
                    >
                        <Share2 style={{ width: 14, height: 14 }} />
                        {copied && <span style={{ fontSize: 10, fontWeight: 700 }}>Disalin!</span>}
                    </button>

                    {isAdmin && (
                        <button
                            onClick={handleDeleteColumn}
                            title={`Hapus "${name}"`}
                            style={{
                                background: "none", border: "none", cursor: "pointer",
                                color: "var(--text-3)", fontSize: 16, lineHeight: 1,
                                padding: "2px 5px", borderRadius: 4,
                                transition: "color 0.15s",
                            }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#DC2626"}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-3)"}
                        >×</button>
                    )}
                </div>
            </div>

            {/* Physical Papan Board Container */}
            <div style={{
                flex: 1,
                background: isOver
                    ? "linear-gradient(180deg, #f5f3ff 0%, #ede9fe 100%)"
                    : "linear-gradient(180deg, #ffffff 0%, #fafafa 60%, #f4f4f5 100%)",
                borderRadius: 20,
                borderLeft: `1.5px solid ${isOver ? "#8b5cf6" : "#cbd5e1"}`,
                borderRight: `1.5px solid ${isOver ? "#8b5cf6" : "#cbd5e1"}`,
                borderBottom: `1.5px solid ${isOver ? "#8b5cf6" : "#cbd5e1"}`,
                borderTop: "5px solid var(--v, #7c3aed)",
                padding: "24px 16px 14px",
                display: "flex", flexDirection: "column",
                position: "relative",
                boxShadow: isOver
                    ? "0 12px 30px rgba(124, 58, 237, 0.15), 0 4px 10px rgba(0,0,0,0.05)"
                    : "0 8px 25px rgba(15, 23, 42, 0.06), 0 2px 6px rgba(15, 23, 42, 0.04), inset 0 1px 0 #ffffff",
                transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                minHeight: 280,
                overflow: "hidden",
            }}>
                {/* Clipboard Metallic Top Bracket Detail */}
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 72,
                    height: 14,
                    background: "linear-gradient(180deg, #cbd5e1 0%, #94a3b8 100%)",
                    borderRadius: "0 0 6px 6px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 10,
                }}>
                    <div style={{
                        width: 8, height: 4, borderRadius: 2,
                        background: "#64748b", boxShadow: "inset 0 1px 1px rgba(0,0,0,0.4)"
                    }} />
                </div>

                {/* Corner Screws / Rivets Accent on Board Container */}
                <div style={{ position: "absolute", top: 10, left: 10, width: 5, height: 5, borderRadius: "50%", background: "radial-gradient(circle at 30% 30%, #e2e8f0, #94a3b8)", opacity: 0.5, pointerEvents: "none" }} />
                <div style={{ position: "absolute", top: 10, right: 10, width: 5, height: 5, borderRadius: "50%", background: "radial-gradient(circle at 30% 30%, #e2e8f0, #94a3b8)", opacity: 0.5, pointerEvents: "none" }} />
                {/* ALL DONE! Stamp Badge */}
                {allCompleted && (
                    <div style={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        pointerEvents: "none",
                        zIndex: 20,
                        animation: "stampPop 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
                    }}>
                        <div style={{
                            width: 80,
                            height: 80,
                            borderRadius: "50%",
                            border: "2.5px double #10b981",
                            background: "rgba(236, 253, 245, 0.95)",
                            backdropFilter: "blur(6px)",
                            color: "#059669",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            transform: "rotate(-14deg)",
                            boxShadow: "0 4px 14px rgba(16, 185, 129, 0.18)",
                            padding: 4,
                        }}>
                            <div style={{ borderBottom: "1px solid #10b981", width: "80%", textAlign: "center", fontSize: 7, fontWeight: 800, letterSpacing: "0.08em", paddingBottom: 1, marginBottom: 1 }}>
                                ✦ STATUS ✦
                            </div>
                            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.05em", lineHeight: 1.1, textAlign: "center" }}>
                                ALL DONE!
                            </div>
                            <div style={{ borderTop: "1px solid #10b981", width: "80%", textAlign: "center", fontSize: 7, fontWeight: 800, letterSpacing: "0.08em", paddingTop: 1, marginTop: 1 }}>
                                COMPLETE
                            </div>
                        </div>
                    </div>
                )}
                <style>{`
                    @keyframes stampPop {
                        0% { transform: scale(1.8) rotate(-35deg); opacity: 0; }
                        100% { transform: scale(1) rotate(-14deg); opacity: 1; }
                    }
                `}</style>

                {/* Cards drop area */}
                <div
                    ref={setNodeRef}
                    style={{ flex: 1, overflowY: "auto", minHeight: 120, paddingRight: 2 }}
                >
                    <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
                        {sortedCards.map(card => (
                            <TodoListCard
                                key={card.id}
                                id={card.id}
                                boardId={boardId}
                                title={card.title}
                                accentColor={accentColor}
                                canEdit={canEdit}
                            />
                        ))}
                    </SortableContext>

                    {cards.length === 0 && !addingCard && (
                        <div style={{
                            padding: "32px 16px", textAlign: "center",
                            fontSize: 13, color: "var(--text-3)",
                            border: "1px dashed var(--border)", borderRadius: 10,
                            margin: "8px 0",
                        }}>
                            Belum ada tugas
                        </div>
                    )}
                </div>

                {/* Add Card Form Footer */}
                {canEdit && (
                    <div style={{ paddingTop: 10, borderTop: "1px solid var(--border)", marginTop: 8, flexShrink: 0 }}>
                        {addingCard ? (
                            <AddTodoListCardForm
                                boardId={boardId}
                                columnId={id}
                                userEmail={userEmail}
                                onDone={() => setAddingCard(false)}
                                onCancel={() => setAddingCard(false)}
                            />
                        ) : (
                            <button
                                onClick={() => setAddingCard(true)}
                                style={{
                                    width: "100%", padding: "8px 12px", borderRadius: 8,
                                    border: "1px dashed var(--border-strong)", background: "transparent",
                                    color: "var(--text-3)", cursor: "pointer", fontSize: 13,
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                    transition: "all 0.15s",
                                }}
                                onMouseEnter={e => {
                                    const el = e.currentTarget as HTMLElement;
                                    el.style.background = "rgba(109,40,217,0.04)";
                                    el.style.color = "var(--v)";
                                    el.style.borderColor = "var(--v)";
                                }}
                                onMouseLeave={e => {
                                    const el = e.currentTarget as HTMLElement;
                                    el.style.background = "transparent";
                                    el.style.color = "var(--text-3)";
                                    el.style.borderColor = "var(--border-strong)";
                                }}
                            >
                                <span>+</span> Tambah kartu
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
