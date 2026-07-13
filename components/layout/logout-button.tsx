/**
 * Bouton de déconnexion (Client Component).
 *
 * @module components/layout/logout-button
 */

"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout}>
      <LogOut className="w-4 h-4" />
      Déconnexion
    </Button>
  );
}
