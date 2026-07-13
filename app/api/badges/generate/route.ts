/**
 * API Route pour générer les badges d'un événement.
 *
 * @module api/badges/generate
 */

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

function generateBadgeCode(eventName: string, index: number): string {
  const prefix = eventName
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 3)
    .toUpperCase();
  const num = String(index).padStart(4, "0");
  return `${prefix}-${num}`;
}

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const eventId = body.event_id as string;

  if (!eventId) {
    return NextResponse.json({ error: "event_id requis" }, { status: 400 });
  }

  // Vérifier l'événement
  const { data: event } = await supabase
    .from("events")
    .select("id, name, active_template_id")
    .eq("id", eventId)
    .eq("user_id", user.id)
    .single();

  if (!event) {
    return NextResponse.json({ error: "Événement non trouvé" }, { status: 404 });
  }

  if (!event.active_template_id) {
    return NextResponse.json(
      { error: "Assignez un template avant de générer les badges" },
      { status: 400 }
    );
  }

  // Récupérer tous les participants
  const { data: participants } = await supabase
    .from("participants")
    .select("id")
    .eq("event_id", eventId);

  if (!participants || participants.length === 0) {
    return NextResponse.json(
      { error: "Aucun participant à traiter" },
      { status: 400 }
    );
  }

  // Récupérer les badges existants
  const { data: existingBadges } = await supabase
    .from("badges")
    .select("participant_id")
    .eq("event_id", eventId);

  const existingIds = new Set(
    (existingBadges ?? []).map((b) => b.participant_id)
  );

  // Filtrer les participants sans badge
  const toCreate = participants.filter((p) => !existingIds.has(p.id));

  if (toCreate.length === 0) {
    return NextResponse.json({
      message: "Tous les participants ont déjà un badge",
      created: 0,
    });
  }

  // Générer les badges
  const badgesToInsert = toCreate.map((p, i) => ({
    event_id: eventId,
    participant_id: p.id,
    badge_code: generateBadgeCode(event.name, existingBadges!.length + i + 1),
    status: "GENERATED" as const,
  }));

  const { data, error } = await supabase
    .from("badges")
    .insert(badgesToInsert)
    .select("id");

  if (error) {
    return NextResponse.json(
      { error: `Erreur de création: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: `${data.length} badge(s) généré(s)`,
    created: data.length,
  });
}
