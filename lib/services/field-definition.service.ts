/**
 * Service de gestion des FieldDefinitions.
 *
 * CRUD pour les définitions de champs d'un événement.
 * Chaque événement définit ses propres champs de données.
 *
 * Les fonctions de lecture sont mises en cache via React `cache()`
 * pour n'être exécutées qu'une seule fois par requête.
 *
 * @module services/field-definition
 */

import { cache } from "react";
import { createServerClient } from "@/lib/supabase/server";
import type { FieldDefinition, ActionResponse } from "@/lib/types";
import type {
  CreateFieldDefinitionInput,
  UpdateFieldDefinitionInput,
} from "@/lib/validators";

/**
 * Récupère toutes les field definitions d'un événement.
 * Mis en cache via React `cache()` pour une seule exécution par requête.
 */
export const getFieldDefinitions = cache(async (
  eventId: string
): Promise<ActionResponse<FieldDefinition[]>> => {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("field_definitions")
    .select("*")
    .eq("event_id", eventId)
    .order("order", { ascending: true });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as FieldDefinition[] };
});

/**
 * Récupère une field definition par son ID.
 */
export async function getFieldDefinitionById(
  id: string
): Promise<ActionResponse<FieldDefinition>> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("field_definitions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as FieldDefinition };
}

/**
 * Crée une nouvelle field definition.
 */
export async function createFieldDefinition(
  input: CreateFieldDefinitionInput
): Promise<ActionResponse<FieldDefinition>> {
  const supabase = await createServerClient();

  // Si ce champ est le display name, retirer le flag des autres
  if (input.is_display_name) {
    await supabase
      .from("field_definitions")
      .update({ is_display_name: false })
      .eq("event_id", input.event_id)
      .eq("is_display_name", true);
  }

  const { data, error } = await supabase
    .from("field_definitions")
    .insert({
      event_id: input.event_id,
      key: input.key,
      label: input.label,
      field_type: input.field_type,
      required: input.required,
      placeholder: input.placeholder || null,
      default_value: input.default_value || null,
      options: input.options,
      validation: input.validation,
      order: input.order,
      visible_on_badge: input.visible_on_badge,
      visible_in_form: input.visible_in_form,
      is_display_name: input.is_display_name,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as FieldDefinition };
}

/**
 * Met à jour une field definition existante.
 */
export async function updateFieldDefinition(
  input: UpdateFieldDefinitionInput
): Promise<ActionResponse<FieldDefinition>> {
  const supabase = await createServerClient();
  const { id, ...updates } = input;

  // Si ce champ devient le display name, retirer le flag des autres
  if (input.is_display_name) {
    const { data: existing } = await supabase
      .from("field_definitions")
      .select("event_id")
      .eq("id", id)
      .single();

    if (existing) {
      await supabase
        .from("field_definitions")
        .update({ is_display_name: false })
        .eq("event_id", existing.event_id)
        .eq("is_display_name", true)
        .neq("id", id);
    }
  }

  const { data, error } = await supabase
    .from("field_definitions")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as FieldDefinition };
}

/**
 * Supprime une field definition.
 */
export async function deleteFieldDefinition(
  id: string
): Promise<ActionResponse> {
  const supabase = await createServerClient();
  const { error } = await supabase
    .from("field_definitions")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: undefined };
}

/**
 * Réordonne plusieurs field definitions d'un coup.
 */
export async function reorderFieldDefinitions(
  eventId: string,
  orderedIds: string[]
): Promise<ActionResponse> {
  const supabase = await createServerClient();

  const updates = orderedIds.map((id, index) =>
    supabase
      .from("field_definitions")
      .update({ order: index })
      .eq("id", id)
      .eq("event_id", eventId)
  );

  const results = await Promise.all(updates);
  const errors = results.filter((r) => r.error);

  if (errors.length > 0) {
    return {
      success: false,
      error: `Erreur lors du réordonnancement: ${errors[0].error?.message}`,
    };
  }

  return { success: true, data: undefined };
}
