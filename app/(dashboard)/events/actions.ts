/**
 * Server Actions pour les événements.
 *
 * @module app/(dashboard)/events/actions
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { createEventSchema, updateEventSchema } from "@/lib/validators";
import type { ActionResponse, BadgeEvent } from "@/lib/types";

/**
 * Crée un nouvel événement.
 */
export async function createEventAction(
  formData: FormData
): Promise<ActionResponse<BadgeEvent>> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  const rawData = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    start_date: (formData.get("start_date") as string) || undefined,
    end_date: (formData.get("end_date") as string) || undefined,
    location: (formData.get("location") as string) || undefined,
    template_id: (formData.get("template_id") as string) || undefined,
    badge_width_mm: Number(formData.get("badge_width_mm")) || 85.6,
    badge_height_mm: Number(formData.get("badge_height_mm")) || 53.98,
    badge_orientation:
      (formData.get("badge_orientation") as "landscape" | "portrait") ||
      "landscape",
  };

  const parsed = createEventSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: "Données invalides",
      details: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { data, error } = await supabase
    .from("events")
    .insert({
      user_id: user.id,
      ...parsed.data,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/events");
  redirect(`/events/${data.id}`);
}

/**
 * Met à jour un événement.
 */
export async function updateEventAction(
  eventId: string,
  formData: FormData
): Promise<ActionResponse<BadgeEvent>> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  const rawData = {
    name: (formData.get("name") as string) || undefined,
    description: (formData.get("description") as string) || undefined,
    start_date: (formData.get("start_date") as string) || undefined,
    end_date: (formData.get("end_date") as string) || undefined,
    location: (formData.get("location") as string) || undefined,
    template_id: (formData.get("template_id") as string) || undefined,
    badge_width_mm: formData.get("badge_width_mm")
      ? Number(formData.get("badge_width_mm"))
      : undefined,
    badge_height_mm: formData.get("badge_height_mm")
      ? Number(formData.get("badge_height_mm"))
      : undefined,
    badge_orientation: (formData.get("badge_orientation") as
      | "landscape"
      | "portrait") || undefined,
  };

  const parsed = updateEventSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: "Données invalides",
      details: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { data, error } = await supabase
    .from("events")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", eventId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);
  return { success: true, data: data as BadgeEvent };
}

/**
 * Supprime un événement.
 */
export async function deleteEventAction(
  eventId: string
): Promise<ActionResponse> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié" };
  }

  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/events");
  redirect("/events");
}

