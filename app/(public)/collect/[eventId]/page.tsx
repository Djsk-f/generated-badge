/**
 * Page publique de collecte de données participants.
 * Accessible sans authentification.
 *
 * @module app/(public)/collect/[eventId]/page
 */

import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { CollectForm } from "@/components/collect/collect-form";
import type { FieldDefinition } from "@/lib/types";

interface Props {
  params: Promise<{ eventId: string }>;
}

export default async function CollectPage({ params }: Props) {
  const { eventId } = await params;
  const supabase = await createServerClient();

  const { data: event } = await supabase
    .from("events")
    .select("id, name, description, location, start_date, end_date")
    .eq("id", eventId)
    .single();

  if (!event) notFound();

  const { data: fieldDefs } = await supabase
    .from("field_definitions")
    .select("*")
    .eq("event_id", eventId)
    .order("order", { ascending: true });

  const fields = (fieldDefs ?? []) as FieldDefinition[];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white mb-4">
            <BadgeCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
          {event.location && (
            <p className="text-gray-500 mt-1">{event.location}</p>
          )}
          {event.start_date && (
            <p className="text-sm text-gray-400 mt-1">
              {new Date(event.start_date).toLocaleDateString("fr-FR")}
              {event.end_date &&
                ` → ${new Date(event.end_date).toLocaleDateString("fr-FR")}`}
            </p>
          )}
          {event.description && (
            <p className="text-gray-600 mt-3 max-w-md mx-auto">
              {event.description}
            </p>
          )}
        </div>

        {/* Formulaire */}
        <CollectForm eventId={event.id} fieldDefinitions={fields} />

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-8">
          BadgeGen — Génération de badges
        </p>
      </div>
    </div>
  );
}
