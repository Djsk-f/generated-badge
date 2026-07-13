/**
 * Service de gestion des templates (globaux, réutilisables).
 *
 * Les fonctions de lecture sont mises en cache via React `cache()`
 * pour n'être exécutées qu'une seule fois par requête.
 *
 * @module services/template
 */

import { cache } from "react";
import { createServerClient } from "@/lib/supabase/server";
import type { Template, TemplateElement, ActionResponse } from "@/lib/types";

// ─── CRUD ────────────────────────────────────────────────────────────

/**
 * Récupère tous les templates de l'utilisateur courant.
 * Mis en cache via React `cache()` pour une seule exécution par requête.
 */
export const getTemplatesByUser = cache(async (
  userId: string
): Promise<ActionResponse<Template[]>> => {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as Template[] };
});

/**
 * Récupère un template par son ID.
 * Mis en cache via React `cache()` pour une seule exécution par requête.
 */
export const getTemplateById = cache(async (
  templateId: string
): Promise<ActionResponse<Template>> => {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("id", templateId)
    .single();

  if (error) {
    return {
      success: false,
      error: error.code === "PGRST116" ? "Template non trouvé" : error.message,
    };
  }

  return { success: true, data: data as Template };
});

/**
 * Crée un template vide.
 */
export async function createTemplate(
  userId: string,
  input: {
    name: string;
    description?: string;
    width_mm?: number;
    height_mm?: number;
    orientation?: "landscape" | "portrait";
    bleed_mm?: number;
    safety_margin_mm?: number;
  }
): Promise<ActionResponse<Template>> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("templates")
    .insert({
      user_id: userId,
      name: input.name,
      description: input.description ?? null,
      width_mm: input.width_mm ?? 85.6,
      height_mm: input.height_mm ?? 53.98,
      orientation: input.orientation ?? "landscape",
      bleed_mm: input.bleed_mm ?? 0,
      safety_margin_mm: input.safety_margin_mm ?? 3,
      elements: [],
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as Template };
}

/**
 * Met à jour un template.
 */
export async function updateTemplate(
  templateId: string,
  input: {
    name?: string;
    description?: string;
    width_mm?: number;
    height_mm?: number;
    orientation?: "landscape" | "portrait";
    bleed_mm?: number;
    safety_margin_mm?: number;
    elements?: TemplateElement[];
    background_url?: string | null;
  }
): Promise<ActionResponse<Template>> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("templates")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", templateId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as Template };
}

/**
 * Supprime un template.
 */
export async function deleteTemplate(
  templateId: string
): Promise<ActionResponse> {
  const supabase = await createServerClient();

  // Supprimer le fond du storage
  const { data: template } = await supabase
    .from("templates")
    .select("background_url")
    .eq("id", templateId)
    .single();

  if (template?.background_url) {
    const bgPath = extractStoragePath(template.background_url);
    if (bgPath) {
      await supabase.storage.from("template-backgrounds").remove([bgPath]);
    }
  }

  const { error } = await supabase
    .from("templates")
    .delete()
    .eq("id", templateId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: undefined };
}

// ─── Fond d'image ─────────────────────────────────────────────────────

/**
 * Upload le fond d'image d'un template.
 */
export async function uploadTemplateBackground(
  templateId: string,
  file: Buffer | Blob | ArrayBuffer,
  contentType: string
): Promise<ActionResponse<string>> {
  const supabase = await createServerClient();

  const { data: template } = await supabase
    .from("templates")
    .select("user_id, background_url")
    .eq("id", templateId)
    .single();

  if (!template) {
    return { success: false, error: "Template non trouvé" };
  }

  // Supprimer l'ancien fond
  if (template.background_url) {
    const oldPath = extractStoragePath(template.background_url);
    if (oldPath) {
      await supabase.storage.from("template-backgrounds").remove([oldPath]);
    }
  }

  // Upload le nouveau
  const ext = contentType.split("/")[1] ?? "png";
  const path = `${template.user_id}/${templateId}/background.${ext}`;

  const { error } = await supabase.storage
    .from("template-backgrounds")
    .upload(path, file, { contentType, upsert: true });

  if (error) {
    return { success: false, error: error.message };
  }

  const { data: urlData } = supabase.storage
    .from("template-backgrounds")
    .getPublicUrl(path);

  await supabase
    .from("templates")
    .update({ background_url: urlData.publicUrl, updated_at: new Date().toISOString() })
    .eq("id", templateId);

  return { success: true, data: urlData.publicUrl };
}

// ─── Utilitaires ──────────────────────────────────────────────────────

function extractStoragePath(publicUrl: string): string | null {
  const marker = "/object/public/";
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  const afterMarker = publicUrl.slice(idx + marker.length);
  const slashIdx = afterMarker.indexOf("/");
  if (slashIdx === -1) return null;
  return afterMarker.slice(slashIdx + 1);
}
