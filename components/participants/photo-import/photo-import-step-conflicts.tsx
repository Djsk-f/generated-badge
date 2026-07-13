/**
 * Étape 3 : Résolution des conflits (photos existantes).
 *
 * @module components/participants/photo-import/photo-import-step-conflicts
 */

"use client";

import { AlertTriangle, Check, X as XIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PhotoConflict, PhotoFile } from "@/lib/types/photo-import";

interface PhotoImportStepConflictsProps {
  conflicts: PhotoConflict[];
  photoFiles: PhotoFile[];
  onResolve: (participantId: string, resolution: "replace" | "skip" | "keep") => void;
  onResolveAll: (resolution: "replace" | "skip" | "keep") => void;
}

export function PhotoImportStepConflicts({
  conflicts,
  photoFiles,
  onResolve,
  onResolveAll,
}: PhotoImportStepConflictsProps) {
  const getPhotoFile = (photoFileId: string): PhotoFile | undefined => {
    return photoFiles.find((f) => f.id === photoFileId);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="border-amber-200 bg-amber-50">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-800">
              {conflicts.length} conflit(s) détecté(s)
            </h3>
            <p className="text-sm text-amber-700 mt-1">
              Certains participants ont déjà une photo. Choisissez comment résoudre
              ces conflits.
            </p>
          </div>
        </div>
      </Card>

      {/* Actions bulk */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onResolveAll("replace")}
        >
          Tout remplacer
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onResolveAll("skip")}
        >
          Tout ignorer
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onResolveAll("keep")}
        >
          Tout garder
        </Button>
      </div>

      {/* Liste des conflits */}
      <div className="space-y-3">
        {conflicts.map((conflict) => {
          const photo = getPhotoFile(conflict.newPhotoFileId);

          return (
            <Card key={conflict.participantId} padding="md">
              <div className="flex items-start gap-4">
                {/* Photos */}
                <div className="flex items-center gap-2">
                  {/* Nouvelle photo */}
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 border-2 border-dashed border-gray-300">
                      {photo && (
                        <img
                          src={photo.previewUrl}
                          alt={photo.fileName}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Nouvelle</p>
                  </div>

                  {/* Flèche */}
                  <div className="text-gray-400">→</div>

                  {/* Photo existante */}
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                      {conflict.existingPhotoUrl && (
                        <img
                          src={conflict.existingPhotoUrl}
                          alt="Existante"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Existante</p>
                  </div>
                </div>

                {/* Infos */}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {conflict.participantName}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Ce participant a déjà une photo pour le champ "{conflict.fieldKey}"
                  </p>
                </div>

                {/* Résolution */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onResolve(conflict.participantId, "replace")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      conflict.resolution === "replace"
                        ? "bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Remplacer
                  </button>
                  <button
                    onClick={() => onResolve(conflict.participantId, "skip")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      conflict.resolution === "skip"
                        ? "bg-amber-100 text-amber-700 ring-2 ring-amber-500"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Ignorer
                  </button>
                  <button
                    onClick={() => onResolve(conflict.participantId, "keep")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      conflict.resolution === "keep"
                        ? "bg-green-100 text-green-700 ring-2 ring-green-500"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Garder
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
