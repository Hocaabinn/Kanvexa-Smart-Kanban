"use client";

import { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, Clock, User, FileText } from "lucide-react";
import { updateCardTitle, deleteCard } from "@/app/board/[id]/actions";
import { parseCardTitle } from "./todo-utils";

interface Props {
  id: string;
  boardId: string;
  title: string;
  accentColor: string;
  canEdit: boolean;
}

export default function TodoListCard({
  id,
  boardId,
  title,
  accentColor,
  canEdit,
}: Props) {
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

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !canEdit });

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
    if (!trimmed || trimmed === title) {
      setValue(title);
      setEditing(false);
      return;
    }
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
      {/* Physical Plank/Papan Card */}
      <div
        style={{
          position: "relative",
          background: completed
            ? "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)"
            : "linear-gradient(135deg, #ffffff 0%, #fdfdfd 50%, #f8fafc 100%)",
          borderTop: `1px solid ${completed ? "#e2e8f0" : "#cbd5e1"}`,
          borderRight: `1px solid ${completed ? "#e2e8f0" : "#cbd5e1"}`,
          borderBottom: `1px solid ${completed ? "#e2e8f0" : "#cbd5e1"}`,
          borderLeft: `6px solid ${accentColor}`,
          borderRadius: 14,
          padding: "13px 14px 12px 14px",
          marginBottom: 10,
          transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
          transform:
            hovered && !isDragging ? "translateY(-3px) scale(1.01)" : "none",
          boxShadow: isDragging
            ? "0 20px 30px -10px rgba(15,23,42,0.25), 0 10px 15px -5px rgba(15,23,42,0.15)"
            : hovered
              ? "0 12px 24px -4px rgba(15, 23, 42, 0.12), 0 4px 8px -2px rgba(15, 23, 42, 0.06), inset 0 1px 0 #ffffff"
              : "0 4px 12px -2px rgba(15, 23, 42, 0.06), 0 2px 4px -1px rgba(15, 23, 42, 0.03), inset 0 1px 0 #ffffff",
          cursor: isDragging ? "grabbing" : "default",
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          overflow: "hidden",
        }}
      >
        {/* Metallic Plank Pegs/Rivets Accent */}
        <div
          style={{
            position: "absolute",
            top: 7,
            right: 12,
            display: "flex",
            gap: 5,
            pointerEvents: "none",
            opacity: 0.5,
          }}
        >
          <div
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 30% 30%, #e2e8f0 0%, #94a3b8 100%)",
              boxShadow: "inset 0 0.5px 1px rgba(0,0,0,0.3)",
            }}
          />
        </div>

        {/* Drag handle */}
        {canEdit && (
          <div
            {...attributes}
            {...listeners}
            suppressHydrationWarning
            style={{
              position: "absolute",
              top: 12,
              left: 3,
              cursor: isDragging ? "grabbing" : "grab",
              color: hovered ? "#94a3b8" : "transparent",
              transition: "color 0.15s",
              fontSize: 12,
              lineHeight: 1,
              userSelect: "none",
            }}
            title="Drag untuk pindahkan papan"
          >
            ⠿
          </div>
        )}

        {/* Checkbox / Kotak Centang */}
        <button
          type="button"
          onClick={toggleCompleted}
          title={completed ? "Tandai belum selesai" : "Tandai selesai"}
          style={{
            width: 18,
            height: 18,
            borderRadius: 6,
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
            boxShadow: completed
              ? "0 2px 5px rgba(109, 40, 217, 0.3)"
              : "inset 0 1px 2px rgba(0,0,0,0.05)",
            transition: "all 0.15s ease",
          }}
        >
          {completed && (
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>

        {/* Delete button */}
        {hovered && !editing && canEdit && (
          <button
            onClick={handleDelete}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#94a3b8",
              fontSize: 14,
              lineHeight: 1,
              padding: "2px 5px",
              borderRadius: 4,
              transition: "color 0.15s, background 0.15s",
              zIndex: 10,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#DC2626";
              (e.currentTarget as HTMLElement).style.background = "#FEF2F2";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#94a3b8";
              (e.currentTarget as HTMLElement).style.background = "none";
            }}
            title="Hapus kartu papan"
          >
            ×
          </button>
        )}

        {/* Title & Metadata Badges */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {editing ? (
            <textarea
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSave();
                }
                if (e.key === "Escape") {
                  setValue(title);
                  setEditing(false);
                }
              }}
              rows={2}
              disabled={saving}
              style={{
                width: "100%",
                resize: "none",
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: 13,
                fontWeight: 600,
                color: "#0f172a",
                lineHeight: 1.45,
                fontFamily: "inherit",
              }}
            />
          ) : (
            <div>
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

              {/* Metadata Badges */}
              {meta && (
                <div
                  style={{
                    marginTop: 8,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 6,
                      alignItems: "center",
                    }}
                  >
                    {meta.dueDate && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#4f46e5",
                          background: "#eef2ff",
                          border: "1px solid #e0e7ff",
                          padding: "3px 8px",
                          borderRadius: 6,
                        }}
                      >
                        <Calendar style={{ width: 12, height: 12 }} />
                        {meta.dueDate}
                      </span>
                    )}
                    {meta.dueTime && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#d97706",
                          background: "#fef3c7",
                          border: "1px solid #fde68a",
                          padding: "3px 8px",
                          borderRadius: 6,
                        }}
                      >
                        <Clock style={{ width: 12, height: 12 }} />
                        {meta.dueTime}
                      </span>
                    )}
                    {meta.assignee && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#059669",
                          background: "#ecfdf5",
                          border: "1px solid #a7f3d0",
                          padding: "3px 8px",
                          borderRadius: 6,
                        }}
                      >
                        <User style={{ width: 12, height: 12 }} />
                        {meta.assignee}
                      </span>
                    )}
                  </div>
                  {meta.notes && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 6,
                        fontSize: 11,
                        color: "#475569",
                        background: "#f8fafc",
                        border: "1px solid #f1f5f9",
                        borderRadius: 6,
                        padding: "6px 8px",
                        lineHeight: 1.4,
                        fontWeight: 500,
                      }}
                    >
                      <FileText
                        style={{
                          width: 12,
                          height: 12,
                          marginTop: 2,
                          flexShrink: 0,
                          color: "#94a3b8",
                        }}
                      />
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
