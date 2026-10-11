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

  // Also check if user is an accepted invited member on other boards
  if (user && userEmailLower) {
    const { data: memberInvites } = await supabase
      .from("board_invitations")
      .select("board_id")
      .eq("status", "accepted")
      .ilike("invited_email", userEmailLower);

    if (memberInvites && memberInvites.length > 0) {
      const invitedBoardIds = new Set(memberInvites.map(m => m.board_id));
      const additionalBoards = (rawBoards ?? []).filter(b => invitedBoardIds.has(b.id) && !userBoards.some(ub => ub.id === b.id));
      userBoards = [...userBoards, ...additionalBoards];
    }
  }

  const boardIds = userBoards.map(b => b.id);

  // Fetch cards and columns ONLY for user's boards
  let cards: any[] = [];
  let columns: any[] = [];

  if (boardIds.length > 0) {
    const { data: cData } = await supabase
      .from("cards")
      .select("id, title, column_id, position, created_at, board_id")
      .in("board_id", boardIds);
    cards = cData ?? [];

    const { data: colData } = await supabase
      .from("board_columns")
      .select("id, name, board_id, position")
      .in("board_id", boardIds);
    columns = colData ?? [];
  }

  const { data: recentComments } = await supabase
    .from("board_post_comments")
    .select("id, content, created_at, author_email, post_id")
    .order("created_at", { ascending: false })
    .limit(6);

  // Fetch accepted members for user's boards
  let teamMembers: any[] = [];
  if (boardIds.length > 0) {
    const { data: acceptedInv } = await supabase
      .from("board_invitations")
      .select("id, board_id, invited_email, role")
      .in("board_id", boardIds)
      .eq("status", "accepted");
    teamMembers = acceptedInv ?? [];
  }

  // Fetch post titles to associate with recentComments
  let postTitlesMap: Record<string, string> = {};
  if (recentComments && recentComments.length > 0) {
    const postIds = Array.from(new Set(recentComments.map(c => c.post_id).filter(Boolean)));
    if (postIds.length > 0) {
      const { data: posts } = await supabase
        .from("board_posts")
        .select("id, title")
        .in("id", postIds);
      if (posts) {
        posts.forEach(p => {
          postTitlesMap[p.id] = p.title;
        });
      }
    }
  }

  const enrichedRecentComments = (recentComments ?? []).map(c => ({
    ...c,
    on: postTitlesMap[c.post_id] || "Papan Diskusi",
  }));

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
      recentComments={enrichedRecentComments}
      teamMembers={teamMembers}
    />
  );
}
