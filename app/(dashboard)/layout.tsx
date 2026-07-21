/**
 * Layout principal du dashboard (après authentification).
 *
 * Inclut la sidebar et le contenu principal.
 * Responsive : sidebar fixe sur desktop, overlay sur mobile.
 *
 * @module app/(dashboard)/layout
 */

import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";

export const metadata: Metadata = {
  title: "Dashboard - Event Badge Generator",
  description: "Générez des badges événementiels professionnels",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;
  try {
    const supabase = await createServerClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  } catch {
    // Supabase injoignable → rediriger vers la landing
  }

  if (!user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-subtle)" }}>
      <Sidebar userEmail={user.email} />
      <main id="main-content" className="lg:ml-64 p-4 pt-16 lg:p-8 lg:pt-8">{children}</main>
    </div>
  );
}
