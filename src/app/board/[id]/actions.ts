"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// ── Cards ──────────────────────────────────────────────────────────────────

export async function createCard(boardId: string, columnId: string, title: string) {
  const supabase = await createClient();

  // Put new card at the bottom of its column
  const { data: existing } = await supabase
    .from("cards")
    .select("position")
    .eq("column_id", columnId)
    .order("position", { ascending: false })
    .limit(1);

  const position = existing?.[0]?.position ?? -1;

  const { error } = await supabase.from("cards").insert({
    board_id: boardId,
    column_id: columnId,
    title: title.trim(),
    position: position + 1,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/board/${boardId}`);
}

export async function updateCardTitle(boardId: string, cardId: string, title: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("cards")
    .update({ title: title.trim(), updated_at: new Date().toISOString() })
    .eq("id", cardId);
  if (error) throw new Error(error.message);
  revalidatePath(`/board/${boardId}`);
}

export async function deleteCard(boardId: string, cardId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("cards").delete().eq("id", cardId);
  if (error) throw new Error(error.message);
  revalidatePath(`/board/${boardId}`);
}

// Called by the drag-and-drop client after a drop. Receives the full ordered
// list of card IDs for each affected column so we can bulk-update positions.
export async function moveCard(
  boardId: string,
  cardId: string,
  newColumnId: string,
  // Ordered card IDs for every column that changed (source and/or target).
  columnOrders: { columnId: string; cardIds: string[] }[]
) {
  const supabase = await createClient();

  // Move card to the new column first
  await supabase
    .from("cards")
    .update({ column_id: newColumnId, updated_at: new Date().toISOString() })
    .eq("id", cardId);

  // Bulk-update positions for all changed columns
  for (const { cardIds } of columnOrders) {
    for (let i = 0; i < cardIds.length; i++) {
      await supabase.from("cards").update({ position: i }).eq("id", cardIds[i]);
    }
  }

  revalidatePath(`/board/${boardId}`);
}

// ── Columns ────────────────────────────────────────────────────────────────

export async function createColumn(boardId: string, name: string) {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("board_columns")
    .select("position")
    .eq("board_id", boardId)
    .order("position", { ascending: false })
    .limit(1);

  const position = existing?.[0]?.position ?? -1;

  const { error } = await supabase.from("board_columns").insert({
    board_id: boardId,
    name: name.trim(),
    position: position + 1,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/board/${boardId}`);
}

export async function createColumnWithCard(
  boardId: string,
  columnName: string,
  cardTitle: string,
  details?: { dueDate?: string; dueTime?: string; assignee?: string; notes?: string }
) {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("board_columns")
    .select("position")
    .eq("board_id", boardId)
    .order("position", { ascending: false })
    .limit(1);

  const position = (existing?.[0]?.position ?? -1) + 1;

  const { data: col, error: colErr } = await supabase
    .from("board_columns")
    .insert({
      board_id: boardId,
      name: columnName.trim(),
      position: position,
    })
    .select()
    .single();

  if (colErr || !col) throw new Error(colErr?.message || "Gagal membuat kolom");

  if (cardTitle && cardTitle.trim()) {
    let fullTitle = cardTitle.trim();
    const metaParts = [];
    if (details?.dueDate) metaParts.push(`📅 ${details.dueDate}`);
    if (details?.dueTime) metaParts.push(`⏰ ${details.dueTime}`);
    if (details?.assignee) metaParts.push(`👤 ${details.assignee}`);
    if (details?.notes) metaParts.push(`📝 ${details.notes}`);

    if (metaParts.length > 0) {
      fullTitle += ` (${metaParts.join(" • ")})`;
    }

    await supabase.from("cards").insert({
      board_id: boardId,
      column_id: col.id,
      title: fullTitle,
      position: 0,
    });
  }

  revalidatePath(`/board/${boardId}`);
}

export async function createKanbanWorkflow(
  boardId: string,
  initialCardTitle?: string,
  details?: { dueDate?: string; dueTime?: string; assignee?: string; notes?: string }
) {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("board_columns")
    .select("position")
    .eq("board_id", boardId)
    .order("position", { ascending: false })
    .limit(1);

  let position = (existing?.[0]?.position ?? -1) + 1;

  const colNames = ["To-dos", "In Progress", "In Review", "Done"];
  let firstColId = "";

  for (const cName of colNames) {
    const { data: col } = await supabase
      .from("board_columns")
      .insert({ board_id: boardId, name: cName, position: position++ })
      .select()
      .single();

    if (col && !firstColId) {
      firstColId = col.id;
    }
  }

  if (firstColId && initialCardTitle && initialCardTitle.trim()) {
    let fullTitle = initialCardTitle.trim();
    const metaParts = [];
    if (details?.dueDate) metaParts.push(`📅 ${details.dueDate}`);
    if (details?.dueTime) metaParts.push(`⏰ ${details.dueTime}`);
    if (details?.assignee) metaParts.push(`👤 ${details.assignee}`);
    if (details?.notes) metaParts.push(`📝 ${details.notes}`);

    if (metaParts.length > 0) {
      fullTitle += ` (${metaParts.join(" • ")})`;
    }

    await supabase.from("cards").insert({
      board_id: boardId,
      column_id: firstColId,
      title: fullTitle,
      position: 0,
    });
  }

  revalidatePath(`/board/${boardId}`);
}

export async function deleteColumn(boardId: string, columnId: string) {
  const supabase = await createClient();
  // Cards inside are deleted automatically via ON DELETE CASCADE
  const { error } = await supabase.from("board_columns").delete().eq("id", columnId);
  if (error) throw new Error(error.message);
  revalidatePath(`/board/${boardId}`);
}

// ── AI Breakdown ───────────────────────────────────────────────────────────

interface AICard { title: string; }
interface AIColumn { name: string; cards: AICard[]; }

// Inserts AI-generated columns and cards into an existing board.
// Appends after existing columns rather than replacing them.
export async function insertAIBreakdown(boardId: string, aiColumns: AIColumn[], clearExisting: boolean = false) {
  const supabase = await createClient();

  if (clearExisting) {
    // Delete all columns on the board. (Cascading delete will remove all cards)
    const { error: deleteError } = await supabase
      .from("board_columns")
      .delete()
      .eq("board_id", boardId);
    if (deleteError) throw new Error(deleteError.message);
  }

  // Find the highest existing column position so we append, not overwrite
  let colPosition = 0;
  if (!clearExisting) {
    const { data: existing } = await supabase
      .from("board_columns")
      .select("position")
      .eq("board_id", boardId)
      .order("position", { ascending: false })
      .limit(1);

    colPosition = (existing?.[0]?.position ?? -1) + 1;
  }

  for (const aiCol of aiColumns) {
    const { data: col, error: colErr } = await supabase
      .from("board_columns")
      .insert({ board_id: boardId, name: aiCol.name, position: colPosition++ })
      .select()
      .single();

    if (colErr || !col) continue;

    const cardRows = aiCol.cards.map((c, i) => ({
      board_id: boardId,
      column_id: col.id,
      title: c.title,
      position: i,
    }));

    if (cardRows.length) await supabase.from("cards").insert(cardRows);
  }

  revalidatePath(`/board/${boardId}`);
}

// ── Message Board Actions ──────────────────────────────────────────────────

export async function createPost(
  boardId: string,
  title: string,
  content: string,
  category: "announcement" | "idea" | "discussion" | "qa" = "discussion",
  isPinned: boolean = false,
  fileUrl?: string | null,
  fileName?: string | null,
  fileSize?: number | null
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from("board_posts").insert({
    board_id: boardId,
    author_id: user.id,
    author_email: user.email || "Anonim",
    title: title.trim(),
    content: content.trim(),
    category,
    is_pinned: isPinned,
    file_url: fileUrl || null,
    file_name: fileName || null,
    file_size: fileSize || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/board/${boardId}`);
}

export async function deletePost(boardId: string, postId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("board_posts").delete().eq("id", postId);
  if (error) throw new Error(error.message);
  revalidatePath(`/board/${boardId}`);
}

export async function togglePinPost(boardId: string, postId: string, newPinnedState: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("board_posts")
    .update({ is_pinned: newPinnedState, updated_at: new Date().toISOString() })
    .eq("id", postId);
  if (error) throw new Error(error.message);
  revalidatePath(`/board/${boardId}`);
}

export async function createComment(boardId: string, postId: string, content: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from("board_post_comments").insert({
    post_id: postId,
    board_id: boardId,
    author_id: user.id,
    author_email: user.email || "Anonim",
    content: content.trim(),
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/board/${boardId}`);
}

export async function deleteComment(boardId: string, commentId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("board_post_comments").delete().eq("id", commentId);
  if (error) throw new Error(error.message);
  revalidatePath(`/board/${boardId}`);
}

export async function insertTasksFromDiscussion(
  boardId: string,
  tasks: { title: string; description?: string; columnId: string }[]
) {
  const supabase = await createClient();

  for (const task of tasks) {
    // Get current max position for target column
    const { data: existing } = await supabase
      .from("cards")
      .select("position")
      .eq("column_id", task.columnId)
      .order("position", { ascending: false })
      .limit(1);

    const position = (existing?.[0]?.position ?? -1) + 1;

    await supabase.from("cards").insert({
      board_id: boardId,
      column_id: task.columnId,
      title: task.title.trim(),
      description: task.description?.trim() || null,
      position,
    });
  }

  revalidatePath(`/board/${boardId}`);
}

export async function inviteBoardMember(
  boardId: string,
  email: string,
  role: "admin" | "member" | "viewer" = "member"
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Attempt inserting into board_members table if table exists
  try {
    await supabase.from("board_members").insert({
      board_id: boardId,
      user_id: user.id, // For demo/testing invitation
      role: role,
    });
  } catch (e) {
    console.log("board_members insert handled:", e);
  }

  revalidatePath(`/board/${boardId}`);
}


