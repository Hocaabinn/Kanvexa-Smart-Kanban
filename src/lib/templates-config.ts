import { GraduationCap, Lightbulb, type LucideIcon } from "lucide-react";

export interface Template {
  title: string;
  desc: string;
  tags: string[];
  prompt: string;
  tagColor: string;
  tagBg: string;
}

export interface TemplateCategory {
  category: string;
  type: "school" | "life";
  icon: LucideIcon;
  color: string;
  bg: string;
  templates: Template[];
}

export const allCategories: TemplateCategory[] = [
  {
    category: "1. Akademik & Organisasi (School)",
    type: "school",
    icon: GraduationCap,
    color: "#8b5cf6",
    bg: "#f5f3ff",
    templates: [
      {
        title: "Persiapan Seminar & Skripsi",
        desc: "Timeline riset, pemetaan bab, list revisi dosen, dan checklist dokumen.",
        tags: ["Akademik", "Populer"],
        prompt: "Persiapan Seminar & Skripsi",
        tagColor: "#8b5cf6",
        tagBg: "#f5f3ff"
      },
      {
        title: "Manajemen Rapat Organisasi / OSIS",
        desc: "Agenda rapat, catatan diskusi (MoM), pembagian tugas panitia, dan deadline.",
        tags: ["Organisasi"],
        prompt: "Manajemen Rapat Organisasi / OSIS",
        tagColor: "#2563eb",
        tagBg: "#eff6ff"
      },
      {
        title: "Student Planner (Jadwal & Tugas)",
        desc: "Pengatur jadwal kuliah/kelas, pelacak tenggat waktu tugas, dan bahan pelajaran.",
        tags: ["Akademik", "Studi"],
        prompt: "Student Planner (Jadwal & Tugas)",
        tagColor: "#10b981",
        tagBg: "#ecfdf5"
      },
      {
        title: "Kelompok Belajar (Study Group)",
        desc: "Koordinasi tugas kelompok, pembagian tugas anggota, dan jadwal kerja bareng.",
        tags: ["Organisasi", "Kolaborasi"],
        prompt: "Kelompok Belajar (Study Group)",
        tagColor: "#f59e0b",
        tagBg: "#fffbeb"
      },
      {
        title: "Pemburu Beasiswa (Scholarship Tracker)",
        desc: "Melacak pendaftaran beasiswa, persyaratan berkas, wawancara, dan pengumuman.",
        tags: ["Akademik", "Pribadi"],
        prompt: "Pemburu Beasiswa (Scholarship Tracker)",
        tagColor: "#3b82f6",
        tagBg: "#dbeafe"
      },
      {
        title: "Persiapan Ujian Akhir (Exam Prep)",
        desc: "Fokus belajar menjelang UTS/UAS, review materi, dan latihan soal.",
        tags: ["Akademik", "Studi"],
        prompt: "Persiapan Ujian Akhir (Exam Prep)",
        tagColor: "#ec4899",
        tagBg: "#fce7f3"
      }
    ]
  },
  {
    category: "2. Produktivitas & Gaya Hidup (Life)",
    type: "life",
    icon: Lightbulb,
    color: "#d97706",
    bg: "#fffbeb",
    templates: [
      {
        title: "Mindmap Ide & Brainstorming",
        desc: "Kanvas bebas untuk mengelompokkan ide acak menjadi prioritas eksekusi.",
        tags: ["Kreatif"],
        prompt: "Mindmap Ide & Brainstorming",
        tagColor: "#d97706",
        tagBg: "#fffbeb"
      },
      {
        title: "Papan Peluncuran Proyek (Sprint 1 Minggu)",
        desc: "Kolom To-Do, In Progress, Review, dan Done untuk melacak progres tim secara cepat.",
        tags: ["Manajemen Proyek"],
        prompt: "Papan Peluncuran Proyek (Sprint 1 Minggu)",
        tagColor: "#db2777",
        tagBg: "#fdf2f8"
      },
      {
        title: "Daily Journal & Habit Tracker",
        desc: "Jurnal refleksi harian dan pelacak kebiasaan (habit tracker) pagi & malam.",
        tags: ["Personal", "Life"],
        prompt: "Daily Journal & Habit Tracker",
        tagColor: "#ec4899",
        tagBg: "#fce7f3"
      },
      {
        title: "Monthly Finance Tracker",
        desc: "Pelacak anggaran bulanan, daftar tagihan, tabungan, dan pengeluaran harian.",
        tags: ["Personal", "Keuangan"],
        prompt: "Monthly Finance Tracker",
        tagColor: "#10b981",
        tagBg: "#ecfdf5"
      },
      {
        title: "Travel & Vacation Planner",
        desc: "Rencana perjalanan liburan, destinasi impian, reservasi tiket, dan packing checklist.",
        tags: ["Personal", "Travel"],
        prompt: "Travel & Vacation Planner",
        tagColor: "#3b82f6",
        tagBg: "#dbeafe"
      },
      {
        title: "Pelacak Buku & Film",
        desc: "Daftar bacaan buku, watchlist film/seri, ringkasan, dan review pribadi.",
        tags: ["Personal", "Hiburan"],
        prompt: "Pelacak Buku & Film",
        tagColor: "#8b5cf6",
        tagBg: "#f5f3ff"
      }
    ]
  }
];
