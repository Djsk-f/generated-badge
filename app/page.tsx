import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LandingHero } from "@/components/landing/landing-hero";

export default async function LandingPage() {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      redirect("/dashboard");
    }
  } catch {
    // Supabase injoignable → afficher la landing page (non connecté)
  }

  return (
    <div className="min-h-screen bg-white">
      <LandingHero />
    </div>
  );
}
