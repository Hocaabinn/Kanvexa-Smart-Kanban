<div align="center">

# ⚡ Kanvexa

**Satu kalimat, langsung jadi rencana kerja.**  
*Smart AI-Powered Collaborative Kanban Board for Modern Workflows & Productivity.*

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database_%26_Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](./LICENSE)

---

</div>

## 📌 Ringkasan Proyek

**Kanvexa** adalah platform Kanban Board modern dan kolaboratif yang menggabungkan manajemen tugas intuitif dengan kecerdasan buatan (AI). Dirancang untuk mempercepat alur kerja individu maupun tim, Kanvexa mampu mengubah satu kalimat tujuan menjadi rincian tugas terstruktur, menyediakan template produktivitas siap pakai (*School & Life*), serta mengamankan kolaborasi melalui kontrol akses berbasis peran (RBAC) dan Row-Level Security (RLS) di Supabase.

---

## ✨ Fitur Utama

- 🧠 **AI Smart Breakdown & Assistance**:
  - Konversi satu kalimat tujuan/objektif menjadi daftar kolom dan kartu tugas siap eksekusi.
  - Ringkasan diskusi dan pengubahan catatan menjadi tugas (*AI Discussion to Tasks*).
- 📋 **Interactive Drag-and-Drop Kanban**:
  - Pengelolaan visual kolom dan kartu yang mulus ditenagai oleh `@dnd-kit`.
  - Personalisasi board dengan cover banner, icon picker kustom, dan indikator prioritas.
- 📚 **Sistem Galeri Template (*School & Life*)**:
  - **School (Akademik)**: *Student Planner*, *Kelompok Belajar*, *Pemburu Beasiswa*, *Persiapan Ujian Akhir*.
  - **Life (Produktivitas & Gaya Hidup)**: *Daily Habit Tracker*, *Monthly Finance Tracker*, *Travel Planner*, *Pelacak Buku & Film*.
- 🔐 **Autentikasi & RBAC Multi-Tenant**:
  - Otentikasi aman melalui Supabase Auth & SSR middleware.
  - Granular Per-Board Role Access Control (*Admin*, *Member*, *Viewer*) yang dilindungi Supabase Row-Level Security (RLS).
- 📊 **Smart Dashboard & Accurate Analytics**:
  - Live KPI metrics (Active Projects, Tasks Completed, Pending Tasks, Team Workload).
  - Responsive Time Tracking widget with daily bar chart visualizations.
  - Interactive Upgrade to Pro showcase with animated Framer Motion AlertCard.
- ⏱️ **Unified Riwayat & Time Tracking Modal**:
  - Audit trail komprehensif merekam otomatis aktivitas pembuatan kartu, penghapusan tugas, penambahan kolom, hingga mutasi board.
  - Tampilan terpadu riwayat kerja dan pelacakan waktu per papan proyek tanpa navigasi dropdown berlapis.
  - Filter pencarian instan, filter rentang tanggal, ringkasan metrik statistik real-time, dan akses cepat ke papan.
- 🎨 **Modern Minimalist UI/UX**:
  - Animasi responsif berbasis Framer Motion, shader visual kontemporer, dan umpan balik interaktif (SweetAlert2 & Canvas Confetti).

---

## 🛠 Tech Stack

