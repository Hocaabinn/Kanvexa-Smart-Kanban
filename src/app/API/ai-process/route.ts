import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  // 1. Verify user is authenticated
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 2. Parse request payload
  const { cardTitle, currentDescription, agentType, customPrompt, model: userModel } = await req.json();
  if (!cardTitle?.trim() || !agentType) {
    return NextResponse.json({ error: "Card title and agent type are required" }, { status: 400 });
  }

  // 3. Define System Prompts
  let systemPrompt = "";
  if (agentType === "researcher") {
    systemPrompt = `Anda adalah seorang Riset & Konseptor Agent (Business Analyst & Product Researcher).
Tugas Anda adalah menganalisis judul kartu tugas dan deskripsi awal yang diberikan oleh user.

CONTOH ADAPTASI KONTEKS:
1. Jika kartu ini bertema IT/Teknologi/Pemrograman: Buat riset kompetitor teknologi, spesifikasi fitur sistem, dan kebutuhan teknis.
2. Jika kartu ini bertema Bisnis/Pemasaran/Event/Operasional/Umum: Buat riset pasar, profil target audiens, strategi pemasaran, atau konsep kreatif bisnis.

Gunakan Bahasa Indonesia yang jelas.

Format Output harus memiliki bagian berikut:
### 🔍 Analisis & Riset
(Brainstorming ide kompetitor / pasar)

### 📋 Spesifikasi Rencana
(Detail poin-poin penting yang harus dibuat atau dipenuhi)

### ⚙️ Kebutuhan & Rekomendasi
(Teknologi/tools yang direkomendasikan, atau aset yang dibutuhkan)`;
  } else if (agentType === "coder") {
    systemPrompt = `Anda adalah seorang Pembuat Draf & Solusi Agent (Drafter & Builder).
Tugas Anda adalah mengambil riset/spesifikasi dari deskripsi kartu dan menghasilkan solusi draf yang konkrit untuk mewujudkan tugas tersebut.

CONTOH ADAPTASI KONTEKS:
1. Jika kartu bertema IT/Teknologi/Pemrograman: Berikan kerangka kode program/prototype (HTML/CSS/JS/React/Next.js) yang lengkap dan rapi dalam blok kode markdown.
2. Jika kartu bertema Bisnis/Pemasaran/Event/Umum: Tulis draf proposal bisnis, draf konten copy-writing iklan, draf email penawaran, naskah presentasi, atau template rencana kerja operasional yang siap pakai.

Gunakan Bahasa Indonesia yang jelas.

Format Output harus memiliki bagian berikut:
### 🏗️ Penjelasan Draf / Solusi
(Penjelasan cara kerja kode atau garis besar rencana bisnis Anda)

### 📄 Hasil Draf / Kode Program
(Masukkan kode program dalam blok kode markdown jika IT, atau draf teks proposal/copywriting siap pakai jika Bisnis/Non-IT)`;
  } else if (agentType === "qa") {
    systemPrompt = `Anda adalah seorang Review & Evaluasi Agent (Quality Assurance, Editor, & Risk Evaluator).
Tugas Anda adalah meninjau rencana/kode program yang ada di dalam deskripsi kartu ini.

CONTOH ADAPTASI KONTEKS:
1. Jika kartu bertema IT/Teknologi/Pemrograman: Identifikasi potensi bug, celah keamanan sistem, edge cases kode program, dan buat checklist pengujian teknis.
2. Jika kartu bertema Bisnis/Pemasaran/Event/Umum: Evaluasi kelemahan strategi, analisis risiko kegagalan rencana bisnis, koreksi tata bahasa, dan buat checklist evaluasi operasional.

Gunakan Bahasa Indonesia yang jelas.

Format Output harus memiliki bagian berikut:
### 🚨 Analisis Risiko & Evaluasi Temuan
(Temuan celah keamanan/bug jika IT, atau analisis risiko operasional/finansial jika Bisnis)

### 🛠️ Rekomendasi Perbaikan
(Saran perbaikan kode atau strategi alternatif)

### 🧪 Checklist Verifikasi & Pengujian
- [ ] Poin Pengujian/Evaluasi 1
- [ ] Poin Pengujian/Evaluasi 2
- [ ] Poin Pengujian/Evaluasi 3`;
  } else {
    return NextResponse.json({ error: "Invalid agent type" }, { status: 400 });
  }

  // 4. Construct user payload
  const userContent = `Judul Tugas: ${cardTitle}
Deskripsi Saat Ini:
${currentDescription || "(Belum ada deskripsi)"}

${customPrompt ? `Instruksi Tambahan Khusus: ${customPrompt}` : ""}`;

  // 5. Connect to OpenRouter server-side using developer's API key
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Server AI key is not configured" }, { status: 500 });
    }

    const MODELS = [
      "google/gemini-2.5-flash",
      "meta-llama/llama-3.3-70b-instruct",
      "qwen/qwen-2.5-72b-instruct"
    ];

    if (userModel) {
      const idx = MODELS.indexOf(userModel);
      if (idx !== -1) {
        MODELS.splice(idx, 1);
      }
      MODELS.unshift(userModel);
    }

    let content = "";
    let lastError = "";

    for (const model of MODELS) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
            "X-Title": "Kanvexa",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userContent }
            ],
            temperature: 0.2,
            max_tokens: 2548,
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data?.choices?.[0]?.message?.content;
          if (text) {
            content = text;
            break;
          }
        } else {
          lastError = `HTTP ${response.status} from model ${model}`;
        }
      } catch (err: any) {
        lastError = err.message;
      }
    }

    if (!content) {
      return NextResponse.json({ error: lastError || "Failed to process with AI models" }, { status: 502 });
    }

    return NextResponse.json({ success: true, content });
  } catch (err: any) {
    console.error("Centralized AI process error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
