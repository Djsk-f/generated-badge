/**
 * Dialog principal pour l'import de photos.
 *
 * Wizard en 5 étapes : Sélection → Matching → Conflits → Upload → Résumé
 *
 * @module components/participants/photo-import/photo-import-dialog
 */

"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePhotoImport } from "@/hooks/use-photo-import";
import type { Participant, FieldDefinition } from "@/lib/types";
import { PhotoImportStepSelect } from "./photo-import-step-select";
import { PhotoImportStepMatch } from "./photo-import-step-match";
import { PhotoImportStepConflicts } from "./photo-import-step-conflicts";
import { PhotoImportStepUpload } from "./photo-import-step-upload";
import { PhotoImportStepSummary } from "./photo-import-step-summary";

interface PhotoImportDialogProps {
  eventId: string;
  open: boolean;
  onClose: () => void;
  participants: Participant[];
  imageFields: FieldDefinition[];
}

const STEPS = [
  { key: "select", label: "Sélection" },
  { key: "match", label: "Matching" },
  { key: "conflicts", label: "Conflits" },
  { key: "upload", label: "Upload" },
  { key: "summary", label: "Résumé" },
];

export function PhotoImportDialog({
  eventId,
  open,
  onClose,
  participants,
  imageFields,
}: PhotoImportDialogProps) {
  const photoImport = usePhotoImport(eventId);

  // Initialiser les participants et fields quand le dialog s'ouvre
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      photoImport.state.participants.length === 0 &&
        photoImport.autoMatch(); // Sera appelé après setParticipans
    }
    if (!isOpen) {
      photoImport.reset();
    }
  };

  // Calculer l'index de l'étape active
  const stepIndex = STEPS.findIndex((s) => s.key === photoImport.state.step);

  // Déterminer si on doit afficher les conflits
  const visibleSteps = STEPS.filter(
    (s) => s.key !== "conflicts" || photoImport.conflictCount > 0
  );
  const visibleStepIndex = visibleSteps.findIndex(
    (s) => s.key === photoImport.state.step
  );

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-4xl max-h-[90vh] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                Importer des photos
              </Dialog.Title>
              <Dialog.Description className="text-sm text-gray-500 mt-0.5">
                Associez des photos aux participants par nom de fichier
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Step indicator */}
          <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2">
              {visibleSteps.map((step, i) => (
                <div key={step.key} className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                      i < visibleStepIndex
                        ? "bg-green-100 text-green-700"
                        : i === visibleStepIndex
                        ? "text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                    style={
                      i === visibleStepIndex
                        ? { background: "var(--gradient-primary)" }
                        : undefined
                    }
                  >
                    {i < visibleStepIndex ? "✓" : i + 1}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      i === visibleStepIndex ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>
                  {i < visibleSteps.length - 1 && (
                    <div className="w-8 h-px bg-gray-200 mx-1" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {photoImport.state.step === "select" && (
              <PhotoImportStepSelect
                photoFiles={photoImport.state.photoFiles}
                onAddFiles={photoImport.addFiles}
                onRemoveFile={photoImport.removeFile}
              />
            )}

            {photoImport.state.step === "match" && (
              <PhotoImportStepMatch
                photoFiles={photoImport.state.photoFiles}
                participants={participants}
                imageFields={imageFields}
                matches={photoImport.state.matches}
                targetFieldKey={photoImport.state.targetFieldKey}
                onAutoMatch={photoImport.autoMatch}
                onUpdateMatch={photoImport.updateMatch}
                onSetTargetField={photoImport.setTargetField}
              />
            )}

            {photoImport.state.step === "conflicts" && (
              <PhotoImportStepConflicts
                conflicts={photoImport.state.conflicts}
                photoFiles={photoImport.state.photoFiles}
                onResolve={photoImport.resolveConflict}
                onResolveAll={photoImport.resolveAllConflicts}
              />
            )}

            {photoImport.state.step === "upload" && (
              <PhotoImportStepUpload
                photoFiles={photoImport.state.photoFiles}
                matches={photoImport.state.matches}
                onCompress={photoImport.compressAll}
                onStartUpload={photoImport.startUpload}
                uploader={photoImport.uploader}
              />
            )}

            {photoImport.state.step === "summary" && (
              <PhotoImportStepSummary
                photoFiles={photoImport.state.photoFiles}
                uploadResults={photoImport.state.uploadResults}
                totalParticipants={participants.length}
                onClose={onClose}
                onRetry={() => photoImport.setStep("upload")}
              />
            )}
          </div>

          {/* Footer */}
          {photoImport.state.step !== "summary" && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50/50">
              <Button
                variant="ghost"
                onClick={
                  photoImport.state.step === "select"
                    ? onClose
                    : photoImport.goBack
                }
              >
                {photoImport.state.step === "select" ? "Annuler" : "Retour"}
              </Button>

              <div className="flex items-center gap-3">
                {photoImport.state.step === "match" && (
                  <span className="text-sm text-gray-500">
                    {photoImport.matchedCount}/{photoImport.totalPhotos} correspondances
                  </span>
                )}

                {photoImport.state.step !== "upload" && (
                  <Button
                    onClick={photoImport.goNext}
                    disabled={!photoImport.canProceed}
                  >
                    {photoImport.state.step === "conflicts"
                      ? "Confirmer"
                      : "Suivant"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
