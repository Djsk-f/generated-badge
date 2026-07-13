/**
 * Service de stockage Supabase Storage.
 *
 * Gère l'upload et la récupération de fichiers (logos, photos, PDFs).
 *
 * @module services/storage
 */

import { createServerClient } from "@/lib/supabase/server";
import type { ActionResponse } from "@/lib/types";

/** Buckets de stockage */
const BUCKETS = {
  LOGOS: "event-logos",
  PHOTOS: "participant-photos",
  PDFS: "badge-pdfs",
  TEMPLATE_BACKGROUNDS: "template-backgrounds",
} as const;

/**
 * Upload un fichier vers Supabase Storage.
 *
 * @param bucket - Nom du bucket (logos, photos, pdfs)
 * @param path - Chemin du fichier dans le bucket
 * @param file - Fichier à uploader (Buffer ou Blob)
 * @param contentType - Type MIME du fichier
 * @returns URL publique du fichier uploadé
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: Buffer | Blob | ArrayBuffer,
  contentType: string
): Promise<ActionResponse<string>> {
  const supabase = await createServerClient();

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType,
      upsert: true,
    });

  if (error) {
    return { success: false, error: error.message };
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);

  return { success: true, data: urlData.publicUrl };
}

/**
 * Upload le logo d'un événement.
 */
export async function uploadEventLogo(
  eventId: string,
  file: Buffer | Blob | ArrayBuffer,
  contentType: string
): Promise<ActionResponse<string>> {
  const ext = contentType.split("/")[1] ?? "png";
  const path = `${eventId}/logo.${ext}`;
  return uploadFile(BUCKETS.LOGOS, path, file, contentType);
}

/**
 * Upload la photo d'un participant.
 */
export async function uploadParticipantPhoto(
  participantId: string,
  file: Buffer | Blob | ArrayBuffer,
  contentType: string
): Promise<ActionResponse<string>> {
  const ext = contentType.split("/")[1] ?? "jpg";
  const path = `${participantId}/photo.${ext}`;
  return uploadFile(BUCKETS.PHOTOS, path, file, contentType);
}

/**
 * Upload un PDF de badge généré.
 */
export async function uploadBadgePdf(
  badgeId: string,
  pdfBuffer: Buffer
): Promise<ActionResponse<string>> {
  const path = `${badgeId}/badge.pdf`;
  return uploadFile(BUCKETS.PDFS, path, pdfBuffer, "application/pdf");
}

/**
 * Upload la photo d'un participant avec path basé sur l'événement.
 *
 * Structure : events/{eventId}/participants/{participantId}/photo.webp
 */
export async function uploadParticipantPhotoEventPath(
  eventId: string,
  participantId: string,
  file: Buffer | Blob | ArrayBuffer,
  contentType: string
): Promise<ActionResponse<string>> {
  const ext = contentType.split("/")[1] ?? "webp";
  const path = `${eventId}/participants/${participantId}/photo.${ext}`;
  return uploadFile(BUCKETS.PHOTOS, path, file, contentType);
}

/**
 * Récupère le path de la photo d'un participant.
 */
export function getParticipantPhotoPath(
  eventId: string,
  participantId: string,
  ext: string = "webp"
): string {
  return `${eventId}/participants/${participantId}/photo.${ext}`;
}

/**
 * Récupère l'URL publique de la photo d'un participant.
 */
export function getParticipantPhotoUrl(
  eventId: string,
  participantId: string,
  ext: string = "webp"
): string {
  const path = getParticipantPhotoPath(eventId, participantId, ext);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${supabaseUrl}/storage/v1/object/public/${BUCKETS.PHOTOS}/${path}`;
}

/**
 * Supprime la photo d'un participant.
 */
export async function deleteParticipantPhoto(
  eventId: string,
  participantId: string
): Promise<ActionResponse> {
  const supabase = await createServerClient();

  // Lister les fichiers du participant
  const prefix = `${eventId}/participants/${participantId}/`;
  const { data: files, error: listError } = await supabase.storage
    .from(BUCKETS.PHOTOS)
    .list(prefix);

  if (listError) {
    return { success: false, error: listError.message };
  }

  if (!files || files.length === 0) {
    return { success: true, data: undefined };
  }

  // Supprimer tous les fichiers
  const paths = files.map((f) => `${prefix}${f.name}`);
  const { error } = await supabase.storage.from(BUCKETS.PHOTOS).remove(paths);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: undefined };
}

/**
 * Supprime un fichier du stockage.
 */
export async function deleteFile(
  bucket: string,
  paths: string[]
): Promise<ActionResponse> {
  const supabase = await createServerClient();
  const { error } = await supabase.storage.from(bucket).remove(paths);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: undefined };
}
