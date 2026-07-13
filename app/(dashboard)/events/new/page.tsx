/**
 * Page de création d'un événement.
 *
 * @module app/(dashboard)/events/new/page
 */

import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { EventForm } from "@/components/events/event-form";

export default async function NewEventPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Nouvel événement
        </h1>
        <p className="text-gray-500 mt-1">
          Créez un événement pour commencer à générer des badges
        </p>
      </div>

      <EventForm />
    </div>
  );
}
