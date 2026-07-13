/**
 * Server Actions pour les participants.
 *
 * @module app/(dashboard)/events/[eventId]/participants/actions
 */

"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import type { ActionResponse, Participant } from "@/lib/types";

/**
 * Normalise une clé de colonne en clé JSONB propre.
 * "Nom complet" → "nom_complet", "Prénom" → "prenom"
 */
function normalizeKey(raw: string): string {
  return raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // supprimer accents
    .replace(/[^a-z0-9]+/g, "_")     // non-alphanum → underscore
    .replace(/^_|_$/g, "");           // trim underscores
}

/**
 * Ajoute un participant à un événement.
 */
export async function createParticipantAction(
  eventId: string,
  fieldValues: Record<string, string>
): Promise<ActionResponse<Participant>> {
  const supabase = await createServerClient();

  if (Object.keys(fieldValues).length === 0) {
    return { success: false, error: "Aucune donnée fournie" };
  }

  const { data, error } = await supabase
    .from("participants")
    .insert({ event_id: eventId, field_values: fieldValues })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/events/${eventId}/participants`);
  return { success: true, data: data as Participant };
}

/**
 * Importe des participants depuis des données parsées (CSV/Excel).
 *
 * Tout est stocké dans field_values JSONB.
 * columnMapping : { [excelColumn]: fieldDefinitionKey }
 */
export async function importParticipantsAction(
  eventId: string,
  participants: Record<string, string>[],
  columnMapping?: Record<string, string>
): Promise<ActionResponse<{ imported: number; errors: string[] }>> {
  const supabase = await createServerClient();
  const errors: string[] = [];
  let imported = 0;

  interface ParticipantInsert {
    event_id: string;
    field_values: Record<string, string>;
    metadata?: Record<string, string>;
  }

  const validParticipants: ParticipantInsert[] = [];

  for (let i = 0; i < participants.length; i++) {
    const row = participants[i];

    // Clean empty values
    const clean: Record<string, string> = {};
    for (const [key, value] of Object.entries(row)) {
      const v = String(value ?? "").trim();
      if (v) clean[key] = v;
    }

    const keys = Object.keys(clean);
    if (keys.length === 0) {
      errors.push(`Ligne ${i + 1}: aucune donnée`);
      continue;
    }

    if (columnMapping && Object.keys(columnMapping).length > 0) {
      // With mapping: map Excel columns → field keys → field_values
      const fieldValues: Record<string, string> = {};
      const metadata: Record<string, string> = {};

      for (const [col, fieldKey] of Object.entries(columnMapping)) {
        if (!fieldKey || !clean[col]) continue;
        fieldValues[fieldKey] = clean[col];
      }

      // Unmapped columns → metadata
      const mappedCols = new Set(
        Object.entries(columnMapping)
          .filter(([, v]) => v)
          .map(([k]) => k)
      );
      for (const [col, val] of Object.entries(clean)) {
        if (!mappedCols.has(col)) {
          metadata[col] = val;
        }
      }

      if (Object.keys(fieldValues).length === 0) {
        errors.push(`Ligne ${i + 1}: aucune donnée mappée`);
        continue;
      }

      const participant: ParticipantInsert = {
        event_id: eventId,
        field_values: fieldValues,
      };
      if (Object.keys(metadata).length > 0) participant.metadata = metadata;

      validParticipants.push(participant);
    } else {
      // Without mapping: normalize column names to clean keys
      const normalized: Record<string, string> = {};
      for (const [k, v] of Object.entries(clean)) {
        normalized[normalizeKey(k)] = v;
      }
      const participant: ParticipantInsert = {
        event_id: eventId,
        field_values: normalized,
      };
      validParticipants.push(participant);
    }
  }

  // Import par batches de 100
  const BATCH_SIZE = 100;
  for (let i = 0; i < validParticipants.length; i += BATCH_SIZE) {
    const batch = validParticipants.slice(i, i + BATCH_SIZE);
    const { data, error } = await supabase
      .from("participants")
      .insert(batch)
      .select();

    if (error) {
      console.error("[import] Batch error:", error.message, error.details, error.hint);
      errors.push(
        `Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`
      );
    } else {
      imported += data?.length ?? 0;
    }
  }

  revalidatePath(`/events/${eventId}/participants`);

  if (errors.length > 0 && imported === 0) {
    return { success: false, error: errors.join("; ") };
  }

  return { success: true, data: { imported, errors } };
}

/**
 * Supprime un participant.
 */
export async function deleteParticipantAction(
  participantId: string,
  eventId: string
): Promise<ActionResponse> {
  const supabase = await createServerClient();
  const { error } = await supabase
    .from("participants")
    .delete()
    .eq("id", participantId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/events/${eventId}/participants`);
  return { success: true, data: undefined };
}
