/**
 * API Route pour les FieldDefinitions.
 *
 * GET  /api/field-definitions?event_id=xxx      → liste les champs d'un événement
 * GET  /api/field-definitions?user_all=true      → tous les champs de tous les événements
 * POST /api/field-definitions                    → crée un champ
 * PUT  /api/field-definitions                    → met à jour un champ
 * DELETE /api/field-definitions?id=xxx            → supprime un champ
 *
 * @module api/field-definitions
 */

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import type { FieldDefinition } from "@/lib/types";
import {
  getFieldDefinitions,
  createFieldDefinition,
  updateFieldDefinition,
  deleteFieldDefinition,
} from "@/lib/services/field-definition.service";
import { createFieldDefinitionSchema, updateFieldDefinitionSchema } from "@/lib/validators";

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
  const userAll = searchParams.get("user_all") === "true";

  // Mode batch : tous les champs de tous les événements de l'utilisateur
  if (userAll) {
    // Récupérer les IDs des événements de l'utilisateur
    const { data: events } = await supabase
      .from("events")
      .select("id")
      .eq("user_id", user.id);

    if (!events?.length) {
      return NextResponse.json({ fieldDefinitions: [] });
    }

    const eventIds = events.map((e) => e.id);
    const { data, error } = await supabase
      .from("field_definitions")
      .select("*")
      .in("event_id", eventIds)
      .order("order", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ fieldDefinitions: (data ?? []) as FieldDefinition[] });
  }

  if (!eventId) {
    return NextResponse.json({ error: "event_id requis" }, { status: 400 });
  }

  // Vérifier l'accès à l'événement
  const { data: event } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("user_id", user.id)
    .single();

  if (!event) {
    return NextResponse.json({ error: "Événement non trouvé" }, { status: 404 });
  }

  const result = await getFieldDefinitions(eventId);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ fieldDefinitions: result.data });
}

/**
 * POST avec action=seed : insère les field definitions par défaut pour un événement.
 * POST /api/field-definitions { "action": "seed", "event_id": "xxx", "fields": [...] }
 */
export async function POST(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();

  // Action: seed — insère les field definitions par défaut pour un événement
  if (body.action === "seed" && body.event_id) {
    const { data: event } = await supabase
      .from("events")
      .select("id")
      .eq("id", body.event_id)
      .eq("user_id", user.id)
      .single();

    if (!event) {
      return NextResponse.json({ error: "Événement non trouvé" }, { status: 404 });
    }

    const defaultFields = body.fields ?? [
      { key: "nom", label: "Nom", field_type: "TEXT", order: 0, is_display_name: true },
      { key: "photo", label: "Photo", field_type: "IMAGE", order: 1, visible_in_form: false },
      { key: "circonscription", label: "Circonscription", field_type: "TEXT", order: 2 },
      { key: "ville", label: "Ville", field_type: "TEXT", order: 3 },
    ];

    const inserts = defaultFields.map((f: Record<string, unknown>) => ({
      event_id: body.event_id,
      key: f.key,
      label: f.label,
      field_type: f.field_type ?? "TEXT",
      required: false,
      placeholder: null,
      default_value: null,
      options: [],
      validation: {},
      order: f.order ?? 0,
      visible_on_badge: true,
      visible_in_form: f.visible_in_form !== false,
      is_display_name: f.is_display_name === true,
    }));

    const { data, error } = await supabase
      .from("field_definitions")
      .insert(inserts)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ fieldDefinitions: data, count: data?.length ?? 0 }, { status: 201 });
  }

  const parsed = createFieldDefinitionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // Vérifier l'accès à l'événement
  const { data: event } = await supabase
    .from("events")
    .select("id")
    .eq("id", parsed.data.event_id)
    .eq("user_id", user.id)
    .single();

  if (!event) {
    return NextResponse.json({ error: "Événement non trouvé" }, { status: 404 });
  }

  const result = await createFieldDefinition(parsed.data);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ fieldDefinition: result.data }, { status: 201 });
}

export async function PUT(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateFieldDefinitionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // Vérifier l'accès via la field definition
  const { data: existing } = await supabase
    .from("field_definitions")
    .select("id, event_id")
    .eq("id", parsed.data.id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Champ non trouvé" }, { status: 404 });
  }

  const { data: event } = await supabase
    .from("events")
    .select("id")
    .eq("id", existing.event_id)
    .eq("user_id", user.id)
    .single();

  if (!event) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const result = await updateFieldDefinition(parsed.data);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ fieldDefinition: result.data });
}

export async function DELETE(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id requis" }, { status: 400 });
  }

  // Vérifier l'accès
  const { data: existing } = await supabase
    .from("field_definitions")
    .select("id, event_id")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Champ non trouvé" }, { status: 404 });
  }

  const { data: event } = await supabase
    .from("events")
    .select("id")
    .eq("id", existing.event_id)
    .eq("user_id", user.id)
    .single();

  if (!event) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const result = await deleteFieldDefinition(id);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
