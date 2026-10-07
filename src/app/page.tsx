import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LandingPage from "@/components/LandingPage";

export default async function Home() {
  const supabase = await createClient();
  try {
    const { data } = await supabase.auth.getUser();
    if (data?.user) redirect("/dashboard");
  } catch {
    // Session is invalid or token expired; proceed to landing page
  }
  return <LandingPage />;
}
