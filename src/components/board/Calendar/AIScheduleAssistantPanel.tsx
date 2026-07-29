"use client";

import { useState } from "react";
import { Sparkles, Calendar, Clock, User, FileText, CheckCircle2, AlertTriangle, ArrowRight, RotateCw } from "lucide-react";
import { CalendarTask, aiRescheduleTasks } from "./calendar-utils";

interface Props {
  selectedTask: CalendarTask | null;
  allTasks: CalendarTask[];
  onRescheduleTasks: (rescheduledList: { taskId: string; oldDate: string; newDate: string }[]) => Promise<void>;
}

export default function AIScheduleAssistantPanel({ selectedTask, allTasks, onRescheduleTasks }: Props) {
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduleResultMsg, setRescheduleResultMsg] = useState<string | null>(null);

  // Check how many tasks are overloaded
  const dateCounts: Record<string, number> = {};
  allTasks.forEach((t) => {
    if (t.dueDate && !t.isDone) {
      dateCounts[t.dueDate] = (dateCounts[t.dueDate] || 0) + 1;
    }
  });

  const overloadedDates = Object.entries(dateCounts).filter(([_, count]) => count > 2);

  const handleAIReschedule = async () => {
    setRescheduling(true);
    setRescheduleResultMsg(null);

    try {
      const plan = aiRescheduleTasks(allTasks);
      if (plan.length === 0) {
        setRescheduleResultMsg("Semua tugas sudah terdistribusi secara seimbang! Tidak ada tanggal yang menumpuk.");
      } else {
        await onRescheduleTasks(plan);
        setRescheduleResultMsg(`Berhasil menyebarkan ${plan.length} tugas ke hari lain yang lebih kosong!`);
      }
    } catch (err: any) {
      setRescheduleResultMsg("Gagal melakukan penataan ulang jadwal.");
    } finally {
      setRescheduling(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
      {/* AI Schedule Assistant Widget */}
      <div
        style={{
          background: "linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%)",
          borderRadius: 16,
          padding: "18px 20px",
          color: "#ffffff",
          boxShadow: "0 10px 25px rgba(109, 40, 217, 0.22)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 90,
            height: 90,
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800 }}>
            <Sparkles width={16} height={16} style={{ color: "#fef08a" }} />
            <span>AI Schedule Assistant</span>
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 12, background: "rgba(255, 255, 255, 0.2)", color: "#fff" }}>
            Kanvexa AI
          </span>
        </div>

        <p style={{ fontSize: 12, lineHeight: 1.5, opacity: 0.9, margin: "0 0 12px 0" }}>
          {overloadedDates.length > 0
            ? `Terdeteksi ${overloadedDates.length} tanggal dengan tugas menumpuk (>2 tugas). Biarkan AI meratakannya.`
            : "Jadwal tugas Anda saat ini sudah rapi dan terdistribusi dengan baik."}
        </p>

        <button
          onClick={handleAIReschedule}
          disabled={rescheduling}
          style={{
            width: "100%",
            padding: "9px 14px",
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 700,
            background: "#ffffff",
            color: "#6d28d9",
            border: "none",
            cursor: rescheduling ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            transition: "transform 0.15s ease",
            opacity: rescheduling ? 0.7 : 1,
          }}
        >
          {rescheduling ? <RotateCw width={14} height={14} className="animate-spin" /> : <Sparkles width={14} height={14} />}
          <span>{rescheduling ? "Menyusun Ulang..." : "Rencanakan Ulang (Reschedule with AI)"}</span>
        </button>

        {rescheduleResultMsg && (
          <div style={{ marginTop: 10, padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.15)", fontSize: 11, fontWeight: 600 }}>
            {rescheduleResultMsg}
          </div>
        )}
      </div>

      {/* Task Details Card */}
      <div
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #faf5ff 50%, #f3e8ff 100%)",
          borderRadius: 16,
          padding: "18px 20px",
          border: "1.5px solid #d8b4fe",
          boxShadow: "0 4px 14px rgba(147, 51, 234, 0.08)",
        }}
      >
        <h4 style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", margin: "0 0 12px 0", display: "flex", alignItems: "center", gap: 6 }}>
          <FileText width={16} height={16} style={{ color: "#6d28d9" }} />
          <span>Detail Tugas Terpilih</span>
        </h4>

        {selectedTask ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  padding: "3px 8px",
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  background: `${selectedTask.statusColor}18`,
                  color: selectedTask.statusColor,
                  border: `1px solid ${selectedTask.statusColor}33`,
                }}
              >
                {selectedTask.statusLabel}
              </span>
              {selectedTask.isOverdue && (
                <span style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", display: "flex", alignItems: "center", gap: 3 }}>
                  <AlertTriangle width={12} height={12} />
                  Terlambat
                </span>
              )}
            </div>

            <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", lineHeight: 1.4 }}>
              {selectedTask.clean_title}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12, color: "#475569", background: "#f8fafc", padding: 12, borderRadius: 10, border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Calendar width={14} height={14} style={{ color: "#6d28d9" }} />
                <span>Tanggal Tenggat: <strong>{selectedTask.dueDate || "Belum diatur"}</strong></span>
              </div>

              {selectedTask.dueTime && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Clock width={14} height={14} style={{ color: "#d97706" }} />
                  <span>Jam: <strong>{selectedTask.dueTime}</strong></span>
                </div>
              )}

              {selectedTask.assignee && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <User width={14} height={14} style={{ color: "#059669" }} />
                  <span>Ditugaskan: <strong>{selectedTask.assignee}</strong></span>
                </div>
              )}

              {selectedTask.notes && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 4 }}>
                  <FileText width={14} height={14} style={{ color: "#64748b", marginTop: 2 }} />
                  <span>Catatan: {selectedTask.notes}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ padding: "20px 12px", textAlign: "center", background: "#f8fafc", borderRadius: 10, border: "1px dashed #e2e8f0" }}>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
              Klik salah satu pill tugas di kalender untuk melihat detail lengkap di sini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
