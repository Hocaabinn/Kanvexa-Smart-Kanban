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

        // Call OpenRouter via direct fetch as specified by the user
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
                "X-Title": "Kanvexa",
            },
            body: JSON.stringify({
                model: "google/gemini-2.5-flash",
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: goal.trim() },
                ],
                temperature: 0.2,
                response_format: { type: "json_object" },
            }),
        });

        if (!res.ok) {
            const errText = await res.text();
            console.error("OpenRouter REST API error:", errText);
            return NextResponse.json({ error: "AI service error (Rate-limited/Temporarily unavailable)" }, { status: 502 });
        }

        const data = await res.json();
        const raw = data.choices?.[0]?.message?.content ?? "";

        const parsed = safeParseJson(raw);
        return NextResponse.json(parsed);
    } catch (err: any) {
        console.error("AI breakdown route error:", err);
        return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
    }
}
