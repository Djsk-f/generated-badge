/**
 * API Route pour les événements.
 *
 * GET  /api/events             → liste les événements de l'utilisateur
 * PUT  /api/events             → met à jour un événement
 *                               → auto-synchronise les FieldDefinitions si active_template_id change
 *
 * @module api/events
 */

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import type { TemplateElementType } from "@/lib/types";

// GET : Lister les événements de l'utilisateur
export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("events")
    .select("id, name")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ events: data });
}

// PUT : Mettre à jour un événement
export async function PUT(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "id requis" }, { status: 400 });
  }

  // Vérifier que l'événement appartient à l'utilisateur
  const { data: existing } = await supabase
    .from("events")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Événement non trouvé" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("events")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Auto-synchroniser les FieldDefinitions si le template a changé
  if (body.active_template_id !== undefined) {
    await syncFieldDefinitionsFromTemplate(supabase, id, body.active_template_id);
  }

  return NextResponse.json({ data });
}

// ─── Sync FieldDefinitions from Template ──────────────────────────

const ELEMENT_TO_FIELD_TYPE: Record<TemplateElementType, string> = {
  text: "TEXT",
  photo: "IMAGE",
  qr: "QRCODE",
  barcode: "BARCODE",
  logo: "IMAGE",
  rect: "TEXT",
  circle: "TEXT",
  line: "TEXT",
};

/**
 * Quand un template est assigné à un événement, on extrait les calques nommés
 * et on crée/met à jour les FieldDefinitions correspondantes.
 * Les calques sans `name` ou de type décoratif (rect, circle, line) sont ignorés.
 */
async function syncFieldDefinitionsFromTemplate(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  eventId: string,
  templateId: string | null
) {
  if (!templateId) {
    // Template retiré → supprimer les field definitions
    await supabase.from("field_definitions").delete().eq("event_id", eventId);
    return;
  }

  // Récupérer le template
  const { data: template } = await supabase
    .from("templates")
    .select("elements")
    .eq("id", templateId)
    .single();

  if (!template?.elements) return;

  // Extraire les calques nommés avec un champ de données
  const dataElements = (template.elements as Array<{
    id: string;
    type: TemplateElementType;
    name?: string;
    field?: string;
  }>).filter(
    (el) =>
      el.name &&
      el.name.trim() &&
      ["text", "photo", "qr", "barcode", "logo"].includes(el.type)
  );

  if (dataElements.length === 0) return;

  // Supprimer les anciennes field definitions
  await supabase.from("field_definitions").delete().eq("event_id", eventId);

  // Créer les nouvelles à partir des calques
  const fieldDefs = dataElements.map((el, index) => {
    const key = el.name!.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
    return {
      event_id: eventId,
      key,
      label: el.name!,
      field_type: ELEMENT_TO_FIELD_TYPE[el.type] ?? "TEXT",
      required: false,
      placeholder: null,
      default_value: null,
      options: [],
      validation: {},
      order: index,
      visible_on_badge: true,
      visible_in_form: true,
      is_display_name: index === 0, // Le premier calque nommé = nom d'affichage
    };
  });

  await supabase.from("field_definitions").insert(fieldDefs);
}
