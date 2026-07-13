/**
 * Page d'édition d'un template global.
 *
 * @module app/(dashboard)/templates/[templateId]/page
 */

import { createServerClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TemplateEditor } from "@/components/templates/template-editor";

interface Props {
  params: Promise<{ templateId: string }>;
}

export default async function TemplateEditorPage({ params }: Props) {
  const { templateId } = await params;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: template } = await supabase
    .from("templates")
    .select("*")
    .eq("id", templateId)
    .eq("user_id", user.id)
    .single();

  if (!template) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/templates"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à la bibliothèque
      </Link>

      <TemplateEditor template={template as any} />
    </div>
  );
}
