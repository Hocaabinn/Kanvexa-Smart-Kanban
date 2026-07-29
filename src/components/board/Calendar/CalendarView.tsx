"use client";

import { useState } from "react";
import { Calendar, Filter, Sparkles, LayoutGrid, Layers, ListFilter, RotateCcw } from "lucide-react";
import { parseCardDueDate, CalendarTask, reconstructCardTitleWithDueDate } from "./calendar-utils";
import MiniCalendar from "./MiniCalendar";
import CalendarGrid from "./CalendarGrid";
import AIScheduleAssistantPanel from "./AIScheduleAssistantPanel";
import { updateCardTitle } from "@/app/board/[id]/actions";

interface Props {
  boardId: string;
  cards: { id: string; column_id: string; title: string; position: number }[];
  columns: { id: string; name: string; position: number }[];
  canEdit: boolean;
}

export default function CalendarView({ boardId, cards, columns, canEdit }: Props) {
  const [viewMode, setViewMode] = useState<"month" | "week" | "timeline">("month");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Status Filter state
  const [selectedStatusFilters, setSelectedStatusFilters] = useState<string[]>([]);

  // Map columns for easy lookup
  const columnMap = new Map(columns.map((c) => [c.id, c.name]));

  // Parse cards into CalendarTask items
  const allTasks: CalendarTask[] = cards.map((c) => {
    const colName = columnMap.get(c.column_id) || "To Do";
    const parsed = parseCardDueDate(c.title, colName);
    return {
      ...parsed,
      id: c.id,
      column_id: c.column_id,
    };
  });

  // Filter tasks by selected status filters
  const filteredTasks = allTasks.filter((task) => {
    if (selectedStatusFilters.length === 0) return true;
    return selectedStatusFilters.some((filter) => {
      if (filter === "overdue") return task.isOverdue;
      if (filter === "done") return task.isDone;
      return task.column_name.toLowerCase().includes(filter.toLowerCase());
    });
  });

  const selectedTask = allTasks.find((t) => t.id === selectedTaskId) || null;

  // Handle Drag & Drop Due Date Update
  const handleDropTaskToDate = async (taskId: string, targetDateIso: string) => {
    const task = allTasks.find((t) => t.id === taskId);
    if (!task) return;

    const newTitle = reconstructCardTitleWithDueDate(task.title, targetDateIso);
    try {
      await updateCardTitle(boardId, taskId, newTitle);
    } catch (err) {
      console.error("Gagal memperbarui due date:", err);
    }
  };

  // Handle AI Reschedule
  const handleRescheduleTasks = async (rescheduledList: { taskId: string; oldDate: string; newDate: string }[]) => {
    for (const item of rescheduledList) {
      const task = allTasks.find((t) => t.id === item.taskId);
      if (task) {
        const newTitle = reconstructCardTitleWithDueDate(task.title, item.newDate);
        await updateCardTitle(boardId, item.taskId, newTitle);
      }
    }
  };

  const toggleFilter = (filterKey: string) => {
    setSelectedStatusFilters((prev) =>
      prev.includes(filterKey) ? prev.filter((f) => f !== filterKey) : [...prev, filterKey]
    );
  };

  return (
    <div style={{ padding: "20px 24px 40px", maxWidth: 1320, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
      {/* Header Bar Actions & View Switcher */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(109, 40, 217, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#6d28d9" }}>
              <Calendar width={20} height={20} />
            </div>
            <span>Calendar View & Schedule AI</span>
          </h2>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
            Tampilan kalender terintegrasi dengan Kanban Board, Drag & Drop Due Date, dan AI Reschedule.
          </p>
        </div>

        {/* Mode Switcher Buttons */}
        <div style={{ display: "flex", gap: 4, background: "rgba(241, 245, 249, 0.9)", padding: 4, borderRadius: 10, border: "1px solid var(--border)" }}>
          <button
            onClick={() => setViewMode("month")}
            style={{
              padding: "6px 14px",
              borderRadius: 7,
              fontSize: 12,
              fontWeight: 700,
              border: "none",
              background: viewMode === "month" ? "#ffffff" : "transparent",
              color: viewMode === "month" ? "var(--v)" : "#64748b",
              boxShadow: viewMode === "month" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
              cursor: "pointer",
            }}
          >
            Bulan
          </button>
          <button
            onClick={() => setViewMode("week")}
            style={{
              padding: "6px 14px",
              borderRadius: 7,
              fontSize: 12,
              fontWeight: 700,
              border: "none",
              background: viewMode === "week" ? "#ffffff" : "transparent",
              color: viewMode === "week" ? "var(--v)" : "#64748b",
              boxShadow: viewMode === "week" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
              cursor: "pointer",
            }}
          >
            Minggu
          </button>
          <button
            onClick={() => setViewMode("timeline")}
            style={{
              padding: "6px 14px",
              borderRadius: 7,
              fontSize: 12,
              fontWeight: 700,
              border: "none",
              background: viewMode === "timeline" ? "#ffffff" : "transparent",
              color: viewMode === "timeline" ? "var(--v)" : "#64748b",
              boxShadow: viewMode === "timeline" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
              cursor: "pointer",
            }}
          >
            Timeline / Gantt
          </button>
        </div>
      </div>

      {/* 3 Layout Columns Structure (Sidebar Kiri: 240px, Grid Utama: Flex 1, Sidebar Kanan: 320px) */}
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        
        {/* SISI KIRI: Sidebar Mini & Filter Status */}
        <div style={{ width: 240, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          <MiniCalendar currentDate={currentDate} onSelectDate={(d) => setCurrentDate(d)} />

          {/* Filter Card */}
          <div style={{ background: "linear-gradient(135deg, #ffffff 0%, #faf5ff 50%, #f3e8ff 100%)", borderRadius: 16, padding: "16px 18px", border: "1.5px solid #d8b4fe", boxShadow: "0 4px 14px rgba(147, 51, 234, 0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: 6 }}>
                <Filter width={14} height={14} style={{ color: "#6d28d9" }} />
                <span>Filter Status</span>
              </div>
              {selectedStatusFilters.length > 0 && (
                <button onClick={() => setSelectedStatusFilters([])} style={{ fontSize: 10, fontWeight: 700, color: "#6d28d9", background: "none", border: "none", cursor: "pointer" }}>
                  Reset
                </button>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { key: "todo", label: "To Do / Backlog", color: "#7c3aed" },
                { key: "progress", label: "In Progress", color: "#d97706" },
                { key: "review", label: "In Review", color: "#2563eb" },
                { key: "done", label: "Done / Selesai", color: "#10b981" },
                { key: "overdue", label: "Terlambat (Overdue)", color: "#ef4444" },
              ].map((f) => {
                const isChecked = selectedStatusFilters.includes(f.key);
                return (
                  <label key={f.key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, color: "#475569", cursor: "pointer" }}>
                    <input type="checkbox" checked={isChecked} onChange={() => toggleFilter(f.key)} style={{ cursor: "pointer" }} />
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: f.color }} />
                    <span>{f.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* AREA TENGAH: Tampilan Kalender Utama (Grid 7 Hari) */}
        <div style={{ flex: 1, minWidth: 340 }}>
          <CalendarGrid
            viewMode={viewMode}
            currentDate={currentDate}
            tasks={filteredTasks}
            selectedTaskId={selectedTaskId}
            onSelectTask={(task) => setSelectedTaskId(task.id)}
            onDropTaskToDate={handleDropTaskToDate}
            onNavigateDate={(d) => setCurrentDate(d)}
          />
        </div>

        {/* SISI KANAN: Panel Detail Task & AI Schedule Assistant */}
        <div style={{ width: 320, flexShrink: 0 }}>
          <AIScheduleAssistantPanel
            selectedTask={selectedTask}
            allTasks={allTasks}
            onRescheduleTasks={handleRescheduleTasks}
          />
        </div>

      </div>
    </div>
  );
}
