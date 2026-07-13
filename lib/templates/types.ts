/**
 * Types du moteur de templates de badges.
 *
 * @module templates/types
 */

import type { TemplateElement } from "@/lib/types";

export type { TemplateElement };

/**
 * Contexte de rendu d'un badge.
 */
export interface RenderContext {
  participant: {
    [key: string]: unknown;
  };
  event: {
    name: string;
    description: string;
    location: string;
    logo_url: string;
  };
  badge: {
    code: string;
    qr_data: string;
  };
}

export interface RenderedElement {
  element: TemplateElement;
  resolvedValue: string;
  resolvedPosition: { x: number; y: number };
  resolvedStyle: Record<string, unknown>;
}
