"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle2, AlertTriangle, GripVertical } from "lucide-react";
import { CalendarTask, formatDateIso, getDaysInMonthGrid, getDaysInWeekGrid } from "./calendar-utils";

interface Props {
  viewMode: "month" | "week" | "timeline";
  currentDate: Date;
  tasks: CalendarTask[];
  selectedTaskId: string | null;
  onSelectTask: (task: CalendarTask) => void;
  onDropTaskToDate: (taskId: string, targetDateIso: string) => void;
  onNavigateDate: (newDate: Date) => void;
}

const DAY_NAMES_FULL = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export default function CalendarGrid({
  viewMode,
  currentDate,
  tasks,
  selectedTaskId,
  onSelectTask,
  onDropTaskToDate,
  onNavigateDate,
}: Props) {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === "month") d.setMonth(d.getMonth() - 1);
    else if (viewMode === "week") d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 14);
    onNavigateDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === "month") d.setMonth(d.getMonth() + 1);
    else if (viewMode === "week") d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 14);
    onNavigateDate(d);
  };

  const handleToday = () => {
    onNavigateDate(new Date());
  };

  // Group tasks by dueDate ISO string ("YYYY-MM-DD")
  const tasksByDate: Record<string, CalendarTask[]> = {};
  tasks.forEach((t) => {
    if (t.dueDate) {
      if (!tasksByDate[t.dueDate]) tasksByDate[t.dueDate] = [];
      tasksByDate[t.dueDate].push(t);
    }
  });

  const todayIso = formatDateIso(new Date());

  // HTML5 Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dateIso: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain") || draggedTaskId;
    if (taskId) {
      onDropTaskToDate(taskId, dateIso);
      setDraggedTaskId(null);
    }
  };

  // Render Month View
  if (viewMode === "month") {
    const monthDays = getDaysInMonthGrid(year, month);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Navigation Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(135deg, #ffffff 0%, #faf5ff 50%, #f3e8ff 100%)", padding: "12px 18px", borderRadius: 16, border: "1.5px solid #d8b4fe", boxShadow: "0 4px 14px rgba(147, 51, 234, 0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0 }}>
              {MONTH_NAMES[month]} {year}
            </h3>
            <button onClick={handleToday} style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: "rgba(109,40,217,0.12)", color: "#6d28d9", border: "1px solid rgba(109,40,217,0.2)", cursor: "pointer" }}>
              Hari Ini
            </button>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={handlePrev} style={{ background: "#ffffff", border: "1px solid #d8b4fe", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#6d28d9", display: "flex", alignItems: "center" }}>
              <ChevronLeft width={16} height={16} />
            </button>
            <button onClick={handleNext} style={{ background: "#ffffff", border: "1px solid #d8b4fe", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#6d28d9", display: "flex", alignItems: "center" }}>
              <ChevronRight width={16} height={16} />
            </button>
          </div>
        </div>

        {/* 7-Day Header */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, textAlign: "center" }}>
          {DAY_NAMES_FULL.map((day, i) => (
            <div key={i} style={{ padding: "8px 0", fontSize: 12, fontWeight: 800, color: "#6d28d9", background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)", borderRadius: 10, border: "1px solid #ddd6fe" }}>
              {day}
            </div>
          ))}
        </div>

        {/* Month 35/42 Cell Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
          {monthDays.map((cellDate) => {
            const cellIso = formatDateIso(cellDate);
            const isCurrentMonth = cellDate.getMonth() === month;
            const isToday = cellIso === todayIso;
            const dayTasks = tasksByDate[cellIso] || [];

            return (
              <div
                key={cellIso}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, cellIso)}
                style={{
                  minHeight: 110,
                  background: isToday
                    ? "linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)"
                    : isCurrentMonth
                    ? "linear-gradient(135deg, #ffffff 0%, #faf5ff 50%, #f3e8ff 100%)"
                    : "#f8fafc",
                  borderRadius: 14,
                  padding: 8,
                  border: isToday ? "2px solid #a855f7" : "1.5px solid #e9d5ff",
                  boxShadow: isToday ? "0 4px 14px rgba(168, 85, 247, 0.15)" : "0 2px 6px rgba(0,0,0,0.02)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  opacity: isCurrentMonth ? 1 : 0.5,
                  transition: "all 0.15s ease",
                }}
              >
                {/* Date Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                  <span style={{ fontSize: 12, fontWeight: isToday ? 800 : 700, color: isToday ? "#6d28d9" : "#334155" }}>
                    {cellDate.getDate()}
                  </span>
                  {dayTasks.length > 0 && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 5px", borderRadius: 8, background: "#f1f5f9", color: "#64748b" }}>
                      {dayTasks.length}
                    </span>
                  )}
                </div>

                {/* Task Pills */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4, overflowY: "auto", maxHeight: 80 }}>
                  {dayTasks.map((t) => {
                    const isSelected = selectedTaskId === t.id;
                    return (
                      <div
                        key={t.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, t.id)}
                        onClick={() => onSelectTask(t)}
                        style={{
                          padding: "4px 8px",
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 700,
                          background: isSelected ? t.statusColor : `${t.statusColor}18`,
                          color: isSelected ? "#ffffff" : t.statusColor,
                          border: `1px solid ${t.statusColor}44`,
                          cursor: "grab",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 4,
                          boxShadow: isSelected ? "0 2px 6px rgba(0,0,0,0.15)" : "none",
                          transition: "all 0.12s ease",
                        }}
                      >
                        <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                          {t.clean_title}
                        </span>
                        {t.isOverdue && !isSelected && <AlertTriangle width={11} height={11} style={{ flexShrink: 0, color: "#ef4444" }} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Render Week View
  if (viewMode === "week") {
    const weekDays = getDaysInWeekGrid(currentDate);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Navigation Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#ffffff", padding: "10px 16px", borderRadius: 14, border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Minggu ini ({formatDateIso(weekDays[0])} - {formatDateIso(weekDays[6])})
            </h3>
            <button onClick={handleToday} style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: "rgba(109,40,217,0.1)", color: "#6d28d9", border: "none", cursor: "pointer" }}>
              Hari Ini
            </button>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={handlePrev} style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#475569", display: "flex", alignItems: "center" }}>
              <ChevronLeft width={16} height={16} />
            </button>
            <button onClick={handleNext} style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#475569", display: "flex", alignItems: "center" }}>
              <ChevronRight width={16} height={16} />
            </button>
          </div>
        </div>

        {/* 7 Column Week View */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
          {weekDays.map((wDate) => {
            const wIso = formatDateIso(wDate);
            const isToday = wIso === todayIso;
            const dayTasks = tasksByDate[wIso] || [];

            return (
              <div
                key={wIso}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, wIso)}
                style={{
                  minHeight: 320,
                  background: isToday ? "rgba(109, 40, 217, 0.03)" : "#ffffff",
                  borderRadius: 14,
                  padding: 12,
                  border: isToday ? "2px solid #6d28d9" : "1px solid var(--border)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ textAlign: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: 8, marginBottom: 4 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8" }}>{DAY_NAMES_FULL[wDate.getDay()]}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: isToday ? "#6d28d9" : "#0f172a" }}>{wDate.getDate()}</div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {dayTasks.map((t) => (
                    <div
                      key={t.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, t.id)}
                      onClick={() => onSelectTask(t)}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        background: `${t.statusColor}18`,
                        color: t.statusColor,
                        border: `1px solid ${t.statusColor}44`,
                        cursor: "grab",
                      }}
                    >
                      <div>{t.clean_title}</div>
                      <div style={{ fontSize: 10, opacity: 0.8, marginTop: 4 }}>{t.statusLabel}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Render Timeline / Gantt View
  return (
    <div style={{ background: "#ffffff", borderRadius: 16, padding: 20, border: "1px solid var(--border)" }}>
      <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 14 }}>
        Timeline / Gantt View
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {tasks.map((t) => (
          <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
            <div style={{ width: 180, fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{t.clean_title}</div>
            <div style={{ flex: 1, height: 24, background: `${t.statusColor}22`, borderRadius: 6, position: "relative", display: "flex", alignItems: "center", padding: "0 10px" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: t.statusColor }}>{t.dueDate || "No Due Date"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
