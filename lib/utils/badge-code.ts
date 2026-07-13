/**
 * Génération de codes de badges uniques.
 *
 * Format : BADGE-XXXX où XXXX est un code aléatoire
 * de lettres majuscules et chiffres.
 *
 * @module lib/utils/badge-code
 */

import { createServerClient } from "@/lib/supabase/server";

const BADGE_PREFIX = "BADGE";
const CODE_LENGTH = 4;
const MAX_ATTEMPTS = 5;

/** Caractères autorisés dans les codes badge */
const CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/**
 * Génère un code aléatoire de longueur donnée.
 */
function generateRandomCode(length: number): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length));
  }
  return result;
}

/**
 * Génère un code badge unique pour un événement.
 *
 * @param eventId - ID de l'événement
 * @param supabase - Client Supabase serveur
 * @returns Code badge unique (ex: BADGE-A3F7)
 *
 * @example
 * ```ts
 * const code = await generateBadgeCode(eventId, supabase);
 * // → "BADGE-A3F7"
 * ```
 */
export async function generateBadgeCode(
  eventId: string,
  supabase: Awaited<ReturnType<typeof createServerClient>>
): Promise<string> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const code = `${BADGE_PREFIX}-${generateRandomCode(CODE_LENGTH)}`;

    // Vérifier l'unicité
    const { data, error } = await supabase
      .from("badges")
      .select("id")
      .eq("badge_code", code)
      .eq("event_id", eventId)
      .limit(1);

    if (error) {
      throw new Error(`Erreur de vérification du code: ${error.message}`);
    }

    // Code unique trouvé
    if (!data || data.length === 0) {
      return code;
    }
  }

  throw new Error(`Impossible de générer un code unique après ${MAX_ATTEMPTS} tentatives`);
}

/**
 * Valide le format d'un code badge.
 *
 * @example
 * ```ts
 * isValidBadgeCode("BADGE-A3F7"); // true
 * isValidBadgeCode("BADGE-0001"); // true
 * isValidBadgeCode("invalid");    // false
 * ```
 */
export function isValidBadgeCode(code: string): boolean {
  const regex = new RegExp(`^${BADGE_PREFIX}-[A-Z0-9]{${CODE_LENGTH}}$`);
  return regex.test(code);
}
