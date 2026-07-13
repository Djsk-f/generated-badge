/**
 * Service de gestion des événements.
 *
 * Encapsule toutes les opérations CRUD liées aux événements.
 * Utilisé par les Server Actions et les Server Components.
 *
 * @module services/event
 */

import { createServerClient } from "@/lib/supabase/server";
import type { BadgeEvent, ActionResponse } from "@/lib/types";
import type { CreateEventInput, UpdateEventInput } from "@/lib/validators";

/**
 * Récupère tous les événements d'un utilisateur.
 */
export async function getEventsByUser(
  userId: string
): Promise<ActionResponse<BadgeEvent[]>> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as BadgeEvent[] };
}

/**
 * Récupère un événement par son ID (vérifie l'appartenance).
 */
export async function getEventById(
  eventId: string,
  userId: string
): Promise<ActionResponse<BadgeEvent>> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .eq("user_id", userId)
    .single();

  if (error) {
    return {
      success: false,
      error: error.code === "PGRST116" ? "Événement non trouvé" : error.message,
    };
  }

  return { success: true, data: data as BadgeEvent };
}

/**
 * Crée un nouvel événement.
 */
export async function createEvent(
  userId: string,
  input: CreateEventInput
): Promise<ActionResponse<BadgeEvent>> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("events")
    .insert({
      user_id: userId,
      ...input,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as BadgeEvent };
}

/**
 * Met à jour un événement existant.
 */
export async function updateEvent(
  eventId: string,
  userId: string,
  input: UpdateEventInput
): Promise<ActionResponse<BadgeEvent>> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("events")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", eventId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as BadgeEvent };
}

/**
 * Supprime un événement et toutes ses données associées.
 */
export async function deleteEvent(
  eventId: string,
  userId: string
): Promise<ActionResponse> {
  const supabase = await createServerClient();
  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId)
    .eq("user_id", userId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: undefined };
}

/**
 * Récupère les statistiques d'un événement.
 */
export async function getEventStats(
  eventId: string,
  userId: string
): Promise<
  ActionResponse<{
    totalParticipants: number;
    totalBadges: number;
    badgesGenerated: number;
    badgesPending: number;
  }>
> {
  const supabase = await createServerClient();

  // Vérifier que l'événement appartient à l'utilisateur
  const { data: event } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("user_id", userId)
    .single();

  if (!event) {
    return { success: false, error: "Événement non trouvé" };
  }

  const [participantsResult, badgesResult] = await Promise.all([
    supabase
      .from("participants")
      .select("id", { count: "exact", head: true })
      .eq("event_id", eventId),
    supabase
      .from("badges")
      .select("status")
      .eq("event_id", eventId),
  ]);

  const totalParticipants = participantsResult.count ?? 0;
  const badges = badgesResult.data ?? [];

  return {
    success: true,
    data: {
      totalParticipants,
      totalBadges: badges.length,
      badgesGenerated: badges.filter((b) => b.status === "GENERATED").length,
      badgesPending: badges.filter((b) =>
        ["NOT_READY", "READY", "GENERATING"].includes(b.status)
      ).length,
    },
  };
}
