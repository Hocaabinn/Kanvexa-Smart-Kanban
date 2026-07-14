"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

export async function createBoard(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  if (!name) return;

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  const boardId = crypto.randomUUID();
  const { error } = await supabase
    .from("boards")
    .insert({ id: boardId, name, created_by: userData.user.id });

  if (error) {
    // In a real app, surface this to the UI instead of throwing.
    throw new Error(error.message);
  }

  // Seed three default columns so a brand new board isn't empty.
  await supabase.from("board_columns").insert([
    { board_id: boardId, name: "To do", position: 0 },
    { board_id: boardId, name: "In progress", position: 1 },
    { board_id: boardId, name: "Done", position: 2 },
  ]);

  revalidatePath("/dashboard");
  redirect(`/board/${boardId}`);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function deleteBoard(boardId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("boards").delete().eq("id", boardId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function renameBoard(boardId: string, newName: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("boards")
    .update({ name: newName.trim() })
    .eq("id", boardId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

