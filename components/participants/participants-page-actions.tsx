/**
 * Actions de la page participants (client component).
 *
 * @module components/participants/participants-page-actions
 */

"use client";

import Link from "next/link";
import { Upload, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PhotoImportButton } from "./photo-import-button";
import type { Participant, FieldDefinition } from "@/lib/types";

interface ParticipantsPageActionsProps {
  eventId: string;
  participants: Participant[];
  imageFields: FieldDefinition[];
}

export function ParticipantsPageActions({
  eventId,
  participants,
  imageFields,
}: ParticipantsPageActionsProps) {
  return (
    <div className="flex gap-2">
      <PhotoImportButton
        eventId={eventId}
        participants={participants}
        imageFields={imageFields}
      />
      <Link href={`/events/${eventId}/participants/new`}>
        <Button variant="outline">
          <UserPlus className="w-4 h-4" />
          Ajouter
        </Button>
      </Link>
      <Link href={`/events/${eventId}/participants/import`}>
        <Button>
          <Upload className="w-4 h-4" />
          Importer
        </Button>
      </Link>
    </div>
  );
}
