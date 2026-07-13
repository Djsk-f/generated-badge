/**
 * Page liste des participants d'un événement.
 * Affichage dynamique basé sur les FieldDefinitions.
 *
 * @module app/(dashboard)/events/[eventId]/participants/page
 */

import { createServerClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, Users, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { ParticipantsTable } from "@/components/participants/participants-table";
import { ParticipantsPageActions } from "@/components/participants/participants-page-actions";
import type { FieldDefinition, Participant } from "@/lib/types";

interface Props {
  params: Promise<{ eventId: string }>;
}

export default async function ParticipantsPage({ params }: Props) {
  const { eventId } = await params;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  let event: { id: string; name: string } | null = null;
  let participants: Array<{
    id: string;
    field_values: Record<string, string>;
  }> = [];
  let fieldDefs: FieldDefinition[] = [];

  try {
    const { data: eventData } = await supabase
      .from("events")
      .select("id, name")
      .eq("id", eventId)
      .eq("user_id", user.id)
      .single();

    event = eventData;

    if (event) {
      const [pResult, fResult] = await Promise.all([
        supabase
          .from("participants")
          .select("id, field_values")
          .eq("event_id", eventId)
          .order("created_at", { ascending: true }),
        supabase
          .from("field_definitions")
          .select("*")
          .eq("event_id", eventId)
          .order("order", { ascending: true }),
      ]);

      participants = pResult.data ?? [];
      fieldDefs = (fResult.data ?? []) as FieldDefinition[];
    }
  } catch (error) {
    // Tables pas encore créées — silencieux en production
    if (process.env.NODE_ENV === "development") {
      console.warn("[Participants] Failed to fetch data:", error);
    }
  }

  if (!event) notFound();

  // Colonnes à afficher : le champ display name en premier, puis les autres champs visibles
  const displayNameField = fieldDefs.find((f) => f.is_display_name);
  const otherVisibleFields = fieldDefs.filter(
    (f) => (f.visible_on_badge || f.visible_in_form) && !f.is_display_name
  );
  // Le champ display name + 3 autres colonnes max
  const visibleColumns = [
    ...(displayNameField ? [displayNameField] : []),
    ...otherVisibleFields,
  ].slice(0, 4);

  // Champs de type IMAGE pour l'import de photos
  const imageFields = fieldDefs.filter((f) => f.field_type === "IMAGE");

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Événements", href: "/events" },
          { label: event.name, href: `/events/${eventId}` },
          { label: "Participants" },
        ]}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/events/${eventId}`}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Participants</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {participants.length} participant(s)
            </p>
          </div>
        </div>
        <ParticipantsPageActions
          eventId={eventId}
          participants={participants as Participant[]}
          imageFields={imageFields}
        />
      </div>

      {participants.length > 0 ? (
        <ParticipantsTable
          participants={participants}
          visibleColumns={visibleColumns}
        />
      ) : (
        <Card padding="lg">
          <div className="text-center text-gray-500 py-12">
            <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun participant
            </h3>
            <p className="mb-4">
              Ajoutez un participant ou importez un fichier CSV/Excel.
            </p>
            <div className="flex justify-center gap-3">
              <Link href={`/events/${eventId}/participants/new`}>
                <Button variant="outline">
                  <UserPlus className="w-4 h-4" />
                  Ajouter un participant
                </Button>
              </Link>
              <Link href={`/events/${eventId}/participants/import`}>
                <Button>
                  <Upload className="w-4 h-4" />
                  Importer un fichier
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
