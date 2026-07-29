import { FileText, Calendar, CheckSquare, Sparkles, BookOpen, Layers, type LucideIcon } from "lucide-react";

export type DocCategory = "PRD" | "Meeting Notes" | "Briefing" | "Technical Spec" | "General";

export interface DocFileItem {
  id: string;
  board_id: string;
  title: string;
  category: DocCategory;
  content_markdown: string;
  summary_highlights?: string[];
  action_items?: string[];
  author_email: string;
  file_url?: string | null;
  file_name?: string | null;
  file_size?: number | null;
  created_at: string;
  updated_at: string;
}

export interface AIDocResponse {
  action: "generate_doc" | "summarize_doc" | "improve_doc";
  data: {
    title: string;
    category: DocCategory;
    content_markdown: string;
    summary_highlights?: string[];
    action_items?: string[];
  };
}

export function getDocCategoryBadge(category: DocCategory): {
  label: string;
  icon: LucideIcon;
  bg: string;
  color: string;
  border: string;
} {
  switch (category) {
    case "PRD":
      return { label: "PRD", icon: BookOpen, bg: "rgba(109, 40, 217, 0.12)", color: "#6d28d9", border: "rgba(109, 40, 217, 0.25)" };
    case "Meeting Notes":
      return { label: "Catatan Rapat", icon: Calendar, bg: "rgba(37, 99, 235, 0.12)", color: "#2563eb", border: "rgba(37, 99, 235, 0.25)" };
    case "Briefing":
      return { label: "Briefing Tim", icon: Sparkles, bg: "rgba(217, 119, 6, 0.12)", color: "#d97706", border: "rgba(217, 119, 6, 0.25)" };
    case "Technical Spec":
      return { label: "Spesifikasi Teknis", icon: Layers, bg: "rgba(16, 185, 129, 0.12)", color: "#059669", border: "rgba(16, 185, 129, 0.25)" };
    case "General":
    default:
      return { label: "Umum", icon: FileText, bg: "rgba(100, 116, 139, 0.12)", color: "#475569", border: "rgba(100, 116, 139, 0.25)" };
  }
}

export const INITIAL_SAMPLE_DOCS: DocFileItem[] = [
  {
    id: "doc-1",
    board_id: "general",
    title: "Product Requirement Document (PRD) - Kanvexa SaaS",
    category: "PRD",
    author_email: "andi@kanvexa.com",
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date().toISOString(),
    summary_highlights: [
      "Peluncuran modul Message Board & AI Assistant",
      "Dukungan upload file hingga 50 MB",
      "Integrasi Kalender 7-Hari dan AI Reschedule",
    ],
    action_items: [
      "Review UI split-screen bersama tim desainer",
      "Uji alur upload file PDF 50 MB di Vercel",
    ],
    content_markdown: `# Product Requirement Document (PRD)

## 📌 Ringkasan Proyek
**Kanvexa** adalah platform manajemen proyek pintar yang menggabungkan *Kanban Board*, *Message Board*, *Kalender Interaktif*, dan *Docs & Files* dengan kecerdasan buatan.

---

## 🎯 Fitur Utama
1. **Kanban Board:** Manajemen tugas dengan drag-and-drop real-time.
2. **Message Board:** Wadah diskusi tim + AI Rangkuman & Ekstraksi Tugas.
3. **Calendar View:** Grid 7-Hari dengan AI Reschedule otomatis.
4. **Docs & Files:** Hub dokumentasi tim dengan Kanvexa AI Document Assistant.

---

## 🚀 Kriteria Keberhasilan
- Semua file PDF/dokumen hingga **50 MB** terunggah dengan lancar.
- AI menghasilkan rangkuman dan PRD dalam format **JSON murni**.
- Pengguna dapat berkolaborasi melalui tautan langsung.`,
  },
  {
    id: "doc-2",
    board_id: "general",
    title: "Catatan Rapat Peluncuran Fitur Baru",
    category: "Meeting Notes",
    author_email: "bintangwcproger@gmail.com",
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    updated_at: new Date().toISOString(),
    summary_highlights: [
      "Tim menyepakati desain gradient ungu cerah khas Kanvexa",
      "Sinkronisasi real-time Supabase berjalan lancar",
    ],
    action_items: [
      "Persiapkan deployment ke Vercel",
      "Set environment variable OPENROUTER_API_KEY",
    ],
    content_markdown: `# Catatan Rapat Peluncuran Fitur Baru

**Tanggal:** ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}  
**Peserta:** Tim Developer & Desainer Kanvexa

---

## 📝 Poin Pembahasan
- Pembahasan layout **Split-Screen** untuk Message Board dan Docs & Files.
- Penyempurnaan warna latar kartu menjadi **Gradient Ungu Cerah**.
- Penambahan tombol **\`✦ Urai dengan AI\`** pada header.

---

## ✅ Tindakan Lanjutan
- [x] Implementasi 50 MB Upload Route Handler
- [x] Penambahan fitur Share & Kolaborasi
- [ ] Pengujian akhir sebelum push ke GitHub main branch`,
  },
];
