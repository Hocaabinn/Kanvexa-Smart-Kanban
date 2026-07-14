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

export async function deleteColumn(boardId: string, columnId: string) {
  const supabase = await createClient();
  // Cards inside are deleted automatically via ON DELETE CASCADE
  const { error } = await supabase.from("board_columns").delete().eq("id", columnId);
  if (error) throw new Error(error.message);
  revalidatePath(`/board/${boardId}`);
}

// ── AI Breakdown ───────────────────────────────────────────────────────────

interface AICard   { title: string; }
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
      board_id:  boardId,
      column_id: col.id,
      title:     c.title,
      position:  i,
    }));

    if (cardRows.length) await supabase.from("cards").insert(cardRows);
  }

  revalidatePath(`/board/${boardId}`);
}
