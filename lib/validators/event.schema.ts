/**
 * Validators Zod pour les événements.
 *
 * Validation côté serveur (Server Actions) et côté client (formulaires).
 * Les schémas sont partagés pour garantir la cohérence.
 *
 * @module validators/event
 */

import { z } from "zod";

// ─── Schéma de création ─────────────────────────────────────────────

export const createEventSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  description: z.string().max(500).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  location: z.string().max(200).optional(),
  template_id: z.string().optional(),
  badge_width_mm: z
    .number()
    .min(30, "Largeur minimum : 30 mm")
    .max(300, "Largeur maximum : 300 mm"),
  badge_height_mm: z
    .number()
    .min(30, "Hauteur minimum : 30 mm")
    .max(300, "Hauteur maximum : 300 mm"),
  badge_orientation: z.enum(["landscape", "portrait"]),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;

// ─── Schéma de mise à jour ──────────────────────────────────────────

export const updateEventSchema = createEventSchema.partial();

export type UpdateEventInput = z.infer<typeof updateEventSchema>;

// ─── Schéma de validation des dates ─────────────────────────────────

export const eventDatesSchema = z
  .object({
    start_date: z.string().optional(),
    end_date: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.start_date && data.end_date) {
        return new Date(data.start_date) <= new Date(data.end_date);
      }
      return true;
    },
    { message: "La date de fin doit être après la date de début" }
  );
