import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not logged in" });
  }

  const { data: invitations, error } = await supabase
    .from("board_invitations")
    .select("*");

  return NextResponse.json({
    userEmail: user.email,
    userId: user.id,
    invitationsCount: invitations ? invitations.length : 0,
    allInvitations: invitations || [],
    error: error ? error.message : null
  });
}
