# PRD — Rencanai
*Satu kalimat, langsung jadi rencana kerja.*

**Versi:** 1.0  
**Status:** In Development  
**Terakhir diperbarui:** Juli 2025

---

## 1. Latar Belakang

Bagi tim kecil — mahasiswa, komunitas, atau UMKM — proses breakdown tugas sering menjadi bottleneck. Meeting pembagian kerja bisa memakan waktu lebih lama dari pekerjaan itu sendiri, dan tools seperti Jira atau Asana terasa terlalu berat untuk skala kecil.

Rencanai hadir sebagai solusi ringan yang menggabungkan tiga hal: kanban board sederhana, kolaborasi real-time, dan AI yang otomatis mengurai tujuan menjadi rencana kerja yang siap dieksekusi.

---

## 2. Target Pengguna

| Segmen | Deskripsi | Pain Point |
|--------|-----------|------------|
| **Mahasiswa / BEM** | Mengorganisir acara kampus, kepanitiaan | Tidak ada tools kolaborasi yang ringan dan gratis |
| **Tim freelance kecil** | 2–10 orang mengerjakan proyek bersama | Setup Jira/Asana terlalu ribet untuk proyek pendek |
| **UMKM & startup early-stage** | Tim produk atau operasional yang baru terbentuk | Butuh tools yang bisa langsung dipakai tanpa onboarding panjang |

---

## 3. Tujuan Produk

1. **Mengurangi waktu setup rencana kerja** dari rata-rata 60 menit (meeting manual) menjadi di bawah 5 menit.
2. **Meningkatkan visibilitas progres** antar anggota tim tanpa perlu update manual via chat/email.
3. **Menurunkan barrier masuk** tools manajemen proyek — siapa pun bisa pakai tanpa training.

---

## 4. Fitur & Scope

### 4.1 Fitur Utama (MVP — untuk seminar)

#### Auth & Akun
- Registrasi dan login via email + password
- Konfirmasi email (opsional, bisa dimatikan di dev)
- Sesi persisten via Supabase Auth

#### Board Management
- Buat board baru dengan nama bebas
- Hapus board (hanya admin)
- Dashboard berisi daftar semua board yang dimiliki/diikuti user

#### Kolom (Kanban Columns)
- Setiap board punya kolom yang bisa dikustomisasi
- Default 3 kolom saat board pertama kali dibuat: To Do, In Progress, Done
- Tambah kolom baru
- Hapus kolom (hanya admin)

#### Kartu (Cards)
- Tambah kartu baru di dalam kolom mana saja
- Edit judul kartu secara inline
- Hapus kartu
- Pindahkan kartu antar kolom via drag-and-drop
- Ubah urutan kartu dalam kolom yang sama via drag-and-drop

#### Kolaborasi Real-time
- Perubahan kartu (posisi, judul baru, kartu baru, hapus) langsung tampil di semua browser yang membuka board yang sama — tanpa refresh
- Indikator anggota aktif di topbar board

#### Role & Akses
- **Admin:** bisa semua (CRUD board, kolom, kartu, invite/remove member)
- **Member:** bisa CRUD kartu dan kolom
- **Viewer:** hanya bisa lihat board, tidak bisa edit apapun

### 4.2 Fitur Unggulan — AI Breakdown ✦
- Input: satu kalimat tujuan/proyek dalam bahasa Indonesia
- Output: kolom-kolom yang relevan + kartu tugas terisi otomatis
- Engine: Claude API (`claude-sonnet-4-6`) dengan structured JSON output
- User bisa request re-breakdown untuk menambah kartu tanpa menghapus yang sudah ada
- Bisa di-trigger berulang kali di board yang sama

### 4.3 Fitur Lanjutan (Post-MVP)
- Invite member via email
- Assign kartu ke anggota tim
- Due date & reminder di kartu
- Komentar di kartu
- Attach file ke kartu
- Label/tag warna di kartu
- Filter & search kartu
- Notifikasi in-app

---

## 5. User Flow Utama

### Flow 1: Onboarding Baru
```
Landing → Klik "Mulai gratis" → Isi form signup → 
Konfirmasi email → Login → Dashboard kosong → 
Buat board pertama → Board dengan 3 kolom default terbuka
```

### Flow 2: AI Breakdown (Fitur Utama)
```
Di halaman board → Klik "✦ Urai dengan AI" → 
Ketik satu kalimat tujuan → Klik "Urai jadi tugas" →
AI generate kolom + kartu → Kartu muncul di board →
User review, edit, atau hapus kartu yang tidak relevan
```

