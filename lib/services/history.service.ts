/**
 * Service d'historique des badges.
 *
 * Traçabilité complète : création, génération, téléchargement,
 * remplacement, perte.
 *
 * @module services/history
 */

import { createServerClient } from "@/lib/supabase/server";
import type { BadgeHistory, ActionResponse } from "@/lib/types";

/**
 * Ajoute une entrée dans l'historique.
 */
export async function logHistory(params: {
  badgeId: string;
  eventId: string;
  action: BadgeHistory["action"];
  details?: Record<string, unknown>;
}): Promise<ActionResponse> {
  const supabase = await createServerClient();
  const { error } = await supabase.from("badge_history").insert({
    badge_id: params.badgeId,
    event_id: params.eventId,
    action: params.action,
    details: params.details ?? {},
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: undefined };
}

/**
 * Récupère l'historique complet d'un badge.
 */
export async function getHistoryByBadge(
  badgeId: string
): Promise<ActionResponse<BadgeHistory[]>> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("badge_history")
    .select("*")
    .eq("badge_id", badgeId)
    .order("created_at", { ascending: true });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as BadgeHistory[] };
}

/**
 * Récupère l'historique complet d'un événement.
 */
export async function getHistoryByEvent(
  eventId: string,
  limit: number = 100
): Promise<ActionResponse<BadgeHistory[]>> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("badge_history")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as BadgeHistory[] };
}
