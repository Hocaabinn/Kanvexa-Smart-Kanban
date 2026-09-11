"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { DocFolderItem, DocFileItem, DocCategory } from "@/components/board/DocsFiles/docsfiles-utils";

export async function getDocsAndFolders(boardId: string) {
  const supabase = await createClient();

  try {
    const [foldersRes, docsRes] = await Promise.all([
      supabase
        .from("board_folders")
        .select("id, board_id, name, parent_id, created_at")
        .eq("board_id", boardId)
        .order("created_at", { ascending: true }),
      supabase
        .from("board_docs")
        .select("id, board_id, folder_id, title, category, content_markdown, summary_highlights, action_items, author_email, file_url, file_name, file_size, created_at, updated_at")
        .eq("board_id", boardId)
        .order("created_at", { ascending: false })
    ]);

    const folders: DocFolderItem[] = (foldersRes.data || []).map((f: any) => ({
      id: f.id,
      name: f.name,
      fileCount: 0,
    }));

    const docs: DocFileItem[] = (docsRes.data || []).map((d: any) => ({
      id: d.id,
      board_id: d.board_id,
      folder_id: d.folder_id || undefined,
      title: d.title || "Dokumen Tanpa Judul",
      category: (d.category as DocCategory) || "PRD",
      content_markdown: d.content_markdown || "",
      summary_highlights: d.summary_highlights || [],
      action_items: d.action_items || [],
      author_email: d.author_email || "Anonim",
      file_url: d.file_url || null,
      file_name: d.file_name || null,
      file_size: d.file_size || null,
      created_at: d.created_at,
      updated_at: d.updated_at,
    }));

    return { success: true, folders, docs };
  } catch (err: any) {
    console.error("Error fetching docs & folders from Supabase:", err);
    return { success: false, folders: [], docs: [], error: err.message };
  }
}

export async function createBoardFolder(boardId: string, folderId: string, name: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("board_folders").insert({
    id: folderId,
    board_id: boardId,
    name: name.trim(),
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.warn("Supabase board_folders insert warning:", error.message);
  }
  revalidatePath(`/board/${boardId}`);
  return { success: !error };
}

export async function renameBoardFolder(boardId: string, folderId: string, name: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("board_folders")
    .update({ name: name.trim() })
    .eq("id", folderId)
    .eq("board_id", boardId);

  if (error) {
    console.warn("Supabase board_folders update warning:", error.message);
  }
  revalidatePath(`/board/${boardId}`);
  return { success: !error };
}

export async function deleteBoardFolder(boardId: string, folderId: string) {
  const supabase = await createClient();

  // Delete docs inside folder first
  await supabase.from("board_docs").delete().eq("folder_id", folderId).eq("board_id", boardId);

  // Delete folder itself
  const { error } = await supabase.from("board_folders").delete().eq("id", folderId).eq("board_id", boardId);

  if (error) {
    console.warn("Supabase board_folders delete warning:", error.message);
  }
  revalidatePath(`/board/${boardId}`);
  return { success: !error };
}

export async function createBoardDoc(
  boardId: string,
  doc: {
    id: string;
    folder_id?: string;
    title: string;
    category: DocCategory;
    content_markdown: string;
    summary_highlights?: string[];
    action_items?: string[];
    author_email: string;
  }
) {
  const supabase = await createClient();

  const { error } = await supabase.from("board_docs").insert({
    id: doc.id,
    board_id: boardId,
    folder_id: doc.folder_id || null,
    title: doc.title.trim(),
    category: doc.category,
    content_markdown: doc.content_markdown,
    summary_highlights: doc.summary_highlights || [],
    action_items: doc.action_items || [],
    author_email: doc.author_email,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.warn("Supabase board_docs insert warning:", error.message);
  }
  revalidatePath(`/board/${boardId}`);
  return { success: !error };
}

export async function updateBoardDoc(
  boardId: string,
  docId: string,
  title: string,
  category: DocCategory,
  content_markdown: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("board_docs")
    .update({
      title: title.trim(),
      category,
      content_markdown,
      updated_at: new Date().toISOString(),
    })
    .eq("id", docId)
    .eq("board_id", boardId);

  if (error) {
    console.warn("Supabase board_docs update warning:", error.message);
  }
  revalidatePath(`/board/${boardId}`);
  return { success: !error };
}

export async function deleteBoardDoc(boardId: string, docId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("board_docs").delete().eq("id", docId).eq("board_id", boardId);

  if (error) {
    console.warn("Supabase board_docs delete warning:", error.message);
  }
  revalidatePath(`/board/${boardId}`);
  return { success: !error };
}
