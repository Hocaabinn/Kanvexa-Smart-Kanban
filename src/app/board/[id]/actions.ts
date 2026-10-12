"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// ── Activity Logging Helper ─────────────────────────────────────────────────
// Silently logs user activity — never blocks the main action if it fails.
async function logActivity(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  eventType: string,
  boardId: string | null,
  boardName: string | null,
  metadata: Record<string, unknown> = {}
) {
  try {
    await supabase.from("activity_logs").insert({
      user_id: userId,
      board_id: boardId,
      board_name: boardName,
      event_type: eventType,
      metadata,
    });
  } catch {
    // Non-blocking: silently fail if table doesn't exist yet
  }
}

// ── Cards ──────────────────────────────────────────────────────────────────

export async function createCard(boardId: string, columnId: string, title: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch column name for logging
  const { data: colData } = await supabase
    .from("board_columns")
    .select("name")
    .eq("id", columnId)
    .single();

  // Fetch board name for logging
  const { data: boardData } = await supabase
    .from("boards")
    .select("name")
    .eq("id", boardId)
    .single();

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

  // Log activity
  if (user) {
    await logActivity(supabase, user.id, "task_created", boardId, boardData?.name || null, {
      task_title: title.trim(),
      column_name: colData?.name || "",
    });
  }

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

export async function updateCardDescription(boardId: string, cardId: string, description: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("cards")
    .update({ description: description, updated_at: new Date().toISOString() })
    .eq("id", cardId);
  if (error) throw new Error(error.message);
  revalidatePath(`/board/${boardId}`);
}

export async function deleteCard(boardId: string, cardId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch card title and board name before deletion for logging
  const { data: cardData } = await supabase
    .from("cards")
    .select("title")
    .eq("id", cardId)
    .single();
  const { data: boardData } = await supabase
    .from("boards")
    .select("name")
    .eq("id", boardId)
    .single();

  const { error } = await supabase.from("cards").delete().eq("id", cardId);
  if (error) throw new Error(error.message);

  // Log activity
  if (user) {
    await logActivity(supabase, user.id, "task_deleted", boardId, boardData?.name || null, {
      task_title: cardData?.title || "Tugas",
    });
  }

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

  const updates: { id: string; board_id: string; column_id: string; position: number; updated_at?: string }[] = [];
  
  for (const { columnId, cardIds } of columnOrders) {
    cardIds.forEach((id, index) => {
      updates.push({
        id,
        board_id: boardId,
        column_id: columnId,
        position: index,
        ...(id === cardId ? { updated_at: new Date().toISOString() } : {})
      });
    });
  }

  if (updates.length > 0) {
    for (const update of updates) {
      const { error } = await supabase
        .from("cards")
        .update({
          column_id: update.column_id,
          position: update.position,
          ...(update.updated_at ? { updated_at: update.updated_at } : {})
        })
        .eq("id", update.id);
      if (error) throw new Error(error.message);
    }
  }

  revalidatePath(`/board/${boardId}`);
}

// ── Columns ────────────────────────────────────────────────────────────────

export async function createColumn(boardId: string, name: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch board name for logging
  const { data: boardData } = await supabase
    .from("boards")
    .select("name")
    .eq("id", boardId)
    .single();

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

  // Log activity
  if (user) {
    await logActivity(supabase, user.id, "column_created", boardId, boardData?.name || null, {
      column_name: name.trim(),
    });
  }

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
  const colRows = colNames.map((cName, idx) => ({
    board_id: boardId,
    name: cName,
    position: position + idx
  }));

  const { data: insertedCols, error: colErr } = await supabase
    .from("board_columns")
    .insert(colRows)
    .select("id, name")
    .order("position", { ascending: true });

  if (colErr) throw new Error(colErr.message);

  const firstColId = insertedCols?.[0]?.id;

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

export async function updateColumnAgent(boardId: string, columnId: string, agentType: string, agentPrompt?: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("board_columns")
    .update({ agent_type: agentType, agent_prompt: agentPrompt || null })
    .eq("id", columnId);
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

  // Bulk insert all columns
  const colRows = aiColumns.map((aiCol, idx) => ({
    board_id: boardId,
    name: aiCol.name,
    position: colPosition + idx
  }));

  const { data: insertedCols, error: colErr } = await supabase
    .from("board_columns")
    .insert(colRows)
    .select("id, name");

  if (colErr) throw new Error(colErr.message);

  if (insertedCols && insertedCols.length > 0) {
    const cardRows: { board_id: string; column_id: string; title: string; position: number }[] = [];
    
    aiColumns.forEach(aiCol => {
      const dbCol = insertedCols.find(c => c.name === aiCol.name);
      if (dbCol && aiCol.cards && aiCol.cards.length > 0) {
        aiCol.cards.forEach((c, i) => {
          cardRows.push({
            board_id: boardId,
            column_id: dbCol.id,
            title: c.title,
            position: i
          });
        });
      }
    });

    if (cardRows.length > 0) {
      const { error: cardErr } = await supabase.from("cards").insert(cardRows);
      if (cardErr) throw new Error(cardErr.message);
    }
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
  if (tasks.length === 0) return;
  const supabase = await createClient();

  // Find unique column IDs
  const uniqueColIds = Array.from(new Set(tasks.map(t => t.columnId)));
  
  // Find current max positions for these columns
  const colPositions: { [colId: string]: number } = {};
  for (const colId of uniqueColIds) {
    const { data: existing } = await supabase
      .from("cards")
      .select("position")
      .eq("column_id", colId)
      .order("position", { ascending: false })
      .limit(1);
    
    colPositions[colId] = (existing?.[0]?.position ?? -1) + 1;
  }

  // Build the list of cards to insert
  const cardsToInsert = tasks.map(task => {
    const pos = colPositions[task.columnId]++;
    return {
      board_id: boardId,
      column_id: task.columnId,
      title: task.title.trim(),
      description: task.description?.trim() || null,
      position: pos
    };
  });

  const { error } = await supabase.from("cards").insert(cardsToInsert);
  if (error) throw new Error(error.message);

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

  const { data: board, error: boardErr } = await supabase
    .from("boards")
    .select("name")
    .eq("id", boardId)
    .single();

  if (boardErr || !board) {
    throw new Error("Papan tidak ditemukan.");
  }

  const { error: inviteErr } = await supabase
    .from("board_invitations")
    .insert({
      board_id: boardId,
      board_name: board.name,
      invited_email: email.trim(),
      role: role,
      invited_by_email: user.email || "Kolaborator",
      status: "pending"
    });

  if (inviteErr) {
    throw new Error(inviteErr.message);
  }

  // Log invitation sent
  await logActivity(supabase, user.id, "invitation_sent", boardId, board.name, {
    invited_email: email.trim(),
    role,
  });

  revalidatePath(`/board/${boardId}`);
}


