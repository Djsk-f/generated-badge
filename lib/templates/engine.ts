/**
 * Moteur de rendu de badges.
 *
 * Supporte les templates DB (fond importé + éléments dynamiques).
 *
 * @module templates/engine
 */

import type { Template, TemplateElement, BadgeEvent, Participant } from "@/lib/types";
import type { RenderContext } from "./types";

/**
 * Résout la valeur d'un champ dynamique à partir du contexte.
 */
export function resolveField(field: string, context: RenderContext): string {
  const parts = field.split(".");
  let current: unknown = context;

  for (const part of parts) {
    if (current === null || current === undefined) return "";
    current = (current as Record<string, unknown>)[part];
  }

  return String(current ?? "");
}

/**
 * Convertit mm en points PDF (1 mm ≈ 2.835 pt).
 */
export function mmToPoints(mm: number): number {
  return mm * 2.834645669;
}

/**
 * Génère les dimensions PDF à partir d'un template.
 */
export function getTemplatePdfDimensions(template: Template) {
  return {
    width: mmToPoints(template.width_mm),
    height: mmToPoints(template.height_mm),
  };
}

/**
 * Génère le contexte de rendu pour un participant.
 */
export function buildRenderContext(params: {
  participant: Participant;
  event: BadgeEvent;
  badgeCode: string;
}): RenderContext {
  return {
    participant: {
      ...params.participant.field_values,
      ...params.participant.metadata,
    },
    event: {
      name: params.event.name,
      description: params.event.description || "",
      location: params.event.location || "",
      logo_url: params.event.logo_url || "",
    },
    badge: {
      code: params.badgeCode,
      qr_data: `badge:${params.event.id}:${params.badgeCode}`,
    },
  };
}

/**
 * Résout tous les éléments d'un template avec le contexte donné.
 * Retourne les éléments avec leurs valeurs résolues.
 */
export function resolveElements(
  elements: TemplateElement[],
  context: RenderContext
): Array<TemplateElement & { resolvedValue?: string }> {
  return elements.map((el) => {
    const fieldPath = el.field || (el.name ? `participant.${el.name}` : "");
    return {
      ...el,
      resolvedValue: fieldPath ? resolveField(fieldPath, context) : undefined,
    };
  });
}
