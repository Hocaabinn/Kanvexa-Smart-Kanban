import { createClient } from "@/lib/supabase/server";
import { createBoard } from "./actions";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: boards } = await supabase
    .from("boards")
    .select("id, name, created_at, owner_email")
    .order("created_at", { ascending: false });

  let initialInvitations = [];
  try {
    if (user && user.email) {
      const { data: invitations } = await supabase
        .from("board_invitations")
        .select("*")
        .eq("invited_email", user.email)
        .eq("status", "pending");
      if (invitations) {
        initialInvitations = invitations;
      }
    }
  } catch (err) {
    console.error("Gagal memuat undangan, mungkin tabel board_invitations belum dibuat:", err);
  }

  return (
    <DashboardClient 
      userEmail={user?.email ?? "Guest"}
      initialBoards={boards ?? []}
      initialInvitations={initialInvitations}
      createBoardAction={createBoard}
    />
  );
}
