/**
 * Page Dashboard - Vue d'ensemble.
 *
 * @module app/(dashboard)/page
 */

import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, Users, BadgeCheck, Plus, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Récupérer les événements
  let events: Array<{
    id: string;
    name: string;
    location: string | null;
    start_date: string | null;
    created_at: string;
  }> = [];

  let totalParticipants = 0;
  let totalBadges = 0;

  try {
    // Événements
    const { data: eventsData } = await supabase
      .from("events")
      .select("id, name, location, start_date, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    events = eventsData ?? [];

    // Récupérer les IDs des événements pour les stats
    const eventIds = events.map((e) => e.id);

    if (eventIds.length > 0) {
      // Participants total
      const { count: participantsCount } = await supabase
        .from("participants")
        .select("id", { count: "exact", head: true })
        .in("event_id", eventIds);

      totalParticipants = participantsCount ?? 0;

      // Badges total
      const { count: badgesCount } = await supabase
        .from("badges")
        .select("id", { count: "exact", head: true })
        .in("event_id", eventIds)
        .eq("status", "GENERATED");

      totalBadges = badgesCount ?? 0;
    }
  } catch (error) {
    // Tables probablement pas encore créées — silencieux en production
    if (process.env.NODE_ENV === "development") {
      console.warn("[Dashboard] Failed to fetch data:", error);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Bienvenue {user.user_metadata?.full_name || user.email}
          </p>
        </div>
        <Link href="/events/new">
          <Button>
            <Plus className="w-4 h-4" />
            Nouvel événement
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Événements</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{events.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Participants</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalParticipants}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Badges générés</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalBadges}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <BadgeCheck className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Derniers événements */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Derniers événements
          </h2>
          {events.length > 0 && (
            <Link
              href="/events"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              Voir tout
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {events.length > 0 ? (
          <div className="space-y-3">
            {events.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <Card padding="md" className="hover:shadow-md transition-shadow cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                           style={{ background: "var(--gradient-cool)" }}>
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {event.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {event.location && `${event.location} · `}
                          {event.start_date
                            ? new Date(event.start_date).toLocaleDateString("fr-FR")
                            : "Pas de date"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-400">
                        {new Date(event.created_at).toLocaleDateString("fr-FR")}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card padding="lg">
            <div className="text-center text-gray-500 py-8">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun événement
              </h3>
              <p className="text-gray-500 mb-4">
                Créez votre premier événement pour commencer
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
    </div>
  );
}
