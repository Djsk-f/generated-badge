/**
 * Types pour le système d'import massif de photos.
 *
 * @module types/photo-import
 */

import type { Participant, FieldDefinition } from "@/lib/types";

// ─── Photo File ─────────────────────────────────────────────────────

/** Un fichier photo sélectionné par l'utilisateur */
export interface PhotoFile {
  id: string;
  file: File;
  /** Nom du fichier sans extension */
  fileName: string;
  /** Object URL pour l'aperçu thumbnail */
  previewUrl: string;
  /** Blob compressé (après compression) */
  compressedBlob: Blob | null;
  /** Taille en bytes après compression */
  compressedSize: number | null;
  status: PhotoFileStatus;
  error?: string;
}

export type PhotoFileStatus =
  | "pending"      // Sélectionné, pas encore compressé
  | "compressing"  // Compression en cours
  | "compressed"   // Prêt pour l'upload
  | "uploading"    // En cours d'upload
  | "uploaded"     // Upload réussi
  | "failed"       // Upload échoué
  | "skipped";     // Ignoré par l'utilisateur

// ─── Matching ───────────────────────────────────────────────────────

/** Résultat du matching d'une photo avec un participant */
export interface PhotoMatch {
  photoFileId: string;
  participantId: string | null;
  confidence: "exact" | "partial" | "manual" | "none";
  matchedFieldKey: string;
}

// ─── Conflits ───────────────────────────────────────────────────────

/** Conflit : participant a déjà une photo pour le champ cible */
export interface PhotoConflict {
  participantId: string;
  participantName: string;
  fieldKey: string;
  existingPhotoUrl: string;
  newPhotoFileId: string;
  resolution: ConflictResolution;
}

export type ConflictResolution = "replace" | "skip" | "keep";

// ─── Wizard State ───────────────────────────────────────────────────

export type PhotoImportStep = "select" | "match" | "conflicts" | "upload" | "summary";

export interface PhotoImportState {
  eventId: string;
  step: PhotoImportStep;
  photoFiles: PhotoFile[];
  participants: Participant[];
  imageFields: FieldDefinition[];
  matches: PhotoMatch[];
  conflicts: PhotoConflict[];
  uploadResults: UploadResult[];
  targetFieldKey: string;
}

// ─── Upload ─────────────────────────────────────────────────────────

export interface UploadResult {
  photoFileId: string;
  participantId: string;
  success: boolean;
  photoPath?: string;
  error?: string;
}

export interface PhotoUploadResponse {
  results: UploadResult[];
  summary: {
    total: number;
    succeeded: number;
    failed: number;
    skipped: number;
  };
}

// ─── Compression ────────────────────────────────────────────────────

export interface CompressionOptions {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  initialQuality: number;
  useWebP: boolean;
}

export const DEFAULT_COMPRESSION: CompressionOptions = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 400,
  initialQuality: 0.85,
  useWebP: true,
};

// ─── Upload Queue ───────────────────────────────────────────────────

export interface UploadItem {
  id: string;
  file: Blob;
  participantId: string;
  fieldKey: string;
  fileName: string;
}

export type UploadItemStatus = "pending" | "uploading" | "uploaded" | "failed";

export interface UploadQueueItem extends UploadItem {
  status: UploadItemStatus;
  error?: string;
}
