/**
 * Client-side AI Processing Utility for Multi-Agent Kanban Board.
 * Handles Gemini API (BYOK), OpenRouter, and local Ollama API directly from the browser.
 */

interface AgentResponse {
  success: boolean;
  content?: string;
  error?: string;
}

export async function processCardWithAgent(
  cardTitle: string,
  currentDescription: string,
  agentType: string,
  customPrompt: string = ""
): Promise<AgentResponse> {
  const provider = localStorage.getItem("kanvexa_ai_provider") || "gemini";

  // System Prompts for each role - adapts dynamically to Tech or Business context
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
  }

  // Construct prompt
  const userContent = `Judul Tugas: ${cardTitle}
Deskripsi Saat Ini:
${currentDescription || "(Belum ada deskripsi)"}

${customPrompt ? `Instruksi Tambahan Khusus: ${customPrompt}` : ""}`;

  if (provider === "gemini") {
    const apiKey = localStorage.getItem("kanvexa_gemini_api_key");
    if (!apiKey) {
      return { success: false, error: "Gemini API Key tidak ditemukan. Buka Pengaturan AI untuk memasukkannya." };
    }

    const modelsToTry = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-2.5-pro"];
    let lastError = "";

    for (const model of modelsToTry) {
      const payload = {
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\n---\n\n${userContent}` }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      };

      // Strategy 1: Header x-goog-api-key
      try {
        const urlHeader = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
        const resHeader = await fetch(urlHeader, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify(payload)
        });

        if (resHeader.ok) {
          const data = await resHeader.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return { success: true, content: text };
        } else if (resHeader.status === 429) {
          return { success: false, error: "Kuota API Gemini kamu sudah habis. Tunggu beberapa menit lalu coba lagi, atau upgrade ke paket berbayar di https://ai.google.dev" };
        }
      } catch (e) {}

      // Strategy 2: Query param ?key=
      try {
        const urlQuery = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const resQuery = await fetch(urlQuery, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (resQuery.ok) {
          const data = await resQuery.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return { success: true, content: text };
        } else if (resQuery.status === 429) {
          return { success: false, error: "Kuota API Gemini kamu sudah habis. Tunggu beberapa menit lalu coba lagi, atau upgrade ke paket berbayar di https://ai.google.dev" };
        } else {
          const errData = await resQuery.json();
          lastError = errData?.error?.message || `HTTP ${resQuery.status}`;
        }
      } catch (e: any) {
        lastError = e.message;
      }
    }

    return { success: false, error: lastError || "Gagal memproses dengan Gemini API." };
  } else if (provider === "openrouter") {
    // OpenRouter (free-tier models)
    const apiKey = localStorage.getItem("kanvexa_openrouter_api_key");
    if (!apiKey) {
      return { success: false, error: "OpenRouter API Key tidak ditemukan. Buka Pengaturan AI untuk memasukkannya." };
    }

    const modelsToTry = [
      "openrouter/free",
      "meta-llama/llama-3.3-70b-instruct:free",
      "qwen/qwen-2.5-72b-instruct:free",
    ];
    let lastError = "";

    for (const model of modelsToTry) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin,
            "X-Title": "Kanvexa",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userContent },
            ],
            temperature: 0.2,
            max_tokens: 2048,
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data?.choices?.[0]?.message?.content;
          if (text) return { success: true, content: text };
        } else if (response.status === 429) {
          return { success: false, error: "Kuota OpenRouter kamu sudah habis. Tunggu beberapa menit lalu coba lagi, atau cek limit di https://openrouter.ai/settings/credits" };
        } else {
          const errData = await response.json();
          lastError = errData?.error?.message || `HTTP ${response.status}`;
        }
      } catch (e: any) {
        lastError = e.message;
      }
    }

    return { success: false, error: lastError || "Gagal memproses dengan OpenRouter API." };
  } else {
    // Ollama
    const ollamaUrl = localStorage.getItem("kanvexa_ollama_url") || "http://localhost:11434";
    const ollamaModel = localStorage.getItem("kanvexa_ollama_model") || "llama3";

    try {
      const response = await fetch(`${ollamaUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: ollamaModel,
          prompt: `${systemPrompt}\n\n---\n\n${userContent}`,
          stream: false,
          options: {
            temperature: 0.2
          }
        })
      });

      if (!response.ok) {
        return { success: false, error: "Gagal memproses dengan Ollama lokal." };
      }

      const data = await response.json();
      return { success: true, content: data.response };
    } catch (err: any) {
      return { success: false, error: `Koneksi ke Ollama gagal (${ollamaUrl}). Pastikan Ollama aktif dan CORS diperbolehkan.` };
    }
  }
}
