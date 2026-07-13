/**
 * API Route pour l'upload du fond de template.
 *
 * @module api/templates/background
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
  const templateId = formData.get("template_id") as string;

  if (!file || !templateId) {
    return NextResponse.json(
      { error: "Fichier et template_id requis" },
      { status: 400 }
    );
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Le fichier ne doit pas dépasser 10 Mo" },
      { status: 400 }
    );
  }

  if (!["image/jpeg", "image/png"].includes(file.type)) {
    return NextResponse.json(
      { error: "Seuls les fichiers PNG et JPG sont autorisés" },
      { status: 400 }
    );
  }

  // Vérifier que le template appartient à l'utilisateur
  const { data: template } = await supabase
    .from("templates")
    .select("id, user_id, background_url")
    .eq("id", templateId)
    .eq("user_id", user.id)
    .single();

  if (!template) {
    return NextResponse.json({ error: "Template non trouvé" }, { status: 404 });
  }

  // Supprimer l'ancien fond
  if (template.background_url) {
    const marker = "/object/public/";
    const idx = template.background_url.indexOf(marker);
    if (idx !== -1) {
      const afterMarker = template.background_url.slice(idx + marker.length);
      const slashIdx = afterMarker.indexOf("/");
      if (slashIdx !== -1) {
        const oldPath = afterMarker.slice(slashIdx + 1);
        await supabase.storage.from("template-backgrounds").remove([oldPath]);
      }
    }
  }

  // Upload le nouveau
  const ext = file.type === "image/png" ? "png" : "jpg";
  const path = `${template.user_id}/${templateId}/background.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from("template-backgrounds")
    .upload(path, buffer, { contentType: file.type, upsert: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage
    .from("template-backgrounds")
    .getPublicUrl(path);

  await supabase
    .from("templates")
    .update({ background_url: urlData.publicUrl, updated_at: new Date().toISOString() })
    .eq("id", templateId);

  return NextResponse.json({ url: urlData.publicUrl });
}
