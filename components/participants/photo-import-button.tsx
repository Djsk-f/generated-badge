/**
 * Bouton pour ouvrir le dialog d'import de photos.
 *
 * @module components/participants/photo-import-button
 */

"use client";

import { useState, useEffect } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PhotoImportDialog } from "./photo-import/photo-import-dialog";
import type { Participant, FieldDefinition } from "@/lib/types";

interface PhotoImportButtonProps {
  eventId: string;
  participants: Participant[];
  imageFields: FieldDefinition[];
}

export function PhotoImportButton({
  eventId,
  participants,
  imageFields,
}: PhotoImportButtonProps) {
  const [open, setOpen] = useState(false);

  // Ne pas afficher si pas de champ IMAGE
  if (imageFields.length === 0) {
    return null;
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Camera className="w-4 h-4" />
        Photos
      </Button>

      <PhotoImportDialog
        eventId={eventId}
        open={open}
        onClose={() => setOpen(false)}
        participants={participants}
        imageFields={imageFields}
      />
    </>
  );
}
