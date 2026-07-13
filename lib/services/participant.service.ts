/**
 * Service de gestion des participants.
 *
 * CRUD + import massif + collecte publique.
 *
 * @module services/participant
 */

import { createServerClient } from "@/lib/supabase/server";
import type { Participant, ActionResponse } from "@/lib/types";
import type { CreateParticipantInput } from "@/lib/validators";

/** Options de pagination */
export interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

/** Résultat paginé */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Récupère les participants d'un événement avec pagination.
 */
export async function getParticipantsByEvent(
  eventId: string,
  options: PaginationOptions = {}
): Promise<ActionResponse<PaginatedResult<Participant>>> {
  const { page = 1, pageSize = 50 } = options;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = await createServerClient();
  const { data, error, count } = await supabase
    .from("participants")
    .select("*", { count: "exact" })
    .eq("event_id", eventId)
    .order("created_at", { ascending: true })
    .range(from, to);

  if (error) {
    return { success: false, error: error.message };
  }

  const total = count ?? 0;
  return {
    success: true,
    data: {
      data: data as Participant[],
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

/**
 * Récupère un participant par son ID.
 */
export async function getParticipantById(
  participantId: string
): Promise<ActionResponse<Participant>> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("participants")
    .select("*")
    .eq("id", participantId)
    .single();

  if (error) {
    return {
      success: false,
      error: error.code === "PGRST116" ? "Participant non trouvé" : error.message,
    };
  }

  return { success: true, data: data as Participant };
}

/**
 * Ajoute un participant à un événement.
 */
export async function createParticipant(
  eventId: string,
  input: CreateParticipantInput
): Promise<ActionResponse<Participant>> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("participants")
    .insert({
      event_id: eventId,
      ...input,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as Participant };
}

/**
 * Importe plusieurs participants en une seule opération.
 *
 * @param eventId - ID de l'événement
 * @param participants - Tableau de participants à importer
 * @returns Nombre de participants importés et erreurs
 */
export async function importParticipants(
  eventId: string,
  participants: CreateParticipantInput[]
): Promise<ActionResponse<{ imported: number; errors: string[] }>> {
  const supabase = await createServerClient();
  const errors: string[] = [];
  let imported = 0;

  // Import par batches de 100 pour éviter les timeouts
  const BATCH_SIZE = 100;
  for (let i = 0; i < participants.length; i += BATCH_SIZE) {
    const batch = participants.slice(i, i + BATCH_SIZE).map((p) => ({
      event_id: eventId,
      ...p,
    }));

    const { data, error } = await supabase
      .from("participants")
      .insert(batch)
      .select();

    if (error) {
      errors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`);
    } else {
      imported += data?.length ?? 0;
    }
  }

  if (errors.length > 0 && imported === 0) {
    return { success: false, error: errors.join("; ") };
  }

  return {
    success: true,
    data: { imported, errors },
  };
}

/**
 * Met à jour un participant.
 */
export async function updateParticipant(
  participantId: string,
  input: Partial<CreateParticipantInput>
): Promise<ActionResponse<Participant>> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("participants")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", participantId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as Participant };
}

/**
 * Supprime un participant.
 */
export async function deleteParticipant(
  participantId: string
): Promise<ActionResponse> {
  const supabase = await createServerClient();
  const { error } = await supabase
    .from("participants")
    .delete()
    .eq("id", participantId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: undefined };
}

/**
 * Supprime plusieurs participants d'un événement.
 */
export async function deleteParticipants(
  participantIds: string[]
): Promise<ActionResponse> {
  const supabase = await createServerClient();
  const { error } = await supabase
    .from("participants")
    .delete()
    .in("id", participantIds);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: undefined };
}