### Flow 3: Kerja Manual Harian
```
Buka board → Lihat kartu di kolom "To Do" →
Drag kartu ke "In Progress" saat mulai dikerjakan →
Drag ke "Done" saat selesai
```

### Flow 4: Kolaborasi Tim
```
Admin buka board → Invite anggota via email →
Anggota terima link → Login/signup → Langsung masuk board →
Semua perubahan sinkron real-time
```

---

## 6. Arsitektur Teknis

### Stack
| Layer | Teknologi | Alasan |
|-------|-----------|--------|
| Frontend | Next.js 15 (App Router) + TypeScript | SSR, routing, server actions |
| Styling | Tailwind CSS v4 + inline CSS vars | Cepat, customizable |
| Auth + DB | Supabase (PostgreSQL + Auth + Realtime) | All-in-one, gratis untuk skala MVP |
| Drag & Drop | `@dnd-kit/core` + `@dnd-kit/sortable` | Accessible, composable, smooth |
| AI | Anthropic Claude API (`claude-sonnet-4-6`) | Structured JSON output, bahasa Indonesia |
| Hosting | Vercel (frontend) + Supabase (backend) | Deploy cepat, gratis tier cukup untuk demo |

### Skema Database

```
auth.users (Supabase built-in)
  └── boards
        ├── board_members  (role: admin | member | viewer)
        ├── board_columns  (position: int)
        └── cards          (column_id, position: int, title, description, assigned_to)
```

### Row Level Security
- Semua tabel dilindungi RLS
- Helper functions: `is_board_member()`, `is_board_admin()`, `is_board_editor()`
- Viewer tidak bisa insert/update kartu atau kolom di level database

---

## 7. Desain & UI

### Identitas Visual
- **Nama:** Rencanai
- **Tagline:** *Satu kalimat, langsung jadi rencana kerja.*
- **Accent color:** Violet (#6D28D9 / #7C3AED)
- **Font:** Geist (sans-serif, modern, clean)
- **Tone:** Profesional tapi tidak kaku — cocok untuk mahasiswa dan profesional muda

### Halaman
| Halaman | Path | Auth |
|---------|------|------|
| Landing page | `/` | Public |
| Login | `/login` | Public |
| Signup | `/signup` | Public |
| Dashboard | `/dashboard` | Protected |
| Board detail | `/board/[id]` | Protected |

---

## 8. Metrik Keberhasilan (untuk demo seminar)

| Metrik | Target |
|--------|--------|
| Waktu dari signup ke board pertama | < 1 menit |
| Waktu dari input kalimat ke board ter-generate AI | < 5 detik |
| Lag sinkronisasi real-time antar device | < 500ms |
| Tidak ada crash/error selama sesi demo (15 menit) | 100% uptime |

---

## 9. Risiko & Mitigasi

| Risiko | Probabilitas | Mitigasi |
|--------|-------------|----------|
| Wi-fi venue jelek saat demo | Tinggi | Siapkan rekaman demo backup + hotspot pribadi |
| Claude API lambat saat demo | Sedang | Cache contoh output, siapkan mock data |
| Supabase Realtime lag | Rendah | Test di jaringan yang sama sebelum demo |
| Bug drag-drop di browser tertentu | Sedang | Test di Chrome, Safari, Firefox sebelum hari H |

---

## 10. Roadmap Pengembangan

### Tahap 1 — Foundation ✅
- [x] Setup project Next.js + Supabase
- [x] Auth (login, signup, callback)
- [x] Schema database + RLS
- [x] UI landing page + dashboard + board placeholder

### Tahap 2 — Core Board (sedang berjalan)
- [x] Redesign UI frontend
- [ ] CRUD kartu (tambah, edit inline, hapus)
- [ ] Drag-and-drop antar kolom dan dalam kolom
- [ ] Real-time sync via Supabase Realtime

### Tahap 3 — AI Integration
- [ ] Input kalimat → Claude API → JSON kolom & kartu
- [ ] Re-breakdown (tambah kartu tanpa hapus existing)
- [ ] Loading state animasi saat AI bekerja

### Tahap 4 — Polish & Demo Prep
- [ ] Invite member via email
- [ ] Indikator user aktif di board
- [ ] Skenario demo yang sudah disiapkan (seed data)
- [ ] Error handling & empty states yang proper
