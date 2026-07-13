/**
 * Service de gestion des badges.
 *
 * Gère la génération, les statuts, les pertes et les remplacements.
 *
 * @module services/badge
 */

import { createServerClient } from "@/lib/supabase/server";
import { generateBadgeCode } from "@/lib/utils/badge-code";
import type { Badge, BadgeStatus, ActionResponse } from "@/lib/types";
import type { PaginationOptions, PaginatedResult } from "./participant.service";

/**
 * Récupère les badges d'un événement avec pagination.
 */
export async function getBadgesByEvent(
  eventId: string,
  options: PaginationOptions = {}
): Promise<ActionResponse<PaginatedResult<Badge>>> {
  const { page = 1, pageSize = 50 } = options;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = await createServerClient();
  const { data, error, count } = await supabase
    .from("badges")
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
      data: data as Badge[],
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

/**
 * Récupère un badge par son ID.
 */
export async function getBadgeById(
  badgeId: string
): Promise<ActionResponse<Badge>> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("badges")
    .select("*")
    .eq("id", badgeId)
    .single();

  if (error) {
    return {
      success: false,
      error: error.code === "PGRST116" ? "Badge non trouvé" : error.message,
    };
  }

  return { success: true, data: data as Badge };
}

/**
 * Crée les badges NOT_READY pour une liste de participants.
 *
 * Appelé avant la génération PDF. Chaque participant reçoit
 * un badge avec un code unique et le statut NOT_READY.
 */
export async function createBadgesForParticipants(
  eventId: string,
  participantIds: string[],
  batchNumber: number
): Promise<ActionResponse<Badge[]>> {
  const supabase = await createServerClient();
  const badges: Badge[] = [];
  const errors: string[] = [];

  for (const participantId of participantIds) {
    try {
      const badgeCode = await generateBadgeCode(eventId, supabase);

      const { data, error } = await supabase
        .from("badges")
        .insert({
          event_id: eventId,
          participant_id: participantId,
          badge_code: badgeCode,
          batch_number: batchNumber,
          status: "NOT_READY" satisfies BadgeStatus,
        })
        .select()
        .single();

      if (error) {
        errors.push(`Participant ${participantId}: ${error.message}`);
      } else {
        badges.push(data as Badge);
      }
    } catch (err) {
      errors.push(
        `Participant ${participantId}: ${
          err instanceof Error ? err.message : "Erreur inconnue"
        }`
      );
    }
  }

  // Insérer l'historique pour chaque badge créé
  if (badges.length > 0) {
    const historyEntries = badges.map((b) => ({
      badge_id: b.id,
      event_id: eventId,
      action: "CREATED" as const,
      details: { batch_number: batchNumber },
    }));

    await supabase.from("badge_history").insert(historyEntries);
  }

  if (errors.length > 0 && badges.length === 0) {
    return { success: false, error: errors.join("; ") };
  }

  return { success: true, data: badges };
}

/**
 * Met à jour le statut d'un badge.
 */
export async function updateBadgeStatus(
  badgeId: string,
  status: BadgeStatus,
  pdfUrl?: string
): Promise<ActionResponse<Badge>> {
  const supabase = await createServerClient();
  const updateData: Record<string, unknown> = { status };

  if (pdfUrl) {
    updateData.pdf_url = pdfUrl;
  }
  if (status === "GENERATED") {
    updateData.generated_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("badges")
    .update(updateData)
    .eq("id", badgeId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as Badge };
}

/**
 * Signale la perte d'un badge et crée un remplacement.
 *
 * L'original passe en LOST, un nouveau badge est créé avec le statut READY.
 */
export async function reportBadgeLoss(
  badgeId: string,
  reason?: string
): Promise<ActionResponse<{ original: Badge; replacement: Badge }>> {
  const supabase = await createServerClient();

  // 1. Récupérer le badge original
  const { data: original, error: fetchError } = await supabase
    .from("badges")
    .select("*")
    .eq("id", badgeId)
    .single();

  if (fetchError || !original) {
    return { success: false, error: "Badge non trouvé" };
  }

  // 2. Marquer comme LOST
  const { error: lostError } = await supabase
    .from("badges")
    .update({ status: "LOST" satisfies BadgeStatus })
    .eq("id", badgeId);

  if (lostError) {
    return { success: false, error: lostError.message };
  }

  // 3. Créer le badge de remplacement
  const newCode = await generateBadgeCode(original.event_id, supabase);
  const { data: replacement, error: replaceError } = await supabase
    .from("badges")
    .insert({
      event_id: original.event_id,
      participant_id: original.participant_id,
      badge_code: newCode,
      batch_number: original.batch_number,
      status: "READY" satisfies BadgeStatus,
    })
    .select()
    .single();

  if (replaceError) {
    return { success: false, error: replaceError.message };
  }

  // 4. Logger dans l'historique
  await supabase.from("badge_history").insert([
    {
      badge_id: badgeId,
      event_id: original.event_id,
      action: "LOST" as const,
      details: { reason: reason || "Non spécifié" },
    },
    {
      badge_id: replacement.id,
      event_id: original.event_id,
      action: "REPLACED" as const,
      details: { original_badge_id: badgeId, original_code: original.badge_code },
    },
  ]);

  // 5. Mettre à jour l'ancien badge
  await supabase
    .from("badges")
    .update({ status: "REPLACED" satisfies BadgeStatus })
    .eq("id", badgeId);

  return {
    success: true,
    data: {
      original: { ...original, status: "REPLACED" } as Badge,
      replacement: replacement as Badge,
    },
  };
}

/**
 * Récupère le prochain numéro de batch pour un événement.
 */
export async function getNextBatchNumber(
  eventId: string
): Promise<ActionResponse<number>> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("badges")
    .select("batch_number")
    .eq("event_id", eventId)
    .order("batch_number", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    return { success: false, error: error.message };
  }

  return { success: true, data: (data?.batch_number ?? 0) + 1 };
}
