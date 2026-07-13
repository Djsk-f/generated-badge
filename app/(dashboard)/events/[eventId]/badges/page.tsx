/**
 * Page des badges d'un événement — liste, génération, téléchargement.
 *
 * @module app/(dashboard)/events/[eventId]/badges/page
 */

import { createServerClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  BadgeCheck,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { BadgeStatusIndicator } from "@/components/ui/badge-status";
import { BadgeGenerateButton } from "@/components/events/badge-generate-button";
import { BadgesList } from "@/components/badges/badges-list";

interface Props {
  params: Promise<{ eventId: string }>;
}

export default async function BadgesPage({ params }: Props) {
  const { eventId } = await params;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: event } = await supabase
    .from("events")
    .select("id, name, active_template_id")
    .eq("id", eventId)
    .eq("user_id", user.id)
    .single();

  if (!event) notFound();

  // Récupérer le template actif
  let templateName: string | null = null;
  if (event.active_template_id) {
    const { data } = await supabase
      .from("templates")
      .select("name")
      .eq("id", event.active_template_id)
      .single();
    templateName = data?.name ?? null;
  }

  // Récupérer le champ d'affichage principal
  const { data: displayField } = await supabase
    .from("field_definitions")
    .select("key")
    .eq("event_id", eventId)
    .eq("is_display_name", true)
    .single();

  const displayNameKey = displayField?.key ?? null;

  // Récupérer participants + badges
  const { data: rawParticipants } = await supabase
    .from("participants")
    .select("id, field_values")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  const participants = (rawParticipants ?? []).map((p) => ({
    id: p.id,
    field_values: (p.field_values ?? {}) as Record<string, string>,
  }));

  const { data: badges } = await supabase
    .from("badges")
    .select("participant_id, badge_code, status")
    .eq("event_id", eventId);

  const badgeMap = new Map(
    (badges ?? []).map((b) => [b.participant_id, b])
  );

  // Helper pour afficher le nom d'un participant
  const getDisplayName = (fv: Record<string, string>) => {
    if (displayNameKey && fv[displayNameKey]) return fv[displayNameKey];
    // Fallback : première valeur non vide
    return Object.values(fv).find((v) => v) ?? "";
  };

  const stats = {
    total: participants?.length ?? 0,
    generated: badges?.filter((b) => b.status === "GENERATED").length ?? 0,
    printed: badges?.filter((b) => b.status === "PRINTED").length ?? 0,
    lost: badges?.filter((b) => b.status === "LOST").length ?? 0,
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Événements", href: "/events" },
          { label: event.name, href: `/events/${eventId}` },
          { label: "Badges" },
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
            <h1 className="text-2xl font-bold text-gray-900">
              Badges — {event.name}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {templateName
                ? `Template: ${templateName}`
                : "Aucun template assigné"}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <BadgeGenerateButton
            eventId={eventId}
            disabled={!event.active_template_id}
          />
          {stats.generated > 0 && (
            <a href={`/api/pdf/${eventId}`} download>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Télécharger PDF
              </Button>
            </a>
          )}
        </div>
      </div>

      {!event.active_template_id && (
        <Card className="p-4 border-amber-200 bg-amber-50">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <p className="text-sm text-amber-800">
              Assignez un template avant de générer des badges.
              <Link
                href={`/events/${eventId}`}
                className="ml-2 underline font-medium"
              >
                Aller à l&apos;événement
              </Link>
            </p>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Participants", value: stats.total, color: "text-gray-900" },
          { label: "Générés", value: stats.generated, color: "text-green-600" },
          { label: "Imprimés", value: stats.printed, color: "text-indigo-600" },
          { label: "Perdus", value: stats.lost, color: "text-red-600" },
        ].map((s) => (
          <Card key={s.label} className="text-center py-3">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Liste des participants */}
      {!participants || participants.length === 0 ? (
        <Card padding="lg">
          <div className="text-center text-gray-400 py-8">
            <p>Aucun participant.</p>
            <div className="flex justify-center gap-3 mt-3">
              <Link
                href={`/events/${eventId}/participants/new`}
                className="text-indigo-600 hover:underline text-sm"
              >
                Ajouter un participant
              </Link>
              <span className="text-gray-300">ou</span>
              <Link
                href={`/events/${eventId}/participants/import`}
                className="text-indigo-600 hover:underline text-sm"
              >
                Importer un fichier
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        <BadgesList
          participants={participants}
          badges={badges ?? []}
          displayNameKey={displayNameKey}
        />
      )}
    </div>
  );
}
