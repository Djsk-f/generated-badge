/**
 * Étape 2 : Matching automatique des photos avec les participants.
 *
 * @module components/participants/photo-import/photo-import-step-match
 */

"use client";

import { useEffect } from "react";
import { Check, AlertCircle, HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PhotoFile, PhotoMatch } from "@/lib/types/photo-import";
import type { Participant, FieldDefinition } from "@/lib/types";

interface PhotoImportStepMatchProps {
  photoFiles: PhotoFile[];
  participants: Participant[];
  imageFields: FieldDefinition[];
  matches: PhotoMatch[];
  targetFieldKey: string;
  onAutoMatch: () => void;
  onUpdateMatch: (match: PhotoMatch) => void;
  onSetTargetField: (fieldKey: string) => void;
}

const CONFIDENCE_CONFIG = {
  exact: { label: "Exact", color: "bg-green-100 text-green-700", icon: Check },
  partial: { label: "Partiel", color: "bg-yellow-100 text-yellow-700", icon: HelpCircle },
  manual: { label: "Manuel", color: "bg-blue-100 text-blue-700", icon: HelpCircle },
  none: { label: "Aucun", color: "bg-red-100 text-red-700", icon: AlertCircle },
};

export function PhotoImportStepMatch({
  photoFiles,
  participants,
  imageFields,
  matches,
  targetFieldKey,
  onAutoMatch,
  onUpdateMatch,
  onSetTargetField,
}: PhotoImportStepMatchProps) {
  // Lancer le matching automatique au montage
  useEffect(() => {
    if (matches.length === 0 && participants.length > 0) {
      onAutoMatch();
    }
  }, []);

  const getParticipantName = (participantId: string): string => {
    const p = participants.find((pt) => pt.id === participantId);
    if (!p) return "Inconnu";
    return p.field_values[targetFieldKey] || Object.values(p.field_values)[0] || "Sans nom";
  };

  const getPhotoFile = (photoFileId: string): PhotoFile | undefined => {
    return photoFiles.find((f) => f.id === photoFileId);
  };

  const exactCount = matches.filter((m) => m.confidence === "exact").length;
  const partialCount = matches.filter((m) => m.confidence === "partial").length;
  const noneCount = matches.filter((m) => m.confidence === "none").length;

  return (
    <div className="space-y-4">
      {/* Sélection du champ cible */}
      <Card>
        <h3 className="font-medium text-gray-900 mb-3">Champ photo cible</h3>
        <div className="flex gap-2">
          {imageFields.map((field) => (
            <button
              key={field.key}
              onClick={() => onSetTargetField(field.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                targetFieldKey === field.key
                  ? "text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              style={
                targetFieldKey === field.key
                  ? { background: "var(--gradient-primary)" }
                  : undefined
              }
            >
              {field.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Stats */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-sm text-gray-600">{exactCount} exact(s)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-500" />
          <span className="text-sm text-gray-600">{partialCount} partiel(s)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-sm text-gray-600">{noneCount} non trouvé(s)</span>
        </div>
      </div>

      {/* Table de matching */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Photo
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Nom du fichier
                </th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">
                  →
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Participant
                </th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">
                  Confiance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {matches.map((match) => {
                const photo = getPhotoFile(match.photoFileId);
                if (!photo) return null;

                const config = CONFIDENCE_CONFIG[match.confidence];
                const Icon = config.icon;

                return (
                  <tr key={match.photoFileId} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200">
                        <img
                          src={photo.previewUrl}
                          alt={photo.fileName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{photo.fileName}</td>
                    <td className="py-3 px-4 text-center text-gray-400">→</td>
                    <td className="py-3 px-4">
                      <select
                        value={match.participantId || ""}
                        onChange={(e) => {
                          const participantId = e.target.value || null;
                          onUpdateMatch({
                            ...match,
                            participantId,
                            confidence: participantId ? "manual" : "none",
                          });
                        }}
                        className="w-full px-2 py-1 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        <option value="">— Sélectionner —</option>
                        {participants.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.field_values[targetFieldKey] ||
                              Object.values(p.field_values)[0] ||
                              "Sans nom"}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}
                      >
                        <Icon className="w-3 h-3" />
                        {config.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
