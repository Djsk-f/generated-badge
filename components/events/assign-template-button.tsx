/**
 * Bouton pour assigner un template à un événement.
 *
 * @module components/events/assign-template-button
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  eventId: string;
  currentTemplateId: string | null;
}

export function AssignTemplateButton({ eventId, currentTemplateId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleOpen = async () => {
    setOpen(true);
    if (templates.length === 0) {
      const res = await fetch("/api/templates");
      const data = await res.json();
      setTemplates(data.data ?? []);
    }
  };

  const handleAssign = async (templateId: string | null) => {
    setLoading(true);
    try {
      const res = await fetch("/api/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: eventId,
          active_template_id: templateId,
        }),
      });

      if (res.ok) {
        setOpen(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={handleOpen}>
        <LayoutGrid className="w-4 h-4" />
        {currentTemplateId ? "Changer" : "Assigner un template"}
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              Choisir un template
            </h3>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {templates.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Aucun template.{" "}
              <a href="/templates/new" className="text-indigo-600 hover:underline">
                Créer un template
              </a>
            </p>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => handleAssign(null)}
                disabled={loading}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                  !currentTemplateId
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="w-16 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                  <LayoutGrid className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Aucun template</p>
                  <p className="text-xs text-gray-500">Pas de badge visuel</p>
                </div>
                {!currentTemplateId && <Check className="w-4 h-4 text-indigo-600" />}
              </button>

              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleAssign(t.id)}
                  disabled={loading}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                    currentTemplateId === t.id
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="w-16 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    {t.background_url ? (
                      <img src={t.background_url} alt={t.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <LayoutGrid className="w-4 h-4 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{t.name}</p>
                    <p className="text-xs text-gray-500">
                      {t.width_mm} x {t.height_mm} mm
                    </p>
                  </div>
                  {currentTemplateId === t.id && <Check className="w-4 h-4 text-indigo-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