| Layer | Teknologi |
| :--- | :--- |
| **Framework** | [Next.js](https://nextjs.org/) (App Router & Server Actions) |
| **Frontend Core** | [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/) |
| **Styling & UI** | [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/), [Radix UI](https://www.radix-ui.com/) |
| **Motion & Interactivity** | [Framer Motion](https://www.framer.com/motion/), [@dnd-kit](https://dndkit.com/), [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti) |
| **Backend & Database** | [Supabase](https://supabase.com/) (PostgreSQL, Realtime, SSR Client) |
| **Security & Auth** | Supabase Auth, Row-Level Security (RLS) Policies |

---

## 🚀 Panduan Memulai Cepat

Ikuti langkah-langkah berikut untuk menjalankan Kanvexa di lingkungan lokal Anda.

### 1. Prasyarat

- [Node.js](https://nodejs.org/) (versi LTS direkomendasikan, `>= 18.x`)
- [npm](https://www.npmjs.com/) atau [pnpm](https://pnpm.io/)
- Akun aktif di [Supabase](https://supabase.com/)

### 2. Setup Database Supabase

1. Buka [Supabase Dashboard](https://supabase.com/dashboard) dan buat project baru.
2. Buka menu **SQL Editor**, salin dan jalankan seluruh isi file `supabase/schema.sql`.
   > Skrip ini akan membuat tabel (`boards`, `board_members`, `board_columns`, `cards`), trigger `on_board_created`, indeks, serta konfigurasi RLS Policies.
3. Di **Project Settings -> API**, catat:
   - `Project URL`
   - `anon / public` API Key.
4. Di **Authentication -> Providers**, pastikan provider **Email** aktif.  
   *(Tips Development: Matikan "Confirm email" di **Authentication -> Settings** untuk mempercepat proses uji coba).*

### 3. Konfigurasi Environment Variables

Duplikasi template berkas environment:

```bash
cp .env.local.example .env.local
```

Buka file `.env.local` dan sesuaikan nilainya:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# AI Integration (Opsional / Saat Menggunakan AI Breakdown)
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 4. Instalasi & Menjalankan Aplikasi

```bash
# Install dependencies
npm install

# Jalankan server development
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) pada browser Anda. Aplikasi akan otomatis mengarahkan ke halaman `/login` bila belum terautentikasi.

---

## 📂 Struktur Repositori

```
├── src/
│   ├── app/
│   │   ├── API/                       # Endpoint API (AI breakdown, summary, upload)
│   │   ├── auth/callback/route.ts     # Supabase Auth OAuth/Email verification callback
│   │   ├── board/[id]/                # Halaman board dinamis & server actions
│   │   ├── dashboard/                 # Dashboard utama, sidebar, & board management
│   │   ├── Galeri-Template/           # Halaman galeri eksplorasi template
│   │   ├── login/ & signup/           # Halaman autentikasi pengguna
│   │   ├── globals.css                # Konfigurasi Tailwind CSS v4 & theme
│   │   ├── layout.tsx                 # Root layout & context providers
│   │   └── page.tsx                   # Landing page
│   ├── components/
│   │   ├── board/                     # Komponen board (Banner, Icon Picker, Calendar View)
│   │   ├── BoardClient.tsx            # Drag & drop state orchestrator
│   │   ├── KanbanCard.tsx             # Kartu kanban interaktif
│   │   ├── KanbanColumn.tsx           # Kolom kanban dan sorting container
│   │   └── AISettingsModal.tsx        # Konfigurasi parameter AI
│   └── lib/
│       ├── supabase/                  # Inisialisasi client, server, & middleware Supabase
│       ├── templates-config.ts        # Definisi data & metadata galeri template
│       └── utils.ts                   # Utility helper functions
└── supabase/
    └── schema.sql                     # Skema SQL, RLS, & triggers
```

---

## 👥 Matriks Hak Akses (Role-Based Access Control)

Hak akses dikelola secara independen **per-board** pada tabel `board_members` (seorang pengguna bisa menjadi *Admin* di Board A dan hanya *Viewer* di Board B):

| Hak Akses / Aksi | Admin 👑 | Member 🛠 | Viewer 👁 |
| :--- | :---: | :---: | :---: |
| Membaca & Melihat Board | ✅ | ✅ | ✅ |
| Membuat & Mengubah Kolom | ✅ | ✅ | ❌ |
| Membuat, Mengedit, & Memindahkan Kartu | ✅ | ✅ | ❌ |
| Mengubah Pengaturan / Menghapus Board | ✅ | ❌ | ❌ |
| Mengundang & Mengelola Anggota Board | ✅ | ❌ | ❌ |

> **Catatan Keamanan**: Akses ini ditegakkan langsung pada level database menggunakan **Supabase Row-Level Security (RLS)** melalui fungsi helper `is_board_editor` dan `is_board_admin`.

---

## 🎨 Panduan Ekstensi Template (School & Life)

Kanvexa memiliki sistem seeding cerdas yang memungkinkan pembuatan board lengkap dengan kolom dan kartu contoh dalam satu klik.

### Menambahkan Template Baru

1. **Definisikan Metadata Template**:  
   Tambahkan entri metadata baru di [src/lib/templates-config.ts](file:///Users/user/Documents/Docs%20Bintang/Developer/Kanban/Kanvexa-Smart-Kanban-1/src/lib/templates-config.ts):

   ```typescript
   {
     title: "Nama Template Anda",
     desc: "Deskripsi fungsi dan kegunaan template.",
     tags: ["Kategori", "Fokus"],
     prompt: "Nama Template Anda", // Kunci identifikasi unik saat proses seeding
     tagColor: "#3B82F6",
     tagBg: "#EFF6FF"
   }
   ```

2. **Tambahkan Skema Seeding Kolom & Kartu**:  
   Daftarkan preset kolom dan kartu default di [src/app/dashboard/actions.ts](file:///Users/user/Documents/Docs%20Bintang/Developer/Kanban/Kanvexa-Smart-Kanban-1/src/app/dashboard/actions.ts) pada fungsi `createBoard`:

   ```typescript
   } else if (name === "Nama Template Anda") {
     columnsToInsert = [
       { name: "To Do", position: 0, cards: ["Tugas Persiapan", "Riset Awal"] },
       { name: "In Progress", position: 1, cards: ["Eksekusi Utama"] },
       { name: "Completed", position: 2, cards: ["Evaluasi"] },
     ];
   }
   ```

---

## 🗺 Roadmap Pengembangan

- [x] Inisialisasi arsitektur Next.js 16 + Supabase Auth & RLS.
- [x] Drag & Drop Kanban Board menggunakan `@dnd-kit`.
- [x] Sistem Galeri Template Terintegrasi (*School & Life*).
- [x] Endpoint API AI Breakdown & Assistant.
- [ ] Real-time multi-user synchronization melalui Supabase Realtime Channels.
- [ ] Antarmuka visual manajemen undangan member & pergantian role.
- [ ] Ekspor board ke format PDF, Markdown, dan CSV.

---

## 🤝 Kontribusi

Kontribusi selalu terbuka dan disambut hangat!
1. Fork repository ini.
2. Buat branch fitur baru (`git checkout -b feature/FiturKeren`).
3. Commit perubahan Anda (`git commit -m 'feat: menambahkan fitur keren'`).
4. Push ke branch (`git push origin feature/FiturKeren`).
5. Buat Pull Request.

---

## 📄 Lisensi

Didistribusikan di bawah lisensi MIT. Lihat file `LICENSE` untuk informasi lebih lanjut.
<!-- docs(security): document RLS authorization model and invitation access controls -->
<!-- refactor(rate-limit): improve cleanup interval and memory safety in sliding window store -->
<!-- docs(api): document rate limiting policies on AI generation endpoints -->
<!-- style(message-board): standardize icon button focus and active states -->
<!-- docs(upload): add documentation for allowed file formats and size constraints -->
<!-- refactor(security): enforce explicit typing on storage RLS policies -->
<!-- docs(architecture): clarify proxy session verification in App Router lifecycle -->
<!-- perf(headers): optimize referrer policy for cross-origin compliance -->
<!-- style(ui): ensure consistent tooltip titles on attachment action triggers -->
<!-- docs(audit): summarize resolution of initial security audit findings -->
<!-- refactor(upload): add sanitized filename fallback for non-ascii attachment names -->
<!-- docs(kanban): outline board permission hierarchy across admin, member, and viewer roles -->
<!-- style(buttons): refine padding and tap targets for attachment controls -->
<!-- docs(ai): annotate token estimation and error handling guidelines for LLM handlers -->
<!-- refactor(types): strengthen invitation status and role union constraints -->
