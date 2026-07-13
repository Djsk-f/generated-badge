/**
 * Validators Zod pour les badges.
 *
 * @module validators/badge
 */

import { z } from "zod";
import { BADGE_STATUSES } from "@/lib/types";

// ─── Schéma de génération par batch ─────────────────────────────────

export const generateBatchSchema = z.object({
  event_id: z.string().uuid("ID événement invalide"),
  participant_ids: z
    .array(z.string().uuid())
    .min(1, "Sélectionnez au moins un participant"),
  batch_number: z.number().int().positive(),
});

export type GenerateBatchInput = z.infer<typeof generateBatchSchema>;

// ─── Schéma de signalement de perte ─────────────────────────────────

export const reportLossSchema = z.object({
  badge_id: z.string().uuid("ID badge invalide"),
  reason: z.string().max(500).optional(),
});

export type ReportLossInput = z.infer<typeof reportLossSchema>;

// ─── Validation du statut ───────────────────────────────────────────

export const badgeStatusSchema = z.enum(BADGE_STATUSES);
