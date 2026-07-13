/**
 * API Route pour la gestion des templates (globaux).
 *
 * @module api/templates
 */

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { z } from "zod";

// ─── Validation Schemas ────────────────────────────────────────────

const createTemplateSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(100),
  description: z.string().max(500).optional(),
  width_mm: z.number().min(30).max(300).optional(),
  height_mm: z.number().min(30).max(300).optional(),
  orientation: z.enum(["landscape", "portrait"]).optional(),
});

const updateTemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  width_mm: z.number().min(30).max(300).optional(),
  height_mm: z.number().min(30).max(300).optional(),
  orientation: z.enum(["landscape", "portrait"]).optional(),
  elements: z.array(z.unknown()).optional(),
  background_url: z.string().optional().nullable(),
});

// ─── GET ────────────────────────────────────────────────────────────

// GET : Récupérer les templates de l'utilisateur
export async function GET(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// ─── POST ───────────────────────────────────────────────────────────

// POST : Créer un template
export async function POST(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createTemplateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("templates")
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      width_mm: parsed.data.width_mm ?? 85.6,
      height_mm: parsed.data.height_mm ?? 53.98,
      orientation: parsed.data.orientation ?? "landscape",
      elements: [],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// PUT : Mettre à jour un template
export async function PUT(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateTemplateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { id, ...updates } = parsed.data;

  // Vérifier que le template appartient à l'utilisateur
  const { data: existing } = await supabase
    .from("templates")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Template non trouvé" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("templates")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// DELETE : Supprimer un template
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

  // Vérifier propriété
  const { data: existing } = await supabase
    .from("templates")
    .select("id, background_url")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Template non trouvé" }, { status: 404 });
  }

  // Supprimer le fond
  if (existing.background_url) {
    const marker = "/object/public/";
    const idx = existing.background_url.indexOf(marker);
    if (idx !== -1) {
      const afterMarker = existing.background_url.slice(idx + marker.length);
      const slashIdx = afterMarker.indexOf("/");
      if (slashIdx !== -1) {
        const bgPath = afterMarker.slice(slashIdx + 1);
        await supabase.storage.from("template-backgrounds").remove([bgPath]);
      }
    }
  }

  const { error } = await supabase.from("templates").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
