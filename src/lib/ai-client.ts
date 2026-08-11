/**
 * Client-side AI Processing Utility for Multi-Agent Kanban Board.
 * Connects to either the centralized server-side API or custom user-provided API endpoints.
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
  const selectedModel = localStorage.getItem("kanvexa_selected_model") || "google/gemini-2.5-flash";

  // 1. If it's the Custom option (BYOK), fetch directly from the custom API
  if (selectedModel === "custom") {
    try {
      const customUrl = localStorage.getItem("kanvexa_custom_url") || "https://api.openai.com/v1";
      const customKey = localStorage.getItem("kanvexa_custom_key") || "";
      const customModel = localStorage.getItem("kanvexa_custom_model") || "gpt-4o-mini";

      if (!customKey) {
        return { success: false, error: "Custom API Key belum dikonfigurasi di AI Settings." };
      }

      // Format custom url: append /chat/completions if not present
      let endpoint = customUrl.trim();
      if (!endpoint.endsWith("/chat/completions")) {
        // remove trailing slash if any
        if (endpoint.endsWith("/")) {
          endpoint = endpoint.slice(0, -1);
        }
        endpoint = `${endpoint}/chat/completions`;
      }

      // Generate the appropriate System Prompt
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

      const userContent = `Judul Tugas: ${cardTitle}
Deskripsi Saat Ini:
${currentDescription || "(Belum ada deskripsi)"}

${customPrompt ? `Instruksi Tambahan Khusus: ${customPrompt}` : ""}`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${customKey}`
        },
        body: JSON.stringify({
          model: customModel,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent }
          ],
          temperature: 0.2
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        return { success: false, error: `Custom API Error (${res.status}): ${errText || "Unknown error"}` };
      }

      const data = await res.json();
      const contentText = data?.choices?.[0]?.message?.content;
      if (contentText) {
        return { success: true, content: contentText };
      } else {
        return { success: false, error: "Custom API tidak mengembalikan konten teks yang valid." };
      }
    } catch (err: any) {
      return { success: false, error: `Gagal memproses dengan Custom API: ${err.message}` };
    }
  }

  // 2. Otherwise, route through the centralized server-side API
  try {
    const response = await fetch("/API/ai-process", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cardTitle,
        currentDescription,
        agentType,
        customPrompt,
        model: selectedModel,
      }),
    });

    const data = await response.json();
    if (response.ok && data.success) {
      return { success: true, content: data.content };
    } else {
      return { success: false, error: data.error || "Gagal memproses kartu dengan AI." };
    }
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menghubungi server AI." };
  }
}
