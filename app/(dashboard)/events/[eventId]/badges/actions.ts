/**
 * Server Actions pour la génération de badges.
 *
 * @module app/(dashboard)/events/[eventId]/badges/actions
 */

"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { generateBadgeCode } from "@/lib/utils/badge-code";
import type { ActionResponse, Badge, BadgeStatus } from "@/lib/types";

/**
 * Crée les badges NOT_READY pour les participants sélectionnés.
 */
export async function createBadgesAction(
  eventId: string,
  participantIds: string[],
  batchNumber: number
): Promise<ActionResponse<Badge[]>> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  // Vérifier que l'événement appartient à l'utilisateur
  const { data: event } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("user_id", user.id)
    .single();

  if (!event) {
    return { success: false, error: "Événement non trouvé" };
  }

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
          status: "READY" satisfies BadgeStatus,
        })
        .select()
        .single();

      if (error) {
        errors.push(`Erreur: ${error.message}`);
      } else {
        badges.push(data as Badge);
      }
    } catch (err) {
      errors.push(err instanceof Error ? err.message : "Erreur inconnue");
    }
  }

  // Historique
  if (badges.length > 0) {
    await supabase.from("badge_history").insert(
      badges.map((b) => ({
        badge_id: b.id,
        event_id: eventId,
        action: "CREATED" as const,
        details: { batch_number: batchNumber },
      }))
    );
  }

  revalidatePath(`/events/${eventId}/badges`);

  if (errors.length > 0 && badges.length === 0) {
    return { success: false, error: errors.join("; ") };
  }

  return { success: true, data: badges };
}

/**
 * Met à jour le statut d'un badge (génération, perte, etc.).
 */
export async function updateBadgeStatusAction(
  badgeId: string,
  status: BadgeStatus,
  eventId: string
): Promise<ActionResponse> {
  const supabase = await createServerClient();
  const { error } = await supabase
    .from("badges")
    .update({
      status,
      ...(status === "GENERATED" ? { generated_at: new Date().toISOString() } : {}),
    })
    .eq("id", badgeId);

  if (error) {
    return { success: false, error: error.message };
  }

  // Historique
  await supabase.from("badge_history").insert({
    badge_id: badgeId,
    event_id: eventId,
    action: status === "GENERATED" ? "GENERATED" : status === "LOST" ? "LOST" : "CREATED",
    details: {},
  });

  revalidatePath(`/events/${eventId}/badges`);
  return { success: true, data: undefined };
}

/**
 * Signale la perte d'un badge et crée un remplacement.
 */
export async function reportLossAction(
  badgeId: string,
  eventId: string
): Promise<ActionResponse> {
  const supabase = await createServerClient();

  // Récupérer le badge original
  const { data: original } = await supabase
    .from("badges")
    .select("*")
    .eq("id", badgeId)
    .single();

  if (!original) {
    return { success: false, error: "Badge non trouvé" };
  }

  // Marquer comme LOST
  await supabase
    .from("badges")
    .update({ status: "LOST" satisfies BadgeStatus })
    .eq("id", badgeId);

  // Créer le remplacement
  const newCode = await generateBadgeCode(eventId, supabase);
  const { data: replacement } = await supabase
    .from("badges")
    .insert({
      event_id: eventId,
      participant_id: original.participant_id,
      badge_code: newCode,
      batch_number: original.batch_number,
      status: "READY" satisfies BadgeStatus,
    })
    .select()
    .single();

  // Historique
  await supabase.from("badge_history").insert([
    {
      badge_id: badgeId,
      event_id: eventId,
      action: "LOST" as const,
      details: { reason: "Perte signalée" },
    },
    ...(replacement
      ? [
          {
            badge_id: replacement.id,
            event_id: eventId,
            action: "REPLACED" as const,
            details: { original_badge_id: badgeId },
          },
        ]
      : []),
  ]);

  revalidatePath(`/events/${eventId}/badges`);
  return { success: true, data: undefined };
}
