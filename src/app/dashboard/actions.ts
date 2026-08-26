"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

export async function createBoard(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  if (!name) return;

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  const boardId = crypto.randomUUID();
  const { error } = await supabase
    .from("boards")
    .insert({ id: boardId, name, created_by: userData.user.id, owner_email: userData.user.email });

  if (error) {
    // In a real app, surface this to the UI instead of throwing.
    throw new Error(error.message);
  }

  // Seed columns and cards depending on selected templates
  let columnsToInsert: { name: string; position: number; cards?: string[] }[] = [];

  if (name === "Persiapan Seminar & Skripsi") {
    columnsToInsert = [
      { name: "Ide & Referensi", position: 0, cards: ["Mencari 5 jurnal pendukung", "Pilih topik utama skripsi"] },
      { name: "Checklist Dokumen", position: 1, cards: ["Draft Proposal Bab 1-3", "Form persetujuan dosen pembimbing"] },
      { name: "Revisi Dosen", position: 2, cards: ["Revisi abstrak Bahasa Inggris", "Perbaikan metodologi penelitian"] },
      { name: "Selesai", position: 3, cards: ["Mengisi form pendaftaran seminar proposal"] },
    ];
  } else if (name === "Manajemen Rapat Organisasi / OSIS") {
    columnsToInsert = [
      { name: "Agenda Rapat", position: 0, cards: ["Penyusunan Proposal Anggaran", "Rencana tanggal rapat bulanan"] },
      { name: "Dalam Pembahasan", position: 1, cards: ["Pembagian Divisi Acara & Humas", "Evaluasi proker bulan lalu"] },
      { name: "Tindak Lanjut (Action Items)", position: 2, cards: ["Desain Spanduk & Publikasi", "Hubungi narasumber luar"] },
      { name: "Selesai", position: 3, cards: ["Booking Ruang Aula Sekolah"] },
    ];
  } else if (name === "Student Planner (Jadwal & Tugas)") {
    columnsToInsert = [
      { name: "Jadwal & Kelas", position: 0, cards: ["Matematika Diskrit (Senin 08:00)", "Struktur Data (Rabu 10:00)", "Bahasa Inggris (Kamis 13:00)"] },
      { name: "Tugas & Proyek", position: 1, cards: ["Tugas 1 Alpro (Deadline Jumat)", "Paper Etika Profesi", "Persiapan Presentasi AI"] },
      { name: "Bahan Pelajaran", position: 2, cards: ["Slides Pertemuan 1-4", "Ebook Kalkulus Bab 3", "Link Github Asisten Praktikum"] },
      { name: "Selesai", position: 3, cards: ["Kuis 1 Struktur Data"] },
    ];
  } else if (name === "Kelompok Belajar (Study Group)") {
    columnsToInsert = [
      { name: "Topik Bahasan", position: 0, cards: ["Pembagian topik presentasi", "Menentukan studi kasus", "Finalisasi PowerPoint"] },
      { name: "Tugas Anggota", position: 1, cards: ["Budi: Cari referensi bab 1", "Siti: Analisis data survei", "Andi: Desain slide deck"] },
      { name: "Review Bersama", position: 2, cards: ["Review draft laporan", "Latihan presentasi kelompok"] },
      { name: "Siap Kumpul", position: 3, cards: ["Upload tugas ke Google Drive"] },
    ];
  } else if (name === "Pemburu Beasiswa (Scholarship Tracker)") {
    columnsToInsert = [
      { name: "Daftar Beasiswa", position: 0, cards: ["Beasiswa Bank Indonesia", "Djarum Beasiswa Plus", "Beasiswa KIP Kuliah"] },
      { name: "Persyaratan Berkas", position: 1, cards: ["Legalisir Transkrip Nilai", "Surat Rekomendasi Dosen", "Essay: Kontribusi bagi Bangsa"] },
      { name: "Tahap Wawancara", position: 2, cards: ["Latihan mock interview", "Cetak kartu peserta & berkas fisik"] },
      { name: "Status Akhir", position: 3, cards: ["Simpan email pengumuman"] },
    ];
  } else if (name === "Persiapan Ujian Akhir (Exam Prep)") {
    columnsToInsert = [
      { name: "Materi Ujian", position: 0, cards: ["Kisi-kisi Pemrograman Web", "Bab 1-5 Teori Graf", "Kumpulan rumus Fisika II"] },
      { name: "Sedang Di-review", position: 1, cards: ["Latihan soal UTS tahun lalu", "Membaca rangkuman Algoritma"] },
      { name: "Siap Ujian", position: 2, cards: ["Kalkulus II (Siap 90%)", "Jaringan Komputer (Siap 85%)"] },
      { name: "Selesai Ujian", position: 3, cards: ["Ujian Pemrograman Web"] },
    ];
  } else if (name === "Mindmap Ide & Brainstorming") {
    columnsToInsert = [
      { name: "Brain Dump / Ide Acak", position: 0, cards: ["Membuat sistem filter kategori", "Integrasi payment gateway"] },
      { name: "Penyaringan Ide", position: 1, cards: ["Ide A: Gunakan AI autocomplete", "Ide B: Fitur template seret & taruh"] },
      { name: "Analisis Kelayakan", position: 2, cards: ["Analisis biaya integrasi API", "Riset minat pengguna target"] },
      { name: "Siap Eksekusi", position: 3, cards: ["Desain wireframe Figma", "Buat repositori GitHub baru"] },
    ];
  } else if (name === "Papan Peluncuran Proyek (Sprint 1 Minggu)") {
    columnsToInsert = [
      { name: "Backlog", position: 0, cards: ["Setup environment development", "Rancang skema database PostgreSQL"] },
      { name: "Sedang Dikerjakan", position: 1, cards: ["Implementasi login & register", "Slicing mockup landing page"] },
      { name: "Uji Coba (Testing)", position: 2, cards: ["Unit testing auth controller", "Integrasi testing flow order"] },
      { name: "Selesai", position: 3, cards: ["Deployment ke hosting Vercel"] },
    ];
  } else if (name === "Daily Journal & Habit Tracker") {
    columnsToInsert = [
      { name: "Kebiasaan Pagi", position: 0, cards: ["Minum segelas air putih", "Olahraga ringan 15 menit", "Membaca buku 10 halaman"] },
      { name: "Kebiasaan Malam", position: 1, cards: ["Merapikan meja belajar", "Refleksi harian & jurnal", "Tidur sebelum jam 11 malam"] },
      { name: "Refleksi Harian", position: 2, cards: ["Apa pencapaian terbaik hari ini?", "Hal apa yang bisa diperbaiki besok?", "Tulis 3 hal yang patut disyukuri"] },
      { name: "Selesai Hari Ini", position: 3, cards: ["Menyiapkan pakaian & tas untuk besok"] },
    ];
  } else if (name === "Monthly Finance Tracker") {
    columnsToInsert = [
      { name: "Anggaran & Kebutuhan", position: 0, cards: ["Belanja bulanan sembako", "Uang kos/kontrakan", "Beli kuota internet"] },
      { name: "Tagihan Rutin", position: 1, cards: ["Tagihan listrik & air", "Langganan Spotify / Netflix", "Cicilan / iuran BPJS"] },
      { name: "Tabungan & Investasi", position: 2, cards: ["Transfer tabungan darurat", "Investasi reksa dana / saham"] },
      { name: "Pengeluaran Terlacak", position: 3, cards: ["Beli kopi & jajan sore", "Service kendaraan bulanan"] },
    ];
  } else {
    // Default fallback columns
    columnsToInsert = [
      { name: "To do", position: 0 },
      { name: "In progress", position: 1 },
      { name: "Done", position: 2 },
    ];
  }

  // Insert columns all at once
  const { data: insertedCols, error: colErr } = await supabase
    .from("board_columns")
    .insert(columnsToInsert.map(col => ({
      board_id: boardId,
      name: col.name,
      position: col.position
    })))
    .select("id, name");

  if (colErr) {
    throw new Error(colErr.message);
  }

  // Compile all cards to insert across all columns in a single array
  if (insertedCols && insertedCols.length > 0) {
    const cardsToInsert: { board_id: string; column_id: string; title: string; description: string; position: number }[] = [];
    
    for (const col of columnsToInsert) {
      if (col.cards && col.cards.length > 0) {
        // Match the columns by name to get their inserted IDs
        const dbCol = insertedCols.find(c => c.name === col.name);
        if (dbCol) {
          col.cards.forEach((title, index) => {
            cardsToInsert.push({
              board_id: boardId,
              column_id: dbCol.id,
              title: title,
              description: `Deskripsi otomatis untuk tugas: ${title}`,
              position: index
            });
          });
        }
      }
    }

    if (cardsToInsert.length > 0) {
      const { error: cardErr } = await supabase.from("cards").insert(cardsToInsert);
      if (cardErr) {
        throw new Error(cardErr.message);
      }
    }
  }

  revalidatePath("/dashboard");
  redirect(`/board/${boardId}`);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function deleteBoard(boardId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("boards").delete().eq("id", boardId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function renameBoard(boardId: string, newName: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("boards")
    .update({ name: newName.trim() })
    .eq("id", boardId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function acceptBoardInvitation(invitationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: inv, error: fetchErr } = await supabase
    .from("board_invitations")
    .select("*")
    .eq("id", invitationId)
    .single();

  if (fetchErr || !inv) {
    throw new Error("Undangan tidak ditemukan.");
  }

  if (inv.invited_email.toLowerCase() !== user.email?.toLowerCase()) {
    throw new Error("Anda tidak berhak menerima undangan ini.");
  }

  const { error: updateErr } = await supabase
    .from("board_invitations")
    .update({ status: "accepted" })
    .eq("id", invitationId);

  if (updateErr) throw new Error(updateErr.message);

  const { error: memberErr } = await supabase
    .from("board_members")
    .insert({
      board_id: inv.board_id,
      user_id: user.id,
      role: inv.role
    });

  if (memberErr && !memberErr.message.includes("duplicate key")) {
    console.error("Gagal menambahkan ke board_members:", memberErr.message);
    throw new Error(memberErr.message);
  }

  revalidatePath("/dashboard");
  return inv.board_id;
}

export async function rejectBoardInvitation(invitationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: inv, error: fetchErr } = await supabase
    .from("board_invitations")
    .select("*")
    .eq("id", invitationId)
    .single();

  if (fetchErr || !inv) {
    throw new Error("Undangan tidak ditemukan.");
  }

  if (inv.invited_email.toLowerCase() !== user.email?.toLowerCase()) {
    throw new Error("Anda tidak berhak menolak undangan ini.");
  }

  const { error: updateErr } = await supabase
    .from("board_invitations")
    .update({ status: "rejected" })
    .eq("id", invitationId);

  if (updateErr) throw new Error(updateErr.message);

  revalidatePath("/dashboard");
}


