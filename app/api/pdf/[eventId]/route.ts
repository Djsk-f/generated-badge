/**
 * API Route pour la génération de PDF de badges.
 * Génère le PDF directement depuis les participants + template, sans stockage BD.
 *
 * @module api/pdf/[eventId]
 */

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { generateBadgePdf } from "@/lib/services/pdf.service";
import { buildRenderContext } from "@/lib/templates/engine";
import type { Template, BadgeEvent, Participant } from "@/lib/types";

interface Params {
  params: Promise<{ eventId: string }>;
}

export async function GET(request: Request, { params }: Params) {
  const { eventId } = await params;
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Récupérer l'événement
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .eq("user_id", user.id)
    .single();

  if (!event) {
    return NextResponse.json({ error: "Événement non trouvé" }, { status: 404 });
  }

  // Récupérer le template actif
  let template: Template | null = null;

  if (event.active_template_id) {
    const { data } = await supabase
      .from("templates")
      .select("*")
      .eq("id", event.active_template_id)
      .single();
    template = data as Template | null;
  }

  // Fallback: premier template de l'utilisateur
  if (!template) {
    const { data } = await supabase
      .from("templates")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    template = data as Template | null;
  }

  if (!template) {
    return NextResponse.json(
      { error: "Aucun template trouvé. Créez un template d'abord." },
      { status: 404 }
    );
  }

  // Récupérer TOUS les participants de l'événement
  const { data: participants } = await supabase
    .from("participants")
    .select("id, field_values, metadata")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  if (!participants || participants.length === 0) {
    return NextResponse.json(
      { error: "Aucun participant. Importez des participants d'abord." },
      { status: 404 }
    );
  }

  // Construire les contextes de rendu pour chaque participant
  const badgeContexts = participants.map((p, i) => ({
    code: `BADGE-${String(i + 1).padStart(4, "0")}`,
    context: buildRenderContext({
      participant: p as unknown as Participant,
      event: event as unknown as BadgeEvent,
      badgeCode: `BADGE-${String(i + 1).padStart(4, "0")}`,
    }),
  }));

  try {
    const pdfBuffer = await generateBadgePdf(template, badgeContexts);

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="badges-${event.name.replace(/\s+/g, "-")}.pdf"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Erreur de génération: ${error instanceof Error ? error.message : "Inconnue"}` },
      { status: 500 }
    );
  }
}
