"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createBoard(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  if (!name) return;

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  const { data: board, error } = await supabase
    .from("boards")
    .insert({ name, created_by: userData.user.id })
    .select()
    .single();

  if (error) {
    // In a real app, surface this to the UI instead of throwing.
    throw new Error(error.message);
  }

  // Seed three default columns so a brand new board isn't empty.
  await supabase.from("board_columns").insert([
    { board_id: board.id, name: "To do", position: 0 },
    { board_id: board.id, name: "In progress", position: 1 },
    { board_id: board.id, name: "Done", position: 2 },
  ]);

  revalidatePath("/dashboard");
  redirect(`/board/${board.id}`);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
