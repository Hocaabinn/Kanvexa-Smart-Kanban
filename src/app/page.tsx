import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import LandingPage from "@/components/LandingPage";

export default async function Home() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  // If user has ever created/logged into an account on this browser,
  // or has any Supabase auth cookies (even if expired):
  const hasAccountCookie = cookieStore.has("kanvexa_has_account");
  const hasAuthCookies = allCookies.some((c) => c.name.startsWith("sb-"));

  const supabase = await createClient();
  try {
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      redirect("/dashboard");
    }
  } catch {
    // Session is invalid or token expired
  }

  // If user previously had an account, redirect directly to /login
  if (hasAccountCookie || hasAuthCookies) {
    redirect("/login");
  }

  // First time visitor without an account -> show landing page
  return <LandingPage />;
}

