/**
 * API Route pour l'upload de fichiers.
 *
 * @module api/upload
 */

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const bucket = formData.get("bucket") as string;
  const path = formData.get("path") as string;

  if (!file || !bucket || !path) {
    return NextResponse.json(
      { error: "Fichier, bucket et path requis" },
      { status: 400 }
    );
  }

  // Vérifier la taille (max 5 MB)
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
    "image/svg+xml",
    "application/pdf",
  ];

  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Type de fichier non autorisé" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: file.type,
    upsert: true,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);

  return NextResponse.json({ url: urlData.publicUrl });
}
