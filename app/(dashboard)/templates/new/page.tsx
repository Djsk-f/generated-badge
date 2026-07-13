/**
 * Page de création d'un template global.
 *
 * @module app/(dashboard)/templates/new/page
 */

import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TemplateCreateForm } from "@/components/templates/template-create-form";

export default async function NewTemplatePage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Link
        href="/templates"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à la bibliothèque
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Nouveau template
        </h1>
        <p className="text-gray-500 mt-1">
          Importez un fond d&apos;image et configurez les éléments dynamiques.
          Ce template sera réutilisable dans tous vos événements.
        </p>
      </div>

      <TemplateCreateForm />
    </div>
  );
}
