"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDateIso } from "./calendar-utils";

interface Props {
  currentDate: Date;
  onSelectDate: (date: Date) => void;
}

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function MiniCalendar({ currentDate, onSelectDate }: Props) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() - 1);
    onSelectDate(d);
  };

  const nextMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + 1);
    onSelectDate(d);
  };

  // Generate days for mini grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayIso = formatDateIso(new Date());
  const selectedIso = formatDateIso(currentDate);

  const gridCells: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    gridCells.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    gridCells.push(new Date(year, month, i));
  }

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #faf5ff 50%, #f3e8ff 100%)",
        borderRadius: 16,
        padding: "16px 18px",
        border: "1.5px solid #d8b4fe",
        boxShadow: "0 4px 14px rgba(147, 51, 234, 0.08)",
      }}
    >
      {/* Mini Calendar Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>
          {MONTH_NAMES[month]} {year}
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          <button
            onClick={prevMonth}
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 6,
              padding: 4,
              cursor: "pointer",
              color: "#64748b",
              display: "flex",
              alignItems: "center",
            }}
          >
            <ChevronLeft width={14} height={14} />
          </button>
          <button
            onClick={nextMonth}
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 6,
              padding: 4,
              cursor: "pointer",
              color: "#64748b",
              display: "flex",
              alignItems: "center",
            }}
          >
            <ChevronRight width={14} height={14} />
          </button>
        </div>
      </div>

      {/* Day Labels */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, textAlign: "center", marginBottom: 6 }}>
        {DAY_NAMES.map((d, i) => (
          <span key={i} style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8" }}>
            {d}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, textAlign: "center" }}>
        {gridCells.map((cell, idx) => {
          if (!cell) {
            return <div key={`empty-${idx}`} style={{ height: 26 }} />;
          }

          const cellIso = formatDateIso(cell);
          const isToday = cellIso === todayIso;
          const isSelected = cellIso === selectedIso;

          return (
            <button
              key={cellIso}
              onClick={() => onSelectDate(cell)}
              style={{
                height: 26,
                border: "none",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: isSelected || isToday ? 800 : 500,
                background: isSelected ? "var(--v)" : isToday ? "rgba(109, 40, 217, 0.12)" : "transparent",
                color: isSelected ? "#ffffff" : isToday ? "#6d28d9" : "#334155",
                cursor: "pointer",
                transition: "all 0.12s ease",
              }}
            >
              {cell.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
