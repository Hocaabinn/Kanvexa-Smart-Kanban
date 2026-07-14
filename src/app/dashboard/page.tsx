import { createClient } from "@/lib/supabase/server";
import { createBoard } from "./actions";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: boards } = await supabase
    .from("boards")
    .select("id, name, created_at")
    .order("created_at", { ascending: false });

  return (
    <DashboardClient 
      userEmail={user?.email ?? "Guest"}
      initialBoards={boards ?? []}
      createBoardAction={createBoard}
    />
  );
}
