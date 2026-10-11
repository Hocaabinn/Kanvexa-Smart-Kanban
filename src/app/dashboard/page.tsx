import { createClient } from "@/lib/supabase/server";
import { createBoard } from "./actions";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: rawBoards } = await supabase
    .from("boards")
    .select("id, name, created_at, owner_email, created_by")
    .order("created_at", { ascending: false });

  // Get boards that belong to current user
  let userEmailLower = user?.email?.toLowerCase() || "";
  let userBoards = (rawBoards ?? []).filter(b => {
    if (!user) return true;
    if (b.created_by && b.created_by === user.id) return true;
    if (b.owner_email && b.owner_email.toLowerCase() === userEmailLower) return true;
    return false;
  });

  // Fetch cards, posts, and comments to calculate accurate dashboard metrics
  const { data: cards } = await supabase
    .from("cards")
    .select("id, title, column_id, position, created_at, board_id");

  const { data: columns } = await supabase
    .from("board_columns")
    .select("id, name, board_id");

  const { data: recentComments } = await supabase
    .from("board_post_comments")
    .select("id, content, created_at, author_email, post_id")
    .order("created_at", { ascending: false })
    .limit(6);

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
      initialBoards={userBoards}
      initialInvitations={initialInvitations}
      createBoardAction={createBoard}
      cards={cards ?? []}
      columns={columns ?? []}
      recentComments={recentComments ?? []}
    />
  );
}
