/**
 * Page d'édition d'un événement.
 *
 * @module app/(dashboard)/events/[eventId]/edit/page
 */

import { createServerClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EventEditForm } from "@/components/events/event-edit-form";

interface Props {
  params: Promise<{ eventId: string }>;
}

export default async function EventEditPage({ params }: Props) {
  const { eventId } = await params;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: event } = await supabase
    .from("events")
    .select("id, name, description, start_date, end_date, location, badge_width_mm, badge_height_mm, badge_orientation")
    .eq("id", eventId)
    .eq("user_id", user.id)
    .single();

  if (!event) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href={`/events/${eventId}`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à l&apos;événement
      </Link>

      <h1 className="text-2xl font-bold text-gray-900">
        Modifier l&apos;événement
      </h1>

      <EventEditForm event={event} />
    </div>
  );
}
