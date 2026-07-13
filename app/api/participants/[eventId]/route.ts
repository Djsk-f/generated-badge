/**
 * API Route pour la récupération des participants.
 *
 * @module api/participants/[eventId]
 */

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

interface Params {
  params: Promise<{ eventId: string }>;
}

export async function GET(request: Request, { params }: Params) {
  const { eventId } = await params;
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("participants")
    .select("id, field_values, created_at")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ participants: data });
}
