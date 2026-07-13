/**
 * Service client-side pour l'import de photos.
 *
 * Fonctions pures de normalisation, matching et compression.
 *
 * @module services/photo-import
 */

import type { PhotoFile, PhotoMatch, CompressionOptions, DEFAULT_COMPRESSION } from "@/lib/types/photo-import";
import type { Participant, FieldDefinition } from "@/lib/types";

// ─── Normalisation ──────────────────────────────────────────────────

/**
 * Normalise une chaîne pour le matching.
 *
 * - Supprime les accents
 * - Supprime l'extension du fichier
 * - Remplace les séparateurs par des espaces
 * - Supprime les espaces multiples
 * - Minuscules
 *
 * @example
 * ```ts
 * normalize("Jean-Paul.jpg") // "jean paul"
 * normalize("Marie_Louise.PNG") // "marie louise"
 * ```
 */
export function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // supprimer accents
    .replace(/\.(jpe?g|png|webp|gif|bmp|tiff?)$/i, "") // supprimer extension
    .replace(/[_\-\.]/g, " ") // séparateurs → espaces
    .replace(/\s+/g, " ") // espaces multiples → un seul
    .trim();
}

/**
 * Extrait le nom du fichier sans extension.
 */
export function extractFileName(fileName: string): string {
  return fileName.replace(/\.[^/.]+$/, "");
}

// ─── Matching ───────────────────────────────────────────────────────

/**
 * Récupère le nom d'affichage d'un participant.
 */
function getParticipantDisplayName(
  participant: Participant,
  displayFieldKey: string
): string {
  // Essayer le champ display name
  const displayValue = participant.field_values[displayFieldKey];
  if (displayValue) return displayValue;

  // Fallback : premier champ non vide
  for (const value of Object.values(participant.field_values)) {
    if (value && typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return "";
}

/**
 * Matching automatique des photos avec les participants.
 *
 * @param photoFiles - Liste des photos sélectionnées
 * @param participants - Liste des participants de l'événement
 * @param displayFieldKey - Clé du champ d'affichage (ex: "nom")
 * @returns Tableau des correspondances trouvées
 */
export function autoMatchPhotos(
  photoFiles: PhotoFile[],
  participants: Participant[],
  displayFieldKey: string
): PhotoMatch[] {
  // Construire la lookup normalisée → participant
  const participantLookup = new Map<string, Participant>();
  for (const p of participants) {
    const name = getParticipantDisplayName(p, displayFieldKey);
    if (name) {
      const normalized = normalize(name);
      participantLookup.set(normalized, p);
    }
  }

  const matches: PhotoMatch[] = [];

  for (const photo of photoFiles) {
    const photoName = normalize(photo.fileName);

    // 1. Essayer un match exact
    const exactMatch = participantLookup.get(photoName);
    if (exactMatch) {
      matches.push({
        photoFileId: photo.id,
        participantId: exactMatch.id,
        confidence: "exact",
        matchedFieldKey: displayFieldKey,
      });
      continue;
    }

    // 2. Essayer un match partiel (le nom du fichier contient le nom du participant ou vice versa)
    let partialMatch: Participant | null = null;
    for (const [normalized, participant] of participantLookup) {
      if (photoName.includes(normalized) || normalized.includes(photoName)) {
        partialMatch = participant;
        break;
      }
    }

    if (partialMatch) {
      matches.push({
        photoFileId: photo.id,
        participantId: partialMatch.id,
        confidence: "partial",
        matchedFieldKey: displayFieldKey,
      });
      continue;
    }

    // 3. Aucun match
    matches.push({
      photoFileId: photo.id,
      participantId: null,
      confidence: "none",
      matchedFieldKey: displayFieldKey,
    });
  }

  return matches;
}

// ─── Compression ────────────────────────────────────────────────────

/**
 * Compresse une image en WebP avec redimensionnement.
 *
 * @param file - Fichier image original
 * @param options - Options de compression
 * @returns Blob compressé en WebP
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 400,
    initialQuality: 0.85,
    useWebP: true,
  }
): Promise<Blob> {
  const imageCompression = (await import("browser-image-compression")).default;

  const compressed = await imageCompression(file, {
    maxSizeMB: options.maxSizeMB,
    maxWidthOrHeight: options.maxWidthOrHeight,
    initialQuality: options.initialQuality,
    fileType: options.useWebP ? "image/webp" : file.type,
  });

  return compressed;
}

/**
 * Compresse toutes les photos en parallèle (max 5 simultanées).
 *
 * @param photoFiles - Photos à compresser
 * @param onProgress - Callback de progression (index, total)
 * @returns Photos avec compressedBlob rempli
 */
export async function compressAllPhotos(
  photoFiles: PhotoFile[],
  onProgress?: (completed: number, total: number) => void
): Promise<PhotoFile[]> {
  const CONCURRENCY = 5;
  const results: PhotoFile[] = [...photoFiles];
  let completed = 0;

  // Process par batches
  for (let i = 0; i < photoFiles.length; i += CONCURRENCY) {
    const batch = photoFiles.slice(i, i + CONCURRENCY);

    await Promise.all(
      batch.map(async (photo, batchIndex) => {
        const index = i + batchIndex;
        try {
          const compressed = await compressImage(photo.file);
          results[index] = {
            ...photo,
            compressedBlob: compressed,
            compressedSize: compressed.size,
            status: "compressed",
          };
        } catch (error) {
          results[index] = {
            ...photo,
            status: "failed",
            error: error instanceof Error ? error.message : "Erreur de compression",
          };
        }
        completed++;
        onProgress?.(completed, photoFiles.length);
      })
    );
  }

  return results;
}

// ─── Validation ─────────────────────────────────────────────────────

/** Types MIME autorisés pour les photos */
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/tiff",
];

/** Taille max par fichier (10 MB) */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Valide un fichier image.
 *
 * @returns null si valide, message d'erreur sinon
 */
export function validatePhotoFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return `Format non supporté: ${file.type || "inconnu"}`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `Fichier trop volumineux: ${(file.size / 1024 / 1024).toFixed(1)} MB (max 10 MB)`;
  }
  return null;
}

/**
 * Valide un lot de fichiers et retourne les valides + erreurs.
 */
export function validatePhotoFiles(
  files: File[]
): { valid: File[]; errors: Array<{ file: string; error: string }> } {
  const valid: File[] = [];
  const errors: Array<{ file: string; error: string }> = [];

  for (const file of files) {
    const error = validatePhotoFile(file);
    if (error) {
      errors.push({ file: file.name, error });
    } else {
      valid.push(file);
    }
  }

  return { valid, errors };
}

// ─── Création PhotoFile ─────────────────────────────────────────────

/**
 * Crée des PhotoFile à partir de fichiers sélectionnés.
 */
export function createPhotoFiles(files: File[]): PhotoFile[] {
  return files.map((file) => ({
    id: crypto.randomUUID(),
    file,
    fileName: extractFileName(file.name),
    previewUrl: URL.createObjectURL(file),
    compressedBlob: null,
    compressedSize: null,
    status: "pending" as const,
  }));
}
