/**
 * Page liste des événements.
 *
 * @module app/(dashboard)/events/page
 */

import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function EventsPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let events: Array<{
    id: string;
    name: string;
    description: string | null;
    location: string | null;
    start_date: string | null;
    end_date: string | null;
    created_at: string;
  }> = [];

  try {
    const { data } = await supabase
      .from("events")
      .select("id, name, description, location, start_date, end_date, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    events = data ?? [];
  } catch (error) {
    // Tables pas encore créées — silencieux en production
    if (process.env.NODE_ENV === "development") {
      console.warn("[Events] Failed to fetch events:", error);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Événements</h1>
          <p className="text-gray-500 mt-1">
            Gérez vos événements et leurs badges
          </p>
        </div>
        <Link href="/events/new">
          <Button>
            <Plus className="w-4 h-4" />
            Nouvel événement
          </Button>
        </Link>
      </div>

      {/* Liste */}
      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <Card padding="none" className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <div className="h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-t-xl flex items-center justify-center">
                  <Calendar className="w-10 h-10 text-white/80" />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {event.name}
                  </h3>
                  <div className="mt-3 space-y-1.5 text-sm text-gray-500">
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </div>
                    )}
                    {event.start_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(event.start_date).toLocaleDateString("fr-FR")}
                        {event.end_date &&
                          ` → ${new Date(event.end_date).toLocaleDateString("fr-FR")}`}
                      </div>
                    )}
                  </div>
                  {event.description && (
                    <p className="mt-3 text-sm text-gray-400 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card padding="lg">
          <div className="text-center text-gray-500 py-12">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun événement
            </h3>
            <p className="mb-4">
              Créez votre premier événement pour commencer à générer des badges.
            </p>
            <Link href="/events/new">
              <Button>
                <Plus className="w-4 h-4" />
                Créer un événement
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
