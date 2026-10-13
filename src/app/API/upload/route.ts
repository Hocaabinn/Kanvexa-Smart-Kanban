import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const boardId = (formData.get("boardId") as string) || "general";

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    // Batasi ekstensi file berbahaya (HTML, SVG, EXE, JS, SH, PHP, dsb)
    const rawExt = file.name.split(".").pop()?.toLowerCase() || "bin";
    const allowedExtensions = new Set([
      "png", "jpg", "jpeg", "webp", "gif",
      "pdf", "txt", "md", "csv",
      "doc", "docx", "xls", "xlsx", "ppt", "pptx",
      "zip", "rar", "7z", "tar", "gz",
      "mp4", "mp3", "wav", "webm"
    ]);

    if (!allowedExtensions.has(rawExt)) {
      return NextResponse.json(
        { error: `Tipe file .${rawExt} tidak diizinkan demi alasan keamanan.` },
        { status: 400 }
      );
    }

    const fileExt = rawExt;
    const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${boardId}/${cleanFileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Try uploading to Supabase storage bucket 'board-attachments'
    let { data: uploadData, error: uploadErr } = await supabase.storage
      .from("board-attachments")
      .upload(filePath, fileBuffer, {
        contentType: file.type || "application/octet-stream",
        upsert: true,
      });

    // If bucket does not exist, attempt to create it and retry
    if (uploadErr && (uploadErr.message.toLowerCase().includes("bucket") || uploadErr.message.toLowerCase().includes("not found"))) {
      // Try creating the bucket with admin/service role
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

      if (serviceRoleKey && supabaseUrl) {
        // Use REST API to create bucket with service role key
        try {
          await fetch(`${supabaseUrl}/storage/v1/bucket`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${serviceRoleKey}`,
              "apikey": serviceRoleKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: "board-attachments",
              name: "board-attachments",
              public: true,
            }),
          });

          // Retry upload after bucket creation
          const retryResult = await supabase.storage
            .from("board-attachments")
            .upload(filePath, fileBuffer, {
              contentType: file.type || "application/octet-stream",
              upsert: true,
            });
          uploadData = retryResult.data;
          uploadErr = retryResult.error;
        } catch (bucketCreateErr) {
          console.warn("Auto-create bucket failed:", bucketCreateErr);
        }
      } else {
        // Fallback: try with regular client
        try {
          await supabase.storage.createBucket("board-attachments", { public: true });
          const retryResult = await supabase.storage
            .from("board-attachments")
            .upload(filePath, fileBuffer, {
              contentType: file.type || "application/octet-stream",
              upsert: true,
            });
          uploadData = retryResult.data;
          uploadErr = retryResult.error;
        } catch (bucketCreateErr) {
          console.warn("Auto-create bucket (regular client) failed:", bucketCreateErr);
        }
      }
    }

    // If upload still fails after all attempts, return a clear error
    if (uploadErr || !uploadData) {
      console.error("Storage upload failed:", uploadErr?.message);
      return NextResponse.json({
        error: `Upload gagal: Bucket 'board-attachments' belum dibuat di Supabase. Silakan buat bucket di Supabase Dashboard > Storage > New Bucket (nama: board-attachments, public: ON).`,
      }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("board-attachments")
      .getPublicUrl(filePath);

    const publicUrl = urlData?.publicUrl || null;

    return NextResponse.json({
      url: publicUrl,
      name: file.name,
      size: file.size,
    });
  } catch (err: any) {
    console.error("Upload API route error:", err);
    return NextResponse.json({ error: err?.message || "Upload gagal" }, { status: 500 });
  }
}
