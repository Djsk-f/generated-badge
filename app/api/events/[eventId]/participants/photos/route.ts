/**
 * API Route pour l'upload batch de photos participants.
 *
 * POST : Upload plusieurs photos en une requête.
 *
 * @module api/events/[eventId]/participants/photos
 */

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { uploadParticipantPhotoEventPath } from "@/lib/services/storage.service";

interface Params {
  params: Promise<{ eventId: string }>;
}

export async function POST(request: Request, { params }: Params) {
  const { eventId } = await params;
  const supabase = await createServerClient();

  // Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Vérifier que l'événement appartient à l'utilisateur
  const { data: event } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("user_id", user.id)
    .single();

  if (!event) {
    return NextResponse.json({ error: "Événement non trouvé" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const participantId = formData.get("participantId") as string;
  const fieldKey = formData.get("fieldKey") as string;

  if (!file || !participantId || !fieldKey) {
    return NextResponse.json(
      { error: "file, participantId et fieldKey requis" },
      { status: 400 }
    );
  }

  // Vérifier que le participant appartient à l'événement
  const { data: participant } = await supabase
    .from("participants")
    .select("id")
    .eq("id", participantId)
    .eq("event_id", eventId)
    .single();

  if (!participant) {
    return NextResponse.json(
      { error: "Participant non trouvé dans cet événement" },
      { status: 404 }
    );
  }

  // Vérifier la taille (max 5 MB après compression)
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Le fichier ne doit pas dépasser 5 Mo" },
      { status: 400 }
    );
  }

  // Vérifier le type
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Type de fichier non autorisé" },
      { status: 400 }
    );
  }

  // Upload vers Supabase Storage
  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadResult = await uploadParticipantPhotoEventPath(
    eventId,
    participantId,
    buffer,
    file.type
  );

  if (!uploadResult.success) {
    return NextResponse.json(
      { error: uploadResult.error },
      { status: 500 }
    );
  }

  // Mettre à jour field_values du participant
  const photoPath = uploadResult.data;

  // Récupérer les field_values actuels
  const { data: currentParticipant } = await supabase
    .from("participants")
    .select("field_values")
    .eq("id", participantId)
    .single();

  const fieldValues = currentParticipant?.field_values || {};

  // Mettre à jour le champ photo
  const { error: updateError } = await supabase
    .from("participants")
    .update({
      field_values: {
        ...fieldValues,
        [fieldKey]: photoPath,
      },
      updated_at: new Date().toISOString(),
    })
    .eq("id", participantId);

  if (updateError) {
    return NextResponse.json(
      { error: `Erreur de mise à jour: ${updateError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    photoPath,
    participantId,
    fieldKey,
  });
}
