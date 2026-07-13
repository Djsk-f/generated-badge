/**
 * Étape 4 : Upload des photos avec progression.
 *
 * @module components/participants/photo-import/photo-import-step-upload
 */

"use client";

import { useEffect, useState } from "react";
import { Check, X, Loader2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PhotoFile, PhotoMatch } from "@/lib/types/photo-import";
import type { useParallelUploader } from "@/hooks/use-parallel-uploader";

interface PhotoImportStepUploadProps {
  photoFiles: PhotoFile[];
  matches: PhotoMatch[];
  onCompress: () => Promise<void>;
  onStartUpload: () => Promise<void>;
  uploader: ReturnType<typeof useParallelUploader>;
}

export function PhotoImportStepUpload({
  photoFiles,
  matches,
  onCompress,
  onStartUpload,
  uploader,
}: PhotoImportStepUploadProps) {
  const [phase, setPhase] = useState<"compress" | "upload" | "done">("compress");
  const [compressProgress, setCompressProgress] = useState(0);

  // Lancer la compression au montage
  useEffect(() => {
    const run = async () => {
      try {
        await onCompress();
        setPhase("upload");
      } catch (error) {
        console.error("Erreur de compression:", error);
      }
    };
    run();
  }, []);

  // Lancer l'upload après compression
  useEffect(() => {
    if (phase === "upload") {
      onStartUpload();
    }
  }, [phase]);

  // Détecter la fin de l'upload
  useEffect(() => {
    if (phase === "upload" && !uploader.isUploading && uploader.completedCount > 0) {
      setPhase("done");
    }
  }, [phase, uploader.isUploading, uploader.completedCount]);

  const uploadedCount = uploader.queue.filter((q) => q.status === "uploaded").length;
  const failedCount = uploader.queue.filter((q) => q.status === "failed").length;

  return (
    <div className="space-y-4">
      {/* Progression globale */}
      <Card>
        <div className="space-y-4">
          {/* Phase actuelle */}
          <div className="flex items-center gap-3">
            {phase === "compress" && (
              <>
                <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                <span className="font-medium text-gray-900">
                  Compression des images...
                </span>
              </>
            )}
            {phase === "upload" && (
              <>
                <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                <span className="font-medium text-gray-900">
                  Upload en cours...
                </span>
              </>
            )}
            {phase === "done" && (
              <>
                <Check className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900">Terminé !</span>
              </>
            )}
          </div>

          {/* Barre de progression */}
          <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
              style={{
                width: `${uploader.progress}%`,
                background: "var(--gradient-primary)",
              }}
            />
          </div>

          {/* Stats */}
          <div className="flex justify-between text-sm text-gray-600">
            <span>
              {uploader.completedCount}/{uploader.totalCount} photos
            </span>
            <span>{uploader.progress}%</span>
          </div>
        </div>
      </Card>

      {/* Détails par fichier */}
      {uploader.queue.length > 0 && (
        <Card padding="none">
          <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
            {uploader.queue.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 px-4 py-2"
              >
                {/* Statut */}
                <div className="w-6 h-6 flex items-center justify-center">
                  {item.status === "pending" && (
                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                  )}
                  {item.status === "uploading" && (
                    <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                  )}
                  {item.status === "uploaded" && (
                    <Check className="w-4 h-4 text-green-600" />
                  )}
                  {item.status === "failed" && (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                </div>

                {/* Nom */}
                <span className="text-sm text-gray-700 flex-1 truncate">
                  {item.fileName}
                </span>

                {/* Erreur */}
                {item.error && (
                  <span className="text-xs text-red-500 truncate max-w-[200px]">
                    {item.error}
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Bouton annuler */}
      {uploader.isUploading && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={uploader.cancel}>
            Annuler l&apos;upload
          </Button>
        </div>
      )}
    </div>
  );
}
