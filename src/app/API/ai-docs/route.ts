import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const SYSTEM_PROMPT = `You are Kanvexa AI, an intelligent document generator and assistant within Kanvexa's Docs & Files module. Your primary job is to generate structured project documentation, create technical briefs, summarize complex file content, and draft project notes based on user inputs.

---

## 🛠️ CORE CAPABILITIES

1. GENERATE DRAFT DOC (action: "generate_doc")
   - Creates full-fledged project notes, Product Requirement Documents (PRDs), meeting notes, or technical specs based on a short prompt.
   - Formats content using clean Markdown (headings, bullet points, checklists).

2. SUMMARIZE FILE / DOC (action: "summarize_doc")
   - Reads provided text or document content and extracts:
     - Executive summary (2-3 sentences)
     - Key takeaways / Action items
     - Important links or references mentioned.

3. IMPROVE / REVISE DOC (action: "improve_doc")
   - Cleans up raw user notes, fixes grammar, and structures messy thoughts into a professional team document.

---

## 📐 OUTPUT FORMAT RULES

You MUST ALWAYS respond strictly in JSON format. Never include introductory text or markdown formatting outside the JSON object.

### JSON Schema:

{
  "action": "generate_doc" | "summarize_doc" | "improve_doc",
  "data": {
    "title": "Document Title",
    "category": "PRD" | "Meeting Notes" | "Briefing" | "Technical Spec" | "General",
    "content_markdown": "Full document content formatted in Markdown...",
    "summary_highlights": [
      "Key point 1",
      "Key point 2"
    ],
    "action_items": [
      "Task 1 to be done",
      "Task 2 to be done"
    ]
  }
}

---

## 🎯 TONAL & LANGUAGE GUIDELINES

1. Language: Always respond in Indonesian for titles, headings, and document body text, while retaining industry-standard terms (e.g., "API Spec", "Authentication Flow", "Wireframe", "Deployment").
2. Formatting: Use Markdown inside content_markdown (bolding, lists, tables) to ensure high readability.
3. Tone: Professional, structured, clear, and actionable.`;

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, prompt, currentContent, category } = await req.json();

    if (!prompt && !currentContent) {
      return NextResponse.json({ error: "Prompt atau isi dokumen wajib diisi." }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      // Fallback mock JSON generator if no API key is provided
      const mockTitle = prompt ? `Dokumen: ${prompt.slice(0, 30)}` : "Dokumen Hasil AI";
      return NextResponse.json({
        action: action || "generate_doc",
        data: {
          title: mockTitle,
          category: category || "General",
          content_markdown: `# ${mockTitle}\n\n## Ringkasan Eksekutif\nDokumen ini dibuat secara otomatis oleh **Kanvexa AI** untuk membantu efisiensi tim.\n\n### Detail & Spesifikasi\n- **Target:** Peluncuran Modul\n- **Status:** Draf Awal\n\n### Checklist Pekerjaan\n- [ ] Review spesifikasi teknis\n- [ ] Validasi alur pengguna`,
          summary_highlights: ["Draf dokumen telah dibuat", "Siap direview oleh tim"],
          action_items: ["Review alur pengguna", "Validasi jadwal peluncuran"],
        },
      });
    }

    const userMessage = `Aksi yang diminta: ${action || "generate_doc"}
Kategori: ${category || "General"}
Prompt Pengguna: ${prompt || "Tidak ada prompt tambahan"}
Isi Dokumen Saat Ini / Konteks:
${currentContent || "Tidak ada konteks dokumen"}`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
        "X-Title": "Kanvexa AI Docs",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        max_tokens: 2000,
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter Error:", errText);
      throw new Error("Gagal menghubungi layanan AI.");
    }

    const resJson = await response.json();
    const rawContent = resJson.choices?.[0]?.message?.content || "";

    // Clean JSON block if wrapped in markdown
    const cleaned = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("AI Docs route error:", err);
    return NextResponse.json({ error: err?.message || "Gagal memproses dokumen dengan AI." }, { status: 500 });
  }
}
