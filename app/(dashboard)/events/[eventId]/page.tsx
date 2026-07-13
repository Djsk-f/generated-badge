/**
 * Page détail d'un événement.
 *
 * @module app/(dashboard)/events/[eventId]/page
 */

import { createServerClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Users,
  BadgeCheck,
  ArrowLeft,
  LayoutGrid,
  Pencil,
  Share2,
  UserPlus,
} from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AssignTemplateButton } from "@/components/events/assign-template-button";
import { CollectLinkButton } from "@/components/events/collect-link-button";

interface Props {
  params: Promise<{ eventId: string }>;
}

export default async function EventDetailPage({ params }: Props) {
  const { eventId } = await params;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: event } = await supabase
    .from("events")
    .select("id, name, description, start_date, end_date, location, active_template_id")
    .eq("id", eventId)
    .eq("user_id", user.id)
    .single();

  if (!event) notFound();

  // Récupérer le template actif si présent
  let activeTemplate = null;
  if (event.active_template_id) {
    const { data } = await supabase
      .from("templates")
      .select("id, name, background_url")
      .eq("id", event.active_template_id)
      .single();
    activeTemplate = data;
  }

  // Récupérer les stats
  const [participantsResult, badgesResult] = await Promise.all([
    supabase
      .from("participants")
      .select("id", { count: "exact", head: true })
      .eq("event_id", eventId),
    supabase
      .from("badges")
      .select("status")
      .eq("event_id", eventId),
  ]);

  const totalParticipants = participantsResult.count ?? 0;
  const badges = badgesResult.data ?? [];
  const badgesGenerated = badges.filter((b) => b.status === "GENERATED").length;

  return (
    <div className="space-y-8">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Événements", href: "/events" },
          { label: event.name },
        ]}
      />

      <div className="flex items-center gap-4">
        <Link
          href="/events"
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
          {event.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {event.location}
            </span>
          )}
          {event.start_date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(event.start_date).toLocaleDateString("fr-FR")}
              {event.end_date &&
                ` → ${new Date(event.end_date).toLocaleDateString("fr-FR")}`}
            </span>
          )}
        </div>
        {event.description && (
          <p className="mt-2 text-gray-500 max-w-2xl">{event.description}</p>
        )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center py-4">
          <p className="text-2xl font-bold text-gray-900">{totalParticipants}</p>
          <p className="text-sm text-gray-500">Participants</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-2xl font-bold text-gray-900">{badgesGenerated}</p>
          <p className="text-sm text-gray-500">Badges générés</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-2xl font-bold text-gray-900">
            {totalParticipants - badgesGenerated}
          </p>
          <p className="text-sm text-gray-500">En attente</p>
        </Card>
      </div>

      {/* Template actif */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-14 bg-gray-100 rounded overflow-hidden flex-shrink-0">
              {activeTemplate?.background_url ? (
                <img
                  src={activeTemplate.background_url}
                  alt={activeTemplate.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <LayoutGrid className="w-5 h-5 text-gray-300" />
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {activeTemplate ? activeTemplate.name : "Aucun template assigné"}
              </p>
              <p className="text-xs text-gray-500">
                {activeTemplate
                  ? "Ce template sera utilisé pour la génération des badges"
                  : "Assignez un template pour générer les badges"}
              </p>
            </div>
          </div>
          <AssignTemplateButton
            eventId={eventId}
            currentTemplateId={event.active_template_id}
          />
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex flex-wrap gap-2">
        <Link href={`/events/${eventId}/edit`}>
          <Button variant="outline" size="sm">
            <Pencil className="w-4 h-4" />
            Modifier
          </Button>
        </Link>
        <Link href={`/events/${eventId}/participants/new`}>
          <Button variant="outline" size="sm">
            <UserPlus className="w-4 h-4" />
            Ajouter
          </Button>
        </Link>
        <Link href={`/events/${eventId}/participants`}>
          <Button variant="outline" size="sm">
            <Users className="w-4 h-4" />
            Participants
          </Button>
        </Link>
        <Link href={`/events/${eventId}/badges`}>
          <Button variant="outline" size="sm">
            <BadgeCheck className="w-4 h-4" />
            Badges
          </Button>
        </Link>
        <CollectLinkButton eventId={eventId} />
      </div>
    </div>
  );
}
