/**
 * Logique de batch pour la génération de badges.
 *
 * Découpe les participants en lots gérables pour éviter
 * les timeouts serverless (Vercel : 10s free tier).
 *
 * @module lib/utils/batch
 */

/** Taille maximale d'un batch (ajustable selon perf) */
export const MAX_BATCH_SIZE = 50;

/**
 * Découpe un tableau en batches de taille fixe.
 *
 * @param items - Tableau à découper
 * @param batchSize - Taille maximale par batch (défaut: 50)
 * @returns Tableau de batches
 *
 * @example
 * ```ts
 * const batches = chunkArray([1,2,3,4,5,6,7], 3);
 * // → [[1,2,3], [4,5,6], [7]]
 * ```
 */
export function chunkArray<T>(items: T[], batchSize: number = MAX_BATCH_SIZE): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    chunks.push(items.slice(i, i + batchSize));
  }
  return chunks;
}

/**
 * Calcule le numéro de batch à partir de l'index global.
 *
 * @param globalIndex - Index global du participant
 * @param batchSize - Taille des batches
 * @returns Numéro de batch (1-indexed)
 */
export function getBatchNumber(globalIndex: number, batchSize: number = MAX_BATCH_SIZE): number {
  return Math.floor(globalIndex / batchSize) + 1;
}

/**
 * Calcule le nombre total de batches nécessaires.
 */
export function getTotalBatches(totalItems: number, batchSize: number = MAX_BATCH_SIZE): number {
  return Math.ceil(totalItems / batchSize);
}
