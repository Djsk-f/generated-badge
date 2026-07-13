/**
 * Validators Zod pour les FieldDefinitions.
 *
 * @module validators/field-definition
 */

import { z } from "zod";
import { FIELD_TYPES } from "@/lib/types";

const fieldTypeSchema = z.enum(FIELD_TYPES);

export const createFieldDefinitionSchema = z.object({
  event_id: z.string().uuid(),
  key: z
    .string()
    .min(1, "La clé est requise")
    .max(50)
    .regex(/^[a-z0-9_]+$/, "Clé: lettres minuscules, chiffres et _ uniquement"),
  label: z.string().min(1, "Le libellé est requis").max(100),
  field_type: fieldTypeSchema,
  required: z.boolean().default(false),
  placeholder: z.string().max(200).optional().or(z.literal("")),
  default_value: z.string().max(500).optional().or(z.literal("")),
  options: z.array(z.string()).default([]),
  validation: z.record(z.unknown()).default({}),
  order: z.number().int().min(0).default(0),
  visible_on_badge: z.boolean().default(true),
  visible_in_form: z.boolean().default(true),
  is_display_name: z.boolean().default(false),
});

export type CreateFieldDefinitionInput = z.infer<
  typeof createFieldDefinitionSchema
>;

export const updateFieldDefinitionSchema = z.object({
  id: z.string().uuid(),
  key: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9_]+$/)
    .optional(),
  label: z.string().min(1).max(100).optional(),
  field_type: fieldTypeSchema.optional(),
  required: z.boolean().optional(),
  placeholder: z.string().max(200).optional().or(z.literal("")),
  default_value: z.string().max(500).optional().or(z.literal("")),
  options: z.array(z.string()).optional(),
  validation: z.record(z.unknown()).optional(),
  order: z.number().int().min(0).optional(),
  visible_on_badge: z.boolean().optional(),
  visible_in_form: z.boolean().optional(),
  is_display_name: z.boolean().optional(),
});

export type UpdateFieldDefinitionInput = z.infer<
  typeof updateFieldDefinitionSchema
>;
