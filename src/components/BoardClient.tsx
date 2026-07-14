"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import KanbanColumn from "./KanbanColumn";
import AIBreakdownModal from "./AIBreakdownModal";
import { moveCard, createColumn } from "@/app/board/[id]/actions";
import { createClient } from "@/lib/supabase/client";

interface Card   { id: string; column_id: string; title: string; position: number; }
interface Column { id: string; name: string; position: number; }

interface Props {
  boardId: string;
  initialColumns: Column[];
  initialCards: Card[];
  isAdmin: boolean;
  canEdit: boolean;
}

const COL_COLORS = ["#6D28D9","#059669","#D97706","#DB2777","#2563EB","#DC2626","#0891B2","#7C3AED"];

function colColor(index: number) { return COL_COLORS[index % COL_COLORS.length]; }

export default function BoardClient({ boardId, initialColumns, initialCards, isAdmin, canEdit }: Props) {
  const router = useRouter();

  // Derived state from props to allow server-side updates / revalidations to reflect in client state
  const [prevInitialColumns, setPrevInitialColumns] = useState(initialColumns);
  const [columns, setColumns] = useState(initialColumns);
  if (initialColumns !== prevInitialColumns) {
    setColumns(initialColumns);
    setPrevInitialColumns(initialColumns);
  }

  const [prevInitialCards, setPrevInitialCards] = useState(initialCards);
  const [cards, setCards] = useState(initialCards);
  if (initialCards !== prevInitialCards) {
    setCards(initialCards);
    setPrevInitialCards(initialCards);
  }

  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [originalColId, setOriginalColId] = useState<string | null>(null);
  const [showAI, setShowAI]             = useState(false);
  const [addingCol, setAddingCol]       = useState(false);
  const [colName, setColName]           = useState("");
  const [savingCol, setSavingCol]       = useState(false);

  // Real-time synchronization via Supabase Realtime
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`board-realtime:${boardId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "board_columns",
          filter: `board_id=eq.${boardId}`,
        },
        () => {
          router.refresh();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cards",
          filter: `board_id=eq.${boardId}`,
        },
        () => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [boardId, router]);

  // Parallax background movement based on cursor direction
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate offset from center of screen and scale down for subtle parallax
      const x = (e.clientX - window.innerWidth / 2) * -0.035;
      const y = (e.clientY - window.innerHeight / 2) * -0.035;
      
      document.documentElement.style.setProperty("--bg-pan-x", `${x}px`);
      document.documentElement.style.setProperty("--bg-pan-y", `${y}px`);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const sortedCols  = [...columns].sort((a, b) => a.position - b.position);
  const activeCard  = activeCardId ? cards.find(c => c.id === activeCardId) : null;
  const activeIndex = activeCard ? columns.findIndex(col => col.id === activeCard.column_id) : -1;

  function cardsForCol(colId: string) {
    return cards.filter(c => c.column_id === colId).sort((a, b) => a.position - b.position);
  }

  // ── Which column does a draggable-id belong to? ──────────────────────────
  // Could be a card id (look up its column_id) or a column id (the column itself)
  function findColumnId(draggableId: string): string | null {
    const card = cards.find(c => c.id === draggableId);
    if (card) return card.column_id;
    if (columns.find(c => c.id === draggableId)) return draggableId;
    return null;
  }

  function handleDragStart({ active }: DragStartEvent) {
    if (!canEdit) return;
    setActiveCardId(active.id as string);
    const card = cards.find(c => c.id === active.id);
    if (card) {
      setOriginalColId(card.column_id);
    }
  }

  const handleDragOver = useCallback(({ active, over }: DragOverEvent) => {
    if (!canEdit || !over || active.id === over.id) return;

    const fromColId = findColumnId(active.id as string);
    const toColId   = findColumnId(over.id as string);

    if (!fromColId || !toColId || fromColId === toColId) return;

    // Move card to a different column optimistically
    setCards(prev => prev.map(c =>
      c.id === active.id ? { ...c, column_id: toColId, position: 9999 } : c
    ));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards, columns, canEdit]);

  async function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveCardId(null);
    setOriginalColId(null);
    if (!canEdit || !over || active.id === over.id) return;

    const cardId    = active.id as string;
    const fromColId = originalColId;
    const toColId   = findColumnId(over.id as string);
    if (!fromColId || !toColId) return;

    // Build the new order for the target column
    const targetCards = cardsForCol(toColId).map(c => c.id);
    const overIndex   = targetCards.indexOf(over.id as string);
    const fromIndex   = targetCards.indexOf(cardId);

    let reordered: string[];
    if (fromColId === toColId) {
      if (overIndex >= 0 && fromIndex >= 0) {
        reordered = arrayMove(targetCards, fromIndex, overIndex);
      } else {
        reordered = targetCards;
      }
    } else {
      reordered = [...targetCards.filter(id => id !== cardId)];
      const insertAt = overIndex >= 0 ? overIndex : reordered.length;
      reordered.splice(insertAt, 0, cardId);
    }

    // Apply optimistic positions
    setCards(prev => prev.map(c => {
      const idx = reordered.indexOf(c.id);
      return idx >= 0 ? { ...c, column_id: toColId, position: idx } : c;
    }));

    const columnOrders = [{ columnId: toColId, cardIds: reordered }];
    if (fromColId !== toColId) {
      const sourceCards = cardsForCol(fromColId)
        .filter(c => c.id !== cardId)
        .map(c => c.id);
      columnOrders.push({ columnId: fromColId, cardIds: sourceCards });
    }

    await moveCard(boardId, cardId, toColId, columnOrders);
  }

  async function handleAddColumn() {
    const trimmed = colName.trim();
    if (!trimmed) { setAddingCol(false); return; }
    setSavingCol(true);
    await createColumn(boardId, trimmed);
    setColName("");
    setSavingCol(false);
    setAddingCol(false);
  }

  return (
    <>
      {/* Interactive moving blurred dotted-grid background */}
      <div className="board-grid-bg" style={{
        position: "fixed",
        top: "-50px",
        left: "-50px",
        right: "-50px",
        bottom: "-50px",
        zIndex: -1,
        transform: "translate(var(--bg-pan-x, 0px), var(--bg-pan-y, 0px))",
        transition: "transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        pointerEvents: "none",
      }} />
      <style>{`
        @keyframes moveGrid {
          0% {
            background-position: 0 0, 0 0, 0 0;
          }
          100% {
            background-position: 40px 40px, 40px 40px, 40px 40px;
          }
        }
        .board-grid-bg {
          background-color: #ffffff;
          background-image: 
            radial-gradient(circle at 0px 0px, rgba(148, 163, 184, 0.22) 2.2px, transparent 2.2px), 
            linear-gradient(to right, rgba(226, 232, 240, 0.42) 1px, transparent 1px), 
            linear-gradient(to bottom, rgba(226, 232, 240, 0.42) 1px, transparent 1px);
          background-size: 40px 40px;
          filter: blur(0.6px);
          animation: moveGrid 50s linear infinite;
        }
      `}</style>
      {showAI && (
        <AIBreakdownModal
          boardId={boardId}
          onClose={() => setShowAI(false)}
          onDone={() => { setShowAI(false); router.refresh(); }}
        />
      )}
      {canEdit && (
        <div style={{
          padding: "12px 20px 0",
          display: "flex", justifyContent: "flex-end",
          flexShrink: 0,
        }}>
          <button
            onClick={() => setShowAI(true)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: "var(--v)", color: "#fff", border: "none", cursor: "pointer",
              boxShadow: "0 2px 8px rgba(109,40,217,0.3)",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "0.88"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
          >
            ✦ Urai dengan AI
          </button>
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div style={{
          display: "flex", gap: 14, alignItems: "flex-start",
          padding: "20px 20px 28px", overflowX: "auto", flex: 1,
          minHeight: 0,
        }}
          className="scrollbar-hide"
        >
          {sortedCols.map((col, i) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              boardId={boardId}
              name={col.name}
              accentColor={colColor(i)}
              cards={cardsForCol(col.id)}
              isAdmin={isAdmin}
              canEdit={canEdit}
            />
          ))}

          {/* Add column */}
          {isAdmin && (
            <div style={{ flexShrink: 0 }}>
              {addingCol ? (
                <div style={{
                  width: 260, background: "var(--card)",
                  border: "1px solid var(--v)", borderRadius: 12,
                  padding: "14px", boxShadow: "0 0 0 3px rgba(109,40,217,0.1)",
                }}>
                  <input
                    autoFocus
                    value={colName}
                    onChange={e => setColName(e.target.value)}
                    placeholder="Nama kolom..."
                    onKeyDown={e => {
                      if (e.key === "Enter") handleAddColumn();
                      if (e.key === "Escape") { setColName(""); setAddingCol(false); }
                    }}
                    style={{
                      width: "100%", padding: "8px 10px", borderRadius: 7, fontSize: 13,
                      border: "1px solid var(--border-strong)", outline: "none",
                      marginBottom: 10, color: "var(--text-1)",
                    }}
                  />
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={handleAddColumn}
                      disabled={savingCol || !colName.trim()}
                      style={{
                        flex: 1, padding: "7px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                        background: "var(--v)", color: "#fff", border: "none",
                        cursor: savingCol || !colName.trim() ? "not-allowed" : "pointer",
                        opacity: savingCol || !colName.trim() ? 0.6 : 1,
                      }}
                    >
                      {savingCol ? "Menyimpan..." : "Tambah"}
                    </button>
                    <button
                      onClick={() => { setColName(""); setAddingCol(false); }}
                      style={{
                        padding: "7px 10px", borderRadius: 6, fontSize: 12,
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
                  onClick={() => setAddingCol(true)}
                  style={{
                    width: 250, padding: "13px 16px", borderRadius: 12,
                    border: "2px dashed var(--border-strong)", background: "transparent",
                    color: "var(--text-3)", cursor: "pointer", fontSize: 13,
                    display: "flex", alignItems: "center", gap: 6,
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "var(--card)";
                    el.style.color = "var(--text-2)";
                    el.style.borderColor = "var(--v)";
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "transparent";
                    el.style.color = "var(--text-3)";
                    el.style.borderColor = "var(--border-strong)";
                  }}
                >
                  <span style={{ fontSize: 18 }}>+</span> Tambah kolom
                </button>
              )}
            </div>
          )}
        </div>

        {/* Drag overlay — ghost that follows the cursor */}
        <DragOverlay>
          {activeCard && (
            <div style={{
              background: "var(--card)", border: "1px solid var(--border)",
              borderRadius: 8, padding: "10px 12px",
              borderLeft: `3px solid ${colColor(activeIndex)}`,
              boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
              cursor: "grabbing", width: 256,
            }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "var(--text-1)", lineHeight: 1.45 }}>
                {activeCard.title}
              </p>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </>
  );
}
