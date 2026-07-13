/**
 * Grille de templates avec actions.
 *
 * @module components/templates/templates-grid
 */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Edit, Trash2, Image, LayoutGrid, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Template } from "@/lib/types";

interface Props {
  templates: Template[];
}

export function TemplatesGrid({ templates }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (templateId: string) => {
    if (!confirm("Supprimer ce template ?")) return;
    setDeleting(templateId);

    const res = await fetch(`/api/templates?id=${templateId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.refresh();
    }
    setDeleting(null);
  };

  const handleDuplicate = async (template: Template) => {
    const res = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `${template.name} (copie)`,
        description: template.description,
        width_mm: template.width_mm,
        height_mm: template.height_mm,
        orientation: template.orientation,
      }),
    });

    if (res.ok) {
      const { data } = await res.json();
      // Copier les éléments
      await fetch("/api/templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: data.id,
          elements: template.elements,
        }),
      });
      router.refresh();
    }
  };

  if (templates.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <LayoutGrid className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          Aucun template
        </h3>
        <p className="text-sm text-gray-500 mb-4 max-w-sm">
          Créez votre premier template en important un fond d&apos;image
          (PNG/JPG) et en y plaçant des éléments dynamiques.
        </p>
        <Link href="/templates/new">
          <Button>
            <LayoutGrid className="w-4 h-4" />
            Créer un template
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {templates.map((template) => (
        <Card key={template.id} className="relative group">
          {/* Preview */}
          <div className="aspect-[85.6/53.98] bg-gray-100 rounded-lg overflow-hidden mb-3 relative">
            {template.background_url ? (
              <img
                src={template.background_url}
                alt={template.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Image className="w-8 h-8 text-gray-300" />
              </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Link href={`/templates/${template.id}`}>
                <Button size="sm" variant="secondary">
                  <Edit className="w-4 h-4" />
                  Éditer
                </Button>
              </Link>
            </div>
          </div>

          {/* Infos */}
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-gray-900 text-sm truncate">
                {template.name}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {template.width_mm} x {template.height_mm} mm —{" "}
                {template.elements.length} élément(s)
              </p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={() => handleDuplicate(template)}
                className="text-gray-400 hover:text-blue-500 transition-colors p-1"
                title="Dupliquer"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(template.id)}
                disabled={deleting === template.id}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
