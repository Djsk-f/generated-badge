/**
 * Page bibliothèque de templates (globaux, réutilisables).
 *
 * @module app/(dashboard)/templates/page
 */

import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TemplatesGrid } from "@/components/templates/templates-grid";

export default async function TemplatesLibraryPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: templates } = await supabase
    .from("templates")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
          <p className="text-gray-500 mt-1">
            Vos templates de badges — réutilisables entre événements
          </p>
        </div>
        <Link href="/templates/new">
          <Button>
            <Plus className="w-4 h-4" />
            Nouveau template
          </Button>
        </Link>
      </div>

      <TemplatesGrid templates={(templates as any[]) ?? []} />
    </div>
  );
}
