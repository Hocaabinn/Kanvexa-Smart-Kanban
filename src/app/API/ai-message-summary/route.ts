import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const SYSTEM_PROMPT = `Kamu adalah AI Assistant cerdas untuk Kanvexa (Smart Kanban Board).
Tugasmu adalah merangkum hasil diskusi dan pengumuman dari Message Board tim.

User akan memberikan sekumpulan postingan dan komentar dari forum/message board dalam bahasa Indonesia.

WAJIB balas HANYA dengan JSON valid berikut ini, tanpa teks tambahan di luar JSON:
{
  "summary": "Ringkasan eksekutif 2-3 kalimat mengenai poin utama yang dibicarakan.",
  "keyPoints": [
    "Poin penting 1",
    "Poin penting 2"
  ],
  "decisions": [
    "Keputusan atau kesepakatan 1",
    "Keputusan atau kesepakatan 2"
  ]
}

Aturan:
- Gunakan bahasa Indonesia yang profesional dan jelas.
- Ambil substansi inti dari ide/pengumuman/komentar.
- Jika belum ada keputusan pasti, berikan estimasi rekomendasi di bagian decisions.`;

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

  const { postsContent } = await req.json();
  if (!postsContent?.trim()) {
    return NextResponse.json({ error: "Isi diskusi tidak boleh kosong" }, { status: 400 });
  }

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
              { role: "user", content: postsContent.trim() },
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
      return NextResponse.json({ error: "Layanan AI mengalami kendala temporer." }, { status: 502 });
    }

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("AI Message Summary error:", err);
    return NextResponse.json({ error: err?.message || "Gagal merangkum diskusi." }, { status: 500 });
  }
}
