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
import { moveCard, createColumn, createColumnWithCard, insertAIBreakdown } from "@/app/board/[id]/actions";
import { createClient } from "@/lib/supabase/client";
import { showAlert } from "@/lib/swal";

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

const AI_STEPS = [
  { id: 1, label: "Query Rewrite", desc: "Menganalisis dan menyusun ulang perintah..." },
  { id: 2, label: "Classify Agent", desc: "Mengklasifikasikan tugas dengan AI..." },
  { id: 3, label: "Router & Mapper", desc: "Mencocokkan kolom & memetakan struktur Kanban..." },
  { id: 4, label: "Database Sync", desc: "Sinkronisasi seluruh kartu tugas ke database..." },
];

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
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiStep, setAiStep] = useState(0);
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

  const handleAISubmit = async (prompt: string, clearExisting: boolean) => {
    setShowAI(false);
    setIsAILoading(true);
    setAiStep(1);

    const t2 = setTimeout(() => setAiStep(2), 1500);
    const t3 = setTimeout(() => setAiStep(3), 3200);

    try {
      const res = await fetch("/API/ai-breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: prompt }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData?.error || "Gagal menghubungi AI.");
      }

      const data = await res.json();
      if (!data.columns || !Array.isArray(data.columns)) {
        throw new Error("Format hasil AI tidak valid.");
      }

      await insertAIBreakdown(boardId, data.columns, clearExisting);
      setAiStep(4);

      setTimeout(() => {
        setIsAILoading(false);
        setAiStep(0);
        router.refresh();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setIsAILoading(false);
      setAiStep(0);
      showAlert("Gagal", err?.message || "Gagal mengurai tugas.", "error");
    } finally {
      clearTimeout(t2);
      clearTimeout(t3);
    }
  };

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

        .node-card-light {
          position: absolute;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          padding: 6px 10px;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.02);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 2;
        }

        .node-card-light.active {
          border-color: var(--v);
          box-shadow: 0 0 12px rgba(109, 40, 217, 0.15);
          transform: translateY(-1px);
        }

        .node-card-light.completed {
          border-color: #10B981;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.1);
        }

        .node-icon-wrapper-light {
          width: 22px;
          height: 22px;
          border-radius: 6px;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          color: #64748b;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .node-icon-wrapper-light.completed {
          background: #ecfdf5 !important;
          color: #10B981 !important;
          font-weight: bold;
        }

        .path-flow {
          stroke-dasharray: 6 12;
          animation: flow 1.2s linear infinite;
        }

        @keyframes flow {
          from {
            stroke-dashoffset: 18;
          }
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes pulseText {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
      {showAI && (
        <AIBreakdownModal
          onClose={() => setShowAI(false)}
          onSubmit={handleAISubmit}
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
      }} className="board-tab-bar">
        {/* View Switcher Tabs */}
        <div style={{
          display: "flex",
          gap: 4,
          background: "rgba(241, 245, 249, 0.8)",
          padding: 4,
          borderRadius: 10,
          border: "1px solid var(--border)",
          overflowX: "auto",
          maxWidth: "100%",
        }} className="board-tabs-scroll scrollbar-hide">
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
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            <CheckSquare width={14} height={14} />
            <span className="tab-label">Kanban Board</span>
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
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            <MessageSquare width={14} height={14} />
            <span className="tab-label">Message Board</span>
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
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            <Calendar width={14} height={14} />
            <span className="tab-label">Kalender</span>
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
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            <FileText width={14} height={14} />
            <span className="tab-label">Docs & Files</span>
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
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "0.88"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
          >
            ✦ Urai dengan AI
          </button>
        )}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .board-tab-bar {
            padding: 10px 12px 0 !important;
          }
          .tab-label {
            display: none;
          }
          .board-tabs-scroll {
            -webkit-overflow-scrolling: touch;
          }
        }
      `}</style>

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
          position: "relative",
        }}
          className="scrollbar-hide"
          suppressHydrationWarning
        >
          {isAILoading && (
            <div style={{
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              background: "rgba(255, 255, 255, 0.45)",
              backdropFilter: "blur(6px)",
              zIndex: 50,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 16,
              animation: "fadeIn 0.25s ease-out",
            }}>
              {/* Visual Dotted Canvas Background (n8n Style - Light Theme Card) */}
              <div className="workflow-canvas-light" style={{
                height: 240,
                width: "100%",
                maxWidth: 580,
                background: "#ffffff",
                backgroundImage: "radial-gradient(rgba(148, 163, 184, 0.25) 1.5px, transparent 1.5px)",
                backgroundSize: "16px 16px",
                position: "relative",
                borderRadius: 16,
                border: "1px solid var(--border-strong)",
                overflow: "hidden",
                marginBottom: 20,
                boxShadow: "0 15px 30px -5px rgba(0,0,0,0.08), 0 8px 12px -6px rgba(0,0,0,0.04)",
              }}>
                {/* SVG Connecting Paths */}
                <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1 }}>
                  <defs>
                    <linearGradient id="activeGradLight" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.85" />
                      <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.85" />
                    </linearGradient>
                    <filter id="glowLight" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Path 1: Query Rewrite -> Classify */}
                  <path d="M 140 120 L 175 120" stroke="rgba(0, 0, 0, 0.08)" strokeWidth="2" fill="none" />
                  {aiStep === 1 && (
                    <path d="M 140 120 L 175 120" stroke="url(#activeGradLight)" strokeWidth="2.5" fill="none" strokeDasharray="6 12" className="path-flow" filter="url(#glowLight)" />
                  )}
                  {aiStep > 1 && (
                    <path d="M 140 120 L 175 120" stroke="#10B981" strokeWidth="2" fill="none" />
                  )}

                  {/* Path 2: Classify -> Router */}
                  <path d="M 260 120 L 290 120" stroke="rgba(0, 0, 0, 0.08)" strokeWidth="2" fill="none" />
                  {aiStep === 2 && (
                    <path d="M 260 120 L 290 120" stroke="url(#activeGradLight)" strokeWidth="2.5" fill="none" strokeDasharray="6 12" className="path-flow" filter="url(#glowLight)" />
                  )}
                  {aiStep > 2 && (
                    <path d="M 260 120 L 290 120" stroke="#10B981" strokeWidth="2" fill="none" />
                  )}

                  {/* Path 3, 4, 5: Router Branches -> AI Breakdown */}
                  {/* Branch Q&A */}
                  <path d="M 390 98 C 405 98, 405 120, 420 120" stroke="rgba(0, 0, 0, 0.08)" strokeWidth="2" fill="none" />
                  {aiStep === 3 && (
                    <path d="M 390 98 C 405 98, 405 120, 420 120" stroke="url(#activeGradLight)" strokeWidth="2.5" fill="none" strokeDasharray="6 12" className="path-flow" filter="url(#glowLight)" />
                  )}
                  {aiStep > 3 && (
                    <path d="M 390 98 C 405 98, 405 120, 420 120" stroke="#10B981" strokeWidth="2" fill="none" />
                  )}

                  {/* Branch Fact Finding */}
                  <path d="M 390 125 C 405 125, 405 120, 420 120" stroke="rgba(0, 0, 0, 0.08)" strokeWidth="2" fill="none" />
                  {aiStep === 3 && (
                    <path d="M 390 125 C 405 125, 405 120, 420 120" stroke="url(#activeGradLight)" strokeWidth="2.5" fill="none" strokeDasharray="6 12" className="path-flow" filter="url(#glowLight)" />
                  )}
                  {aiStep > 3 && (
                    <path d="M 390 125 C 405 125, 405 120, 420 120" stroke="#10B981" strokeWidth="2" fill="none" />
                  )}

                  {/* Branch Else */}
                  <path d="M 390 157 C 405 157, 405 120, 420 120" stroke="rgba(0, 0, 0, 0.08)" strokeWidth="2" fill="none" />
                  {aiStep === 3 && (
                    <path d="M 390 157 C 405 157, 405 120, 420 120" stroke="url(#activeGradLight)" strokeWidth="2.5" fill="none" strokeDasharray="6 12" className="path-flow" filter="url(#glowLight)" />
                  )}
                  {aiStep > 3 && (
                    <path d="M 390 157 C 405 157, 405 120, 420 120" stroke="#10B981" strokeWidth="2" fill="none" />
                  )}
                </svg>

                {/* Node Cards */}
                {/* 1. Query Rewrite Node */}
                <div 
                  className={`node-card-light ${aiStep === 1 ? "active" : ""} ${aiStep > 1 ? "completed" : ""}`}
                  style={{ left: 20, top: 98, width: 120, height: 44 }}
                >
                  <div className={`node-icon-wrapper-light ${aiStep > 1 ? "completed" : ""}`} style={{ color: "#7c3aed", background: "rgba(124, 58, 237, 0.1)" }}>
                    {aiStep > 1 ? "✓" : "🔍"}
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-1)", lineHeight: 1.1 }}>Query rewrite</div>
                    <div style={{ fontSize: 8, color: "var(--text-3)" }}>Agent</div>
                  </div>
                </div>

                {/* 2. Classify Node */}
                <div 
                  className={`node-card-light ${aiStep === 2 ? "active" : ""} ${aiStep > 2 ? "completed" : ""}`}
                  style={{ left: 175, top: 98, width: 85, height: 44 }}
                >
                  <div className={`node-icon-wrapper-light ${aiStep > 2 ? "completed" : ""}`} style={{ color: "#2563eb", background: "rgba(37, 99, 235, 0.1)" }}>
                    {aiStep > 2 ? "✓" : "{ }"}
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-1)", lineHeight: 1.1 }}>Classify</div>
                    <div style={{ fontSize: 8, color: "var(--text-3)" }}>Agent</div>
                  </div>
                </div>

                {/* 3. Router Node */}
                <div 
                  className={`node-card-light ${aiStep === 3 ? "active" : ""} ${aiStep > 3 ? "completed" : ""}`}
                  style={{ left: 290, top: 55, width: 100, height: 130, flexDirection: "column", alignItems: "stretch", padding: 0, gap: 0, overflow: "hidden" }}
                >
                  <div style={{ 
                    background: aiStep > 3 ? "rgba(5, 150, 105, 0.08)" : "rgba(217, 119, 6, 0.08)", 
                    color: aiStep > 3 ? "#059669" : "#d97706", 
                    fontSize: 10, 
                    fontWeight: 800, 
                    padding: "6px 8px",
                    borderBottom: "1px solid var(--border)" 
                  }}>
                    If (Router)
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", fontSize: 9, color: "var(--text-2)", fontWeight: 500 }}>
                    <div style={{ padding: "6px 8px", borderBottom: "1px solid rgba(0,0,0,0.03)", background: aiStep === 3 ? "rgba(109, 40, 217, 0.05)" : "none" }}>Q&A</div>
                    <div style={{ padding: "6px 8px", borderBottom: "1px solid rgba(0,0,0,0.03)", background: aiStep === 3 ? "rgba(109, 40, 217, 0.05)" : "none" }}>Fact finding</div>
                    <div style={{ padding: "6px 8px", background: aiStep === 3 ? "rgba(109, 40, 217, 0.05)" : "none" }}>Else</div>
                  </div>
                </div>

                {/* 4. AI Breakdown Node */}
                <div 
                  className={`node-card-light ${aiStep === 4 ? "active completed" : ""}`}
                  style={{ left: 420, top: 98, width: 100, height: 44 }}
                >
                  <div className={`node-icon-wrapper-light ${aiStep === 4 ? "completed" : ""}`} style={{ color: "#059669", background: "rgba(5, 150, 105, 0.1)" }}>
                    {aiStep === 4 ? "✓" : "⚡"}
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-1)", lineHeight: 1.1 }}>Kanban Sync</div>
                    <div style={{ fontSize: 8, color: "var(--text-3)" }}>DB Sync</div>
                  </div>
                </div>
              </div>

              {/* Steps explanations */}
              <div style={{ 
                textAlign: "center", 
                background: "var(--card)", 
                border: "1px solid var(--border)", 
                borderRadius: 12, 
                padding: "16px 20px",
                minHeight: 82,
                width: "100%",
                maxWidth: 580,
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
              }}>
                <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>
                  {AI_STEPS[Math.max(1, aiStep) - 1]?.label}
                </p>
                <p style={{ 
                  margin: 0, 
                  fontSize: 12, 
                  color: "var(--text-2)", 
                  animation: aiStep < 4 ? "pulseText 1.5s infinite" : "none" 
                }}>
                  {AI_STEPS[Math.max(1, aiStep) - 1]?.desc}
                </p>
              </div>
            </div>
          )}
          {sortedCols.length === 0 ? (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              maxWidth: 440,
              margin: "60px auto",
              padding: "40px 24px",
              background: "rgba(255,255,255,0.75)",
              backdropFilter: "blur(12px)",
              borderRadius: 20,
              border: "1px dashed var(--border-strong)",
              textAlign: "center",
              boxShadow: "0 10px 30px rgba(0,0,0,0.02)",
            }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "rgba(109, 40, 217, 0.08)",
                color: "var(--v)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}>
                <CheckSquare width={24} height={24} />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-1)", margin: "0 0 6px 0" }}>
                Papan Baru Siap Dipakai
              </h3>
              <p style={{ fontSize: 12, color: "var(--text-2)", margin: "0 0 20px 0", lineHeight: 1.6 }}>
                Papan ini belum memiliki kolom tugas. Klik tombol di sebelah kanan untuk membuat kolom pertama Anda, atau gunakan template cepat!
              </p>
              {canEdit && !addingCol && (
                <button
                  onClick={() => setAddingCol(true)}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 700,
                    background: "var(--v)",
                    color: "#ffffff",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(109, 40, 217, 0.2)",
                    transition: "opacity 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  + Tambah Kolom
                </button>
              )}
            </div>
          ) : (
            sortedCols.map((col, i) => (
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
            ))
          )}

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

