import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const SYSTEM_PROMPT = `Kamu adalah asisten perencanaan proyek. 
User akan memberikan satu kalimat tujuan/proyek dalam bahasa Indonesia.
Tugasmu: urai jadi kolom kanban dan kartu tugas yang logis dan actionable.

WAJIB balas HANYA dengan JSON valid berikut ini, tanpa teks lain, tanpa markdown:
{
  "columns": [
    {
      "name": "Nama Kolom",
      "cards": [
        { "title": "Judul tugas spesifik" }
      ]
    }
  ]
}

Aturan:
- Buat 3–5 kolom yang merepresentasikan fase/kategori kerja
- Setiap kolom berisi 2–5 kartu tugas yang konkret dan spesifik
- Gunakan bahasa Indonesia yang natural
- Judul kartu harus actionable (mulai dengan kata kerja jika memungkinkan)
- Sesuaikan dengan konteks yang diberikan user`;

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
    // Verify user is authenticated
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { goal } = await req.json();
    if (!goal?.trim()) return NextResponse.json({ error: "Goal is required" }, { status: 400 });

    try {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "OPENROUTER_API_KEY tidak dikonfigurasi" }, { status: 500 });
        }

        const MODELS = [
            "meta-llama/llama-3.3-70b-instruct",
            "google/gemini-2.5-flash",
            "qwen/qwen-2.5-72b-instruct"
        ];

        let parsed = null;
        let lastErrorMsg = "";

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
                            { role: "user", content: goal.trim() },
                        ],
                        max_tokens: 1500,
                        temperature: 0.2,
                        response_format: { type: "json_object" },
                    }),
                });

                if (!res.ok) {
                    lastErrorMsg = await res.text();
                    continue;
                }

                const data = await res.json();
                const raw = data.choices?.[0]?.message?.content ?? "";
                const finishReason = data.choices?.[0]?.finish_reason;

                if (finishReason === "error" || !raw.trim()) {
                    continue;
                }

                parsed = safeParseJson(raw);
                if (parsed && typeof parsed === "object") {
                    break;
                }
            } catch (err: any) {
                lastErrorMsg = err?.message || "JSON parse error";
            }
        }

        if (!parsed) {
            return NextResponse.json({ error: "Gagal mengurai tugas dengan AI. Coba lagi dalam beberapa saat." }, { status: 502 });
        }

        return NextResponse.json(parsed);
    } catch (err: any) {
        console.error("AI breakdown route error:", err);
        return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
    }
}
