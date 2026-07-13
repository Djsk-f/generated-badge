/**
 * Validators Zod pour les participants.
 *
 * Validation des données d'import (CSV/Excel) et des formulaires.
 *
 * @module validators/participant
 */

import { z } from "zod";

// ─── Schéma de création ─────────────────────────────────────────────

export const createParticipantSchema = z.object({
  field_values: z.record(z.string()).default({}),
  metadata: z.record(z.unknown()).default({}),
});

export type CreateParticipantInput = z.infer<typeof createParticipantSchema>;

// ─── Schéma d'import CSV/Excel ──────────────────────────────────────

/**
 * Schéma flexible pour l'import massif.
 * Les données sont brutes (Record<string, string>).
 */
export const importParticipantSchema = z.record(
  z.string(),
  z.string()
);

export type ImportParticipantInput = z.infer<typeof importParticipantSchema>;

// ─── Schéma de collecte publique ────────────────────────────────────

export const collectFormSchema = z.object({
  event_id: z.string().uuid(),
  field_values: z.record(z.string()).default({}),
});

export type CollectFormInput = z.infer<typeof collectFormSchema>;

// ─── Mapping CSV ────────────────────────────────────────────────────

/** Correspondance colonne CSV → clé FieldDefinition */
export const csvColumnMappingSchema = z.record(
  z.string(),
  z.string()
);

export type CsvColumnMapping = z.infer<typeof csvColumnMappingSchema>;
