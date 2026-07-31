import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface ColumnOption {
  id: string;
  name: string;
}

const SYSTEM_PROMPT = `Kamu adalah AI Assistant Manajemen Tugas untuk Kanvexa (Smart Kanban Board).
Tugasmu adalah menganalisis teks diskusi/pengumuman dari Message Board tim dan mengurutkan/mengekstrak tugas-tugas konkret yang harus dikerjakan tim.

User akan memberikan:
1. Daftar Kolom Kanban yang tersedia saat ini (nama dan id).
2. Teks Diskusi/Pengumuman.

WAJIB balas HANYA dengan JSON valid berikut ini, tanpa teks tambahan di luar JSON:
{
  "tasks": [
    {
      "title": "Judul tugas yang actionable (diawali kata kerja)",
      "description": "Konteks singkat/detail yang dipetik dari diskusi.",
      "suggestedColumnId": "ID_KOLOM_YANG_PALING_COCOK"
    }
  ]
}

Aturan:
- Hasilkan 2-6 tugas yang paling actionable dan jelas dari diskusi.
- Judul tugas harus singkat dan padat (max 10-12 kata).
- Pilih \`suggestedColumnId\` yang paling cocok dari daftar kolom yang disediakan user (misalnya kolom 'To Do' atau 'Backlog'). Jika ragu, gunakan id kolom pertama.`;

function safeParseJson(raw: string): any {
  let cleaned = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .replace(/^[\\\]\s]+/, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.substring(start, end + 1);
  }

  return JSON.parse(cleaned);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { postsContent, columns }: { postsContent: string; columns: ColumnOption[] } = await req.json();

  if (!postsContent?.trim()) {
    return NextResponse.json({ error: "Isi diskusi tidak boleh kosong" }, { status: 400 });
  }

  if (!columns || !Array.isArray(columns) || columns.length === 0) {
    return NextResponse.json({ error: "Daftar kolom board tidak valid" }, { status: 400 });
  }

  const columnsFormatted = columns.map(c => `- ID: ${c.id}, Nama Kolom: "${c.name}"`).join("\n");
  const userPrompt = `Daftar Kolom Board saat ini:\n${columnsFormatted}\n\nTeks Diskusi/Pengumuman:\n${postsContent.trim()}`;

  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENROUTER_API_KEY belum dikonfigurasi" }, { status: 500 });
    }

    const MODELS = [
      "meta-llama/llama-3.3-70b-instruct",
      "google/gemini-2.5-flash",
      "qwen/qwen-2.5-72b-instruct"
    ];

    let parsed = null;

    for (const model of MODELS) {
      try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: userPrompt },
            ],
            max_tokens: 1500,
            temperature: 0.2,
            response_format: { type: "json_object" },
          }),
        });

        if (!res.ok) continue;

        const data = await res.json();
        const raw = data.choices?.[0]?.message?.content ?? "";
        const finishReason = data.choices?.[0]?.finish_reason;

        if (finishReason === "error" || !raw.trim()) continue;

        parsed = safeParseJson(raw);
        if (parsed && typeof parsed === "object") break;
      } catch (e) {
        continue;
      }
    }

    if (!parsed) {
      return NextResponse.json({ error: "Layanan AI mengalami kendala temporer. Coba beberapa saat lagi." }, { status: 502 });
    }

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("AI Discussion to Tasks error:", err);
    return NextResponse.json({ error: err?.message || "Gagal mengubah diskusi menjadi tugas." }, { status: 500 });
  }
}
