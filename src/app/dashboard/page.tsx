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

  // Fetch pending invitations for the currently logged-in user
  let initialInvitations: any[] = [];
  if (user && user.email) {
    const userEmailLower = user.email.toLowerCase();
    const { data: invitations, error: invErr } = await supabase
      .from("board_invitations")
      .select("*")
      .eq("status", "pending");

    if (invErr) {
      console.error("Error fetching board_invitations:", invErr.message);
    } else if (invitations) {
      // Filter client-side by email (case-insensitive) since RLS is uid-based
      initialInvitations = invitations.filter(
        inv => inv.invited_email.toLowerCase() === userEmailLower
      );
    }
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
