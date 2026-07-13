/**
 * Étape 5 : Résumé de l'import.
 *
 * @module components/participants/photo-import/photo-import-step-summary
 */

"use client";

import { Check, X, AlertCircle, Camera } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PhotoFile, UploadResult } from "@/lib/types/photo-import";

interface PhotoImportStepSummaryProps {
  photoFiles: PhotoFile[];
  uploadResults: UploadResult[];
  totalParticipants: number;
  onClose: () => void;
  onRetry: () => void;
}

export function PhotoImportStepSummary({
  photoFiles,
  uploadResults,
  totalParticipants,
  onClose,
  onRetry,
}: PhotoImportStepSummaryProps) {
  const succeeded = uploadResults.filter((r) => r.success).length;
  const failed = uploadResults.filter((r) => !r.success).length;
  const skipped = photoFiles.length - uploadResults.length;

  // Calculer les gains de compression
  const originalSize = photoFiles.reduce((acc, f) => acc + f.file.size, 0);
  const compressedSize = photoFiles.reduce(
    (acc, f) => acc + (f.compressedSize || f.file.size),
    0
  );
  const savedBytes = originalSize - compressedSize;
  const savedPercent = originalSize > 0 ? Math.round((savedBytes / originalSize) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">
          Import terminé !
        </h3>
        <p className="text-gray-500 mt-1">
          Les photos ont été associées aux participants
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="text-center">
          <div className="w-10 h-10 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-2">
            <Check className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{succeeded}</p>
          <p className="text-sm text-gray-500">Réussies</p>
        </Card>

        <Card className="text-center">
          <div className="w-10 h-10 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-2">
            <X className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{failed}</p>
          <p className="text-sm text-gray-500">Échouées</p>
        </Card>

        {skipped > 0 && (
          <Card className="text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{skipped}</p>
            <p className="text-sm text-gray-500">Ignorées</p>
          </Card>
        )}

        <Card className="text-center">
          <div className="w-10 h-10 mx-auto rounded-full bg-indigo-100 flex items-center justify-center mb-2">
            <Camera className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalParticipants}</p>
          <p className="text-sm text-gray-500">Participants</p>
        </Card>
      </div>

      {/* Gain de compression */}
      {savedBytes > 0 && (
        <Card className="bg-green-50 border-green-200">
          <div className="text-center">
            <p className="text-sm text-green-700">
              <span className="font-semibold">{savedPercent}%</span> d&apos;espace
              économisé grâce à la compression
            </p>
            <p className="text-xs text-green-600 mt-1">
              {(originalSize / 1024 / 1024).toFixed(1)} Mo →{" "}
              {(compressedSize / 1024 / 1024).toFixed(1)} Mo
            </p>
          </div>
        </Card>
      )}

      {/* Erreurs */}
      {failed > 0 && (
        <Card className="border-red-200 bg-red-50">
          <h4 className="font-medium text-red-800 mb-2">Fichiers en erreur</h4>
          <ul className="text-sm text-red-700 space-y-1">
            {uploadResults
              .filter((r) => !r.success)
              .slice(0, 5)
              .map((r, i) => (
                <li key={i}>
                  {r.photoFileId} — {r.error || "Erreur inconnue"}
                </li>
              ))}
          </ul>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-center gap-3">
        {failed > 0 && (
          <Button variant="outline" onClick={onRetry}>
            Réessayer les erreurs
          </Button>
        )}
        <Button onClick={onClose}>Terminé</Button>
      </div>
    </div>
  );
}
