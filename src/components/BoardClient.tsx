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
import {
  CheckSquare,
  Calendar,
  MessageSquare,
  FileText,
  Clock,
  Eye,
  CheckCircle2
} from "lucide-react";
import KanbanColumn from "./KanbanColumn";
import TodoListColumn from "./board/todolist/TodoListColumn";
import TodoListPresetModal from "./board/todolist/TodoListPresetModal";
import AIBreakdownModal from "./AIBreakdownModal";
import MessageBoardView from "./board/MessageBoard/MessageBoardView";
import CalendarView from "./board/Calendar/CalendarView";
import DocsFilesView from "./board/DocsFiles/DocsFilesView";
import type { BoardPost, BoardPostComment } from "./board/MessageBoard/messageboard-utils";
import { moveCard, createColumn, createColumnWithCard } from "@/app/board/[id]/actions";
import { createClient } from "@/lib/supabase/client";

interface Card { id: string; column_id: string; title: string; position: number; }
interface Column { id: string; name: string; position: number; }

interface Props {
  boardId: string;
  userEmail?: string;
  initialColumns: Column[];
  initialCards: Card[];
  initialPosts?: BoardPost[];
  initialComments?: BoardPostComment[];
  isAdmin: boolean;
  canEdit: boolean;
}

const COL_COLORS = ["#6D28D9", "#059669", "#D97706", "#DB2777", "#2563EB", "#DC2626", "#0891B2", "#7C3AED"];

function colColor(index: number, name?: string) {
  if (name) {
    const lower = name.toLowerCase().trim();
    if (lower.includes("review") || lower.includes("peninjauan")) return "#2563eb"; // Biru
    if (lower.includes("proges") || lower.includes("progress") || lower.includes("pengerjaan") || lower.includes("dikerjakan")) return "#d97706"; // Kuning/Amber
    if (lower.includes("done") || lower.includes("selesai") || lower.includes("complete")) return "#059669"; // Hijau
    if (lower.includes("todo") || lower.includes("to-do") || lower.includes("backlog")) return "#7c3aed"; // Ungu
  }
  return COL_COLORS[index % COL_COLORS.length];
}

