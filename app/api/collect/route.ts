/**
 * API Route publique pour la collecte de participants.
 * Pas d'authentification requise.
 * Rate limiting: 10 requêtes par minute par IP.
 *
 * @module api/collect
 */

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// ─── Rate Limiting ──────────────────────────────────────────────────
const RATE_LIMIT_MAX = 10; // max 10 requêtes
const RATE_LIMIT_WINDOW = 60 * 1000; // par minute (en ms)

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  // Première requête ou fenêtre expirée
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  // Limite atteinte
  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "unknown";
}

// ─── Handler ────────────────────────────────────────────────────────

export async function POST(request: Request) {
  // Rate limiting
  const ip = getClientIp(request);
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Trop de requêtes. Réessayez dans une minute." },
      { status: 429 }
    );
  }

  const supabase = await createServerClient();
  const body = await request.json();

  const eventId = body.event_id as string;
  const fieldValues = (body.field_values as Record<string, string>) ?? {};

  if (!eventId) {
    return NextResponse.json(
      { error: "event_id requis" },
      { status: 400 }
    );
  }

  // Vérifier que l'événement existe
  const { data: event } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .single();

  if (!event) {
    return NextResponse.json(
      { error: "Événement non trouvé" },
      { status: 404 }
    );
  }

  // Créer le participant — tout dans field_values
  const { data, error } = await supabase
    .from("participants")
    .insert({
      event_id: eventId,
      field_values: fieldValues,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json(
      { error: `Erreur d'inscription: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Inscription réussie",
    participant_id: data.id,
  });
}
