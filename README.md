# Kanvexa

Satu kalimat, langsung jadi rencana kerja. Kanban board kolaboratif dengan AI
breakdown tugas otomatis.

Project ini sudah di-scaffold sampai tahap **setup project & auth** dari
roadmap (lihat diagram yang dikirim di chat). Auth, schema database, dan
struktur dasar board sudah jalan. Drag-drop, real-time sync, dan integrasi
AI menyusul di tahap berikutnya.

## 1. Buat project Supabase

1. Buka [supabase.com](https://supabase.com) -> New project.
2. Setelah project jadi, buka **SQL Editor** -> tempel isi file
   `supabase/schema.sql` -> Run. Ini bikin semua tabel, RLS policy, dan
   trigger auto-admin.
3. Di **Settings -> API**, copy `Project URL` dan `anon public` key.
4. Di **Authentication -> Providers**, pastikan Email provider aktif. Kalau
   mau skip konfirmasi email saat development, matikan "Confirm email" di
   **Authentication -> Settings**.

## 2. Setup environment variables

```bash
cp .env.local.example .env.local
```

Isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` dengan
nilai dari Supabase. `ANTHROPIC_API_KEY` belum dipakai di tahap ini — bisa
diisi nanti pas masuk tahap integrasi AI.

## 3. Install & jalankan

```bash
npm install
npm run dev
```

Buka `http://localhost:3000` — otomatis redirect ke `/login`.

## Struktur yang sudah ada

```
src/
  lib/supabase/
    client.ts      # Supabase client untuk browser (Client Component)
    server.ts      # Supabase client untuk Server Component / Server Action
    middleware.ts  # Refresh session + lindungi /dashboard dan /board
  app/
    login/page.tsx
    signup/page.tsx
    auth/callback/route.ts   # Handle link konfirmasi email
    dashboard/
      page.tsx     # List board + form buat board baru
      actions.ts   # Server actions: createBoard, signOut
    board/[id]/page.tsx       # Placeholder board detail (kolom only, belum ada kartu)
supabase/
  schema.sql       # Tabel: boards, board_members, board_columns, cards + RLS
```

## Soal role (admin / member / viewer)

Role disimpan per board di tabel `board_members`, bukan global di level
user — jadi satu orang bisa admin di board A tapi cuma member di board B.

- **admin** — satu-satunya yang bisa update/delete board dan
  invite/remove member. Otomatis ke-assign ke pembuat board lewat trigger
  `on_board_created`.
- **member** — bisa CRUD kolom & kartu.
- **viewer** — cuma bisa baca (RLS sudah membatasi insert/update kolom &
  kartu lewat helper `is_board_editor`).

Fitur invite member belum dibuat di tahap ini — sementara kalau mau test
multi-role, insert manual ke tabel `board_members` lewat Supabase Table
Editor.

## Lanjutan (tahap berikutnya di roadmap)

- CRUD kartu di dalam kolom (drag-drop pakai `dnd-kit`)
- Realtime sync pakai Supabase Realtime channel per board
- Integrasi Claude API buat AI breakdown dari satu kalimat tujuan
- UI invite member + switch role

## Sistem Galeri Template (School & Life)

Aplikasi memiliki **Sistem Galeri Template** yang membantu pengguna menginisialisasi ruang kerja (board, kolom, dan kartu) dengan cepat. Galeri Template dibagi menjadi dua kategori utama:
1. **School (Akademik & Organisasi)**: Disesuaikan untuk kebutuhan akademik, seperti *Student Planner*, *Kelompok Belajar*, *Pemburu Beasiswa*, dan *Persiapan Ujian Akhir*.
2. **Life (Produktivitas & Gaya Hidup)**: Disesuaikan untuk kebutuhan personal dan produktivitas harian, seperti *Daily Journal & Habit Tracker*, *Monthly Finance Tracker*, *Travel Planner*, dan *Pelacak Buku & Film*.

### Menambahkan Template Baru

Untuk menambahkan template baru ke dalam aplikasi, ikuti dua langkah berikut:

1. **Definisikan Metadata Template**:
   Buka file [templates-config.ts](file:///Users/user/Documents/Docs%20Bintang/Developer/Kanban/Kanvexa-Smart-Kanban-1/src/lib/templates-config.ts) dan tambahkan metadata template Anda di bawah kategori yang sesuai:
   ```typescript
   {
     title: "Nama Template",
     desc: "Deskripsi singkat kegunaan template.",
     tags: ["Tag1", "Tag2"],
     prompt: "Nama Template", // Harus unik, digunakan sebagai pencocokan saat seeding
     tagColor: "#hexColor",
     tagBg: "#hexColor"
   }
   ```

2. **Tambahkan Logic Seeding Kolom & Kartu**:
   Buka file [actions.ts](file:///Users/user/Documents/Docs%20Bintang/Developer/Kanban/Kanvexa-Smart-Kanban-1/src/app/dashboard/actions.ts) dan tambahkan kondisi baru di dalam fungsi `createBoard` untuk mendefinisikan kolom dan kartu default yang akan di-seed secara otomatis:
   ```typescript
   } else if (name === "Nama Template") {
     columnsToInsert = [
       { name: "Kolom 1", position: 0, cards: ["Tugas A", "Tugas B"] },
       { name: "Kolom 2", position: 1, cards: ["Tugas C"] },
     ];
   ```