export default function BoardClient({
  boardId,
  userEmail = "",
  initialColumns,
  initialCards,
  initialPosts = [],
  initialComments = [],
  isAdmin,
  canEdit
}: Props) {
  const router = useRouter();

  // Tab state: "kanban" vs "messageboard" vs "calendar" vs "docs"
  const [activeTab, setActiveTab] = useState<"kanban" | "messageboard" | "calendar" | "docs">("kanban");

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

  const [prevInitialPosts, setPrevInitialPosts] = useState(initialPosts);
  const [posts, setPosts] = useState(initialPosts);
  if (initialPosts !== prevInitialPosts) {
    setPosts(initialPosts);
    setPrevInitialPosts(initialPosts);
  }

  const [prevInitialComments, setPrevInitialComments] = useState(initialComments);
  const [comments, setComments] = useState(initialComments);
  if (initialComments !== prevInitialComments) {
    setComments(initialComments);
    setPrevInitialComments(initialComments);
  }

  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [originalColId, setOriginalColId] = useState<string | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [addingCol, setAddingCol] = useState(false);
  const [colName, setColName] = useState("");
  const [savingCol, setSavingCol] = useState(false);

  // Preset Modal Config State
  const [selectedPresetModal, setSelectedPresetModal] = useState<string | null>(null);

  const openPresetModal = (type: string) => {
    setSelectedPresetModal(type);
    setAddingCol(false);
  };

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
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "board_posts",
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
          table: "board_post_comments",
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

  const sortedCols = [...columns].sort((a, b) => a.position - b.position);
  const activeCard = activeCardId ? cards.find(c => c.id === activeCardId) : null;
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
    const toColId = findColumnId(over.id as string);

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

    const cardId = active.id as string;
    const fromColId = originalColId;
    const toColId = findColumnId(over.id as string);
    if (!fromColId || !toColId) return;

    // Build the new order for the target column
    const targetCards = cardsForCol(toColId).map(c => c.id);
    const overIndex = targetCards.indexOf(over.id as string);
    const fromIndex = targetCards.indexOf(cardId);

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

      {/* Preset Column Config Modal */}
      {selectedPresetModal && (
        <TodoListPresetModal
          boardId={boardId}
          userEmail={userEmail}
          presetType={selectedPresetModal}
          onClose={() => setSelectedPresetModal(null)}
        />
      )}
      {/* Tab Navigation & Action Bar */}
      <div style={{
        padding: "12px 20px 0",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
        gap: 12,
        flexWrap: "wrap",
      }}>
        {/* View Switcher Tabs */}
        <div style={{
          display: "flex",
          gap: 4,
          background: "rgba(241, 245, 249, 0.8)",
          padding: 4,
          borderRadius: 10,
          border: "1px solid var(--border)",
        }}>
          <button
            onClick={() => setActiveTab("kanban")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 7,
              fontSize: 13,
              fontWeight: 600,
              border: "none",
              background: activeTab === "kanban" ? "#ffffff" : "transparent",
              color: activeTab === "kanban" ? "var(--v)" : "#64748b",
              boxShadow: activeTab === "kanban" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <CheckSquare width={14} height={14} />
            <span>Kanban Board</span>
          </button>

          <button
            onClick={() => setActiveTab("messageboard")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 7,
              fontSize: 13,
              fontWeight: 600,
              border: "none",
              background: activeTab === "messageboard" ? "#ffffff" : "transparent",
              color: activeTab === "messageboard" ? "var(--v)" : "#64748b",
              boxShadow: activeTab === "messageboard" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <MessageSquare width={14} height={14} />
            <span>Message Board</span>
            {posts.length > 0 && (
              <span style={{
                background: activeTab === "messageboard" ? "var(--v)" : "#cbd5e1",
                color: "#ffffff",
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 6px",
                borderRadius: 10,
              }}>
                {posts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("calendar")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 7,
              fontSize: 13,
              fontWeight: 600,
              border: "none",
              background: activeTab === "calendar" ? "#ffffff" : "transparent",
              color: activeTab === "calendar" ? "var(--v)" : "#64748b",
              boxShadow: activeTab === "calendar" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <Calendar width={14} height={14} />
            <span>Kalender</span>
          </button>

          <button
            onClick={() => setActiveTab("docs")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 7,
              fontSize: 13,
              fontWeight: 600,
              border: "none",
              background: activeTab === "docs" ? "#ffffff" : "transparent",
              color: activeTab === "docs" ? "var(--v)" : "#64748b",
              boxShadow: activeTab === "docs" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <FileText width={14} height={14} />
            <span>Docs & Files</span>
          </button>
        </div>

        {/* AI Breakdown Button (Shown in Kanban view) */}
        {activeTab === "kanban" && canEdit && (
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
        )}
      </div>

      {/* Main Tab Content */}
      {activeTab === "messageboard" ? (
        <MessageBoardView
          boardId={boardId}
          userEmail={userEmail}
          posts={posts}
          comments={comments}
          columns={columns.map(c => ({ id: c.id, name: c.name }))}
          canEdit={canEdit}
          onTasksCreated={() => {
            setActiveTab("kanban");
            router.refresh();
          }}
        />
      ) : activeTab === "calendar" ? (
        <CalendarView
          boardId={boardId}
          cards={cards}
          columns={columns}
          canEdit={canEdit}
        />
      ) : activeTab === "docs" ? (
        <DocsFilesView
          boardId={boardId}
          userEmail={userEmail}
          canEdit={canEdit}
        />
      ) : (

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
          suppressHydrationWarning
        >
          {sortedCols.map((col, i) => (
            <TodoListColumn
              key={col.id}
              id={col.id}
              boardId={boardId}
              userEmail={userEmail}
              name={col.name}
              accentColor={colColor(i, col.name)}
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
                  width: 275, background: "var(--card)",
                  border: "1px solid var(--v)", borderRadius: 14,
                  padding: "16px", boxShadow: "0 10px 30px rgba(109,40,217,0.15)",
                }}>
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-3)", marginBottom: 10 }}>
                    Pilih Jenis Kolom
                  </div>

                  {/* Preset Column Chips */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                    {[
                      { name: "To-Do List", icon: CheckSquare, desc: "4 Kolom: To-dos, In Progress, In Review & Done", color: "#7c3aed", bg: "#f5f3ff" },
                      { name: "Calendar", icon: Calendar, desc: "Jadwal & deadline", color: "#4f46e5", bg: "#eef2ff" },
                      { name: "Message Board", icon: MessageSquare, desc: "Diskusi & pengumuman", color: "#db2777", bg: "#fdf2f8" },
                      { name: "Docs & Files", icon: FileText, desc: "Dokumen & berkas", color: "#0891b2", bg: "#ecfeff" },
                    ].map((preset, pIdx) => {
                      const IconComponent = preset.icon;
                      return (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => openPresetModal(preset.name)}
                          disabled={savingCol}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "8px 10px",
                            borderRadius: 8,
                            border: "1px solid var(--border)",
                            background: "#ffffff",
                            cursor: savingCol ? "wait" : "pointer",
                            textAlign: "left",
                            transition: "all 0.15s ease",
                          }}
                          onMouseEnter={e => {
                            const el = e.currentTarget as HTMLElement;
                            el.style.borderColor = preset.color;
                            el.style.background = preset.bg;
                          }}
                          onMouseLeave={e => {
                            const el = e.currentTarget as HTMLElement;
                            el.style.borderColor = "var(--border)";
                            el.style.background = "#ffffff";
                          }}
                        >
                          <div style={{
                            width: 28, height: 28, borderRadius: 6,
                            background: preset.bg, color: preset.color,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                          }}>
                            <IconComponent style={{ width: 14, height: 14 }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-1)" }}>
                              {preset.name}
                            </div>
                            <div style={{ fontSize: 10, color: "var(--text-3)" }}>
                              {preset.desc}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", marginBottom: 6 }}>
                      Atau Nama Kustom:
                    </div>
                    <input
                      autoFocus
                      value={colName}
                      onChange={e => setColName(e.target.value)}
                      placeholder="misal: 'Revisi Client'..."
                      onKeyDown={e => {
                        if (e.key === "Enter") handleAddColumn();
                        if (e.key === "Escape") { setColName(""); setAddingCol(false); }
                      }}
                      style={{
                        width: "100%", padding: "8px 10px", borderRadius: 7, fontSize: 13,
                        border: "1px solid var(--border-strong)", outline: "none",
                        color: "var(--text-1)",
                      }}
                    />
                  </div>

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
              borderLeft: `3px solid ${colColor(activeIndex, activeCard ? columns.find(c => c.id === activeCard.column_id)?.name : undefined)}`,
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
      )}
    </>
  );
}

