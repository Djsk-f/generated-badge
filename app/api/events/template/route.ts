/**
 * API Route pour récupérer le template actif d'un événement.
 *
 * @module api/events/template
 */

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("event_id");

  if (!eventId) {
    return NextResponse.json({ error: "event_id requis" }, { status: 400 });
  }

  // Récupérer l'événement
  const { data: event } = await supabase
    .from("events")
    .select("id, active_template_id")
    .eq("id", eventId)
    .eq("user_id", user.id)
    .single();

  if (!event) {
    return NextResponse.json({ error: "Événement non trouvé" }, { status: 404 });
  }

  if (!event.active_template_id) {
    return NextResponse.json({ template: null });
  }

  // Récupérer le template
  const { data: template } = await supabase
    .from("templates")
    .select("*")
    .eq("id", event.active_template_id)
    .single();

  return NextResponse.json({ template });
}
