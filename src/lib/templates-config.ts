import { GraduationCap, Lightbulb, type LucideIcon } from "lucide-react";

export interface ColumnPreview {
  name: string;
  cards: string[];
}

export interface Template {
  title: string;
  desc: string;
  tags: string[];
  prompt: string;
  tagColor: string;
  tagBg: string;
  columnsPreview: ColumnPreview[];
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
        title: "Persiapan Seminar",
        desc: "Timeline seminar proposal/hasil, pemetaan bab, list revisi dosen penguji, dan pendaftaran sidang.",
        tags: ["Akademik", "Populer"],
        prompt: "Persiapan Seminar",
        tagColor: "#8b5cf6",
        tagBg: "#f5f3ff",
        columnsPreview: [
          { name: "Persiapan & Bab 1-3", cards: ["Penyusunan Judul & Abstrak", "Draft Proposal Sempro", "Persetujuan Dosen Pembimbing"] },
          { name: "Revisi Dosen Penguji", cards: ["Revisi Catatan Penguji 1", "Revisi Catatan Penguji 2"] },
          { name: "Pendaftaran & Berkas", cards: ["Form Pendaftaran Seminar", "Cetak Naskah & PPT Presentasi"] },
          { name: "Selesai Seminar", cards: ["Berita Acara Seminar"] }
        ]
      },
      {
        title: "Manajemen Rapat Organisasi / OSIS",
        desc: "Agenda rapat, catatan diskusi (MoM), pembagian tugas panitia, dan deadline.",
        tags: ["Organisasi"],
        prompt: "Manajemen Rapat Organisasi / OSIS",
        tagColor: "#2563eb",
        tagBg: "#eff6ff",
        columnsPreview: [
          { name: "Agenda Rapat", cards: ["Penyusunan Proposal Anggaran", "Rencana Tanggal Rapat Bulanan"] },
          { name: "Dalam Pembahasan", cards: ["Pembagian Divisi Acara & Humas", "Evaluasi Program Kerja"] },
          { name: "Tindak Lanjut", cards: ["Desain Spanduk & Publikasi"] },
          { name: "Selesai", cards: ["Booking Ruang Aula Sekolah"] }
        ]
      },
      {
        title: "Student Planner (Jadwal & Tugas)",
        desc: "Pengatur jadwal kuliah/kelas, pelacak tenggat waktu tugas, dan bahan pelajaran.",
        tags: ["Akademik", "Studi"],
        prompt: "Student Planner (Jadwal & Tugas)",
        tagColor: "#10b981",
        tagBg: "#ecfdf5",
        columnsPreview: [
          { name: "Daftar Tugas", cards: ["Tugas Matematika Diskrit", "Laporan Praktikum Fisika"] },
          { name: "Sedang Dikerjakan", cards: ["Makalah Bahasa Indonesia"] },
          { name: "Review & Revisi", cards: ["Checklist Referensi Jurnal"] },
          { name: "Selesai", cards: ["Kuis Mingguan Module 1"] }
        ]
      },
      {
        title: "Kelompok Belajar (Study Group)",
        desc: "Koordinasi tugas kelompok, pembagian tugas anggota, dan jadwal kerja bareng.",
        tags: ["Organisasi", "Kolaborasi"],
        prompt: "Kelompok Belajar (Study Group)",
        tagColor: "#f59e0b",
        tagBg: "#fffbeb",
        columnsPreview: [
          { name: "Topik Diskusi", cards: ["Pembagian Bab Presentasi", "Jadwal Zoom / Kerja Kelompok"] },
          { name: "Pengerjaan", cards: ["Draft Slide PPT", "Pengumpulan Bahan Materi"] },
          { name: "Selesai", cards: ["Submit Tugas ke LMS"] }
        ]
      },
      {
        title: "Pemburu Beasiswa (Scholarship Tracker)",
        desc: "Melacak pendaftaran beasiswa, persyaratan berkas, wawancara, dan pengumuman.",
        tags: ["Akademik", "Pribadi"],
        prompt: "Pemburu Beasiswa (Scholarship Tracker)",
        tagColor: "#3b82f6",
        tagBg: "#dbeafe",
        columnsPreview: [
          { name: "Incaran Beasiswa", cards: ["Beasiswa Unggulan Kemendikbud", "Beasiswa Djarum Plus"] },
          { name: "Persyaratan Berkas", cards: ["Surat Rekomendasi Dosen", "Translate Transkrip Nilai", "Sertifikat TOEFL/IELTS"] },
          { name: "Tahap Seleksi", cards: ["Submit Form Pendaftaran", "Persiapan Wawancara"] },
          { name: "Hasil / Lolos", cards: ["Pengumuman Resmi"] }
        ]
      },
      {
        title: "Persiapan Ujian Akhir (Exam Prep)",
        desc: "Fokus belajar menjelang UTS/UAS, review materi, dan latihan soal.",
        tags: ["Akademik", "Studi"],
        prompt: "Persiapan Ujian Akhir (Exam Prep)",
        tagColor: "#ec4899",
        tagBg: "#fce7f3",
        columnsPreview: [
          { name: "Mata Kuliah", cards: ["Algoritma & Pemrograman", "Kalkulus II", "Basis Data"] },
          { name: "Rangkuman Materi", cards: ["Bikin Mindmap Bab 1-5", "Kumpulan Rumus Penting"] },
          { name: "Latihan Soal", cards: ["Kerjakan Latihan UTS Tahun Lalu", "Tryout Mandiri"] },
          { name: "Siap Ujian", cards: ["Cetak Kartu Ujian"] }
        ]
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
        tagBg: "#fffbeb",
        columnsPreview: [
          { name: "Ide Mentah", cards: ["Konsep Fitur AI Summary", "Desain UI Dark Mode"] },
          { name: "Dukungan & Riset", cards: ["Analisis Kompetitor", "Survei Pengguna"] },
          { name: "Prioritas Utama", cards: ["Bikin MVP Halaman Dashboard"] }
        ]
      },
      {
        title: "Papan Peluncuran Proyek (Sprint 1 Minggu)",
        desc: "Kolom To-Do, In Progress, Review, dan Done untuk melacak progres tim secara cepat.",
        tags: ["Manajemen Proyek"],
        prompt: "Papan Peluncuran Proyek (Sprint 1 Minggu)",
        tagColor: "#db2777",
        tagBg: "#fdf2f8",
        columnsPreview: [
          { name: "Backlog", cards: ["Setup Server & DB", "Fitur Reset Password"] },
          { name: "Sprint To-Do", cards: ["Desain Header Component", "Integrasi Payment Gateway"] },
          { name: "In Progress", cards: ["Slicing Page Landing"] },
          { name: "Done", cards: ["Setup Next.js Project"] }
        ]
      },
      {
        title: "Daily Journal & Habit Tracker",
        desc: "Jurnal refleksi harian dan pelacak kebiasaan (habit tracker) pagi & malam.",
        tags: ["Personal", "Life"],
        prompt: "Daily Journal & Habit Tracker",
        tagColor: "#ec4899",
        tagBg: "#fce7f3",
        columnsPreview: [
          { name: "Habit Pagi 🌅", cards: ["Minum Air Putih 500ml", "Olahraga Ringan 15 Menit", "Membaca 10 Halaman Buku"] },
          { name: "Target Hari Ini 🎯", cards: ["Menyelesaikan 3 Task Utama", "Jalan Kaki 5.000 Langkah"] },
          { name: "Refleksi Malam 🌙", cards: ["Tulis 3 Hal Yang Disyukuri", "Evaluasi Progres Harian"] }
        ]
      },
      {
        title: "Monthly Finance Tracker",
        desc: "Pelacak anggaran bulanan, daftar tagihan, tabungan, dan pengeluaran harian.",
        tags: ["Personal", "Keuangan"],
        prompt: "Monthly Finance Tracker",
        tagColor: "#10b981",
        tagBg: "#ecfdf5",
        columnsPreview: [
          { name: "Pemasukan 💰", cards: ["Gaji Utama / Uang Saku", "Side Income / Freelance"] },
          { name: "Tagihan Rutin 📜", cards: ["Bayar Kos / Listrik", "Langganan Internet & Streaming"] },
          { name: "Rencana Tabungan 🏦", cards: ["Dana Darurat 10%", "Investasi Bulanan"] },
          { name: "Pengeluaran Harian 🛒", cards: ["Belanja Bulanan / Groceries", "Jajan & Hiburan"] }
        ]
      },
      {
        title: "Travel & Vacation Planner",
        desc: "Rencana perjalanan liburan, destinasi impian, reservasi tiket, dan packing checklist.",
        tags: ["Personal", "Travel"],
        prompt: "Travel & Vacation Planner",
        tagColor: "#3b82f6",
        tagBg: "#dbeafe",
        columnsPreview: [
          { name: "Rencana Destinasi ✈️", cards: ["Tiket Pesawat & Hotel", "List Tempat Wisata Hits"] },
          { name: "Checklist Packing 🧳", cards: ["Dokumen & Paspor/KTP", "Pakaian & Obat-obatan", "Charger & Powerbank"] },
          { name: "Itinerary Harian 🗓️", cards: ["Hari 1: City Tour & Kuliner", "Hari 2: Island Hopping"] }
        ]
      },
      {
        title: "Pelacak Buku & Film",
        desc: "Daftar bacaan buku, watchlist film/seri, ringkasan, dan review pribadi.",
        tags: ["Personal", "Hiburan"],
        prompt: "Pelacak Buku & Film",
        tagColor: "#8b5cf6",
        tagBg: "#f5f3ff",
        columnsPreview: [
          { name: "Wishlist / Antrean 📚", cards: ["Buku: Atomic Habits", "Film: Interstellar"] },
          { name: "Sedang Dibaca/Ditonton 📖", cards: ["Buku: Psychology of Money"] },
          { name: "Selesai & Review ⭐", cards: ["Buku: Deep Work (Rating 5/5)", "Film: Inception (Rating 5/5)"] }
        ]
      }
    ]
  }
];
