/**
 * Page de génération de badges par batch.
 *
 * @module app/(dashboard)/events/[eventId]/badges/generate/page
 */

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Play,
  Check,
  AlertCircle,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { createBadgesAction, updateBadgeStatusAction } from "../actions";

interface Participant {
  id: string;
  field_values: Record<string, string>;
}

export default function GenerateBadgesPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const router = useRouter();

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [displayNameKey, setDisplayNameKey] = useState<string | null>(null);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    count: number;
  } | null>(null);

  // Charger les participants + le champ d'affichage
  useEffect(() => {
    async function load() {
      const [pRes, fdRes] = await Promise.all([
        fetch(`/api/participants/${eventId}`),
        fetch(`/api/field-definitions?event_id=${eventId}`),
      ]);
      if (pRes.ok) {
        const data = await pRes.json();
        setParticipants(data.participants ?? []);
      }
      if (fdRes.ok) {
        const fdData = await fdRes.json();
        const displayField = (fdData.fieldDefinitions ?? []).find(
          (f: { is_display_name: boolean }) => f.is_display_name
        );
        setDisplayNameKey(displayField?.key ?? null);
      }
    }
    load();
  }, [eventId]);

  const getDisplayName = (fv: Record<string, string>) => {
    if (displayNameKey && fv[displayNameKey]) return fv[displayNameKey];
    return Object.values(fv).find((v) => v) ?? "";
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === participants.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(participants.map((p) => p.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleGenerate = async () => {
    if (selectedIds.size === 0) return;

    setGenerating(true);
    setProgress({ current: 0, total: selectedIds.size });
    setResult(null);

    try {
      // 1. Créer les badges READY
      const batchResult = await createBadgesAction(
        eventId,
        Array.from(selectedIds),
        1
      );

      if (!batchResult.success || !batchResult.data) {
        const errorMsg = "Erreur lors de la création des badges";
        setResult({
          success: false,
          message: errorMsg,
          count: 0,
        });
        toast.error("Erreur", { description: errorMsg });
        return;
      }

      // 2. Simuler la génération (en prod: appeler l'API PDF)
      const badges = batchResult.data;
      let generated = 0;

      for (const badge of badges) {
        setProgress((prev) => ({ ...prev, current: prev.current + 1 }));

        // Simuler un délai de génération
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Marquer comme généré
        await updateBadgeStatusAction(badge.id, "GENERATED", eventId);
        generated++;
      }

      setResult({
        success: true,
        message: `${generated} badge(s) généré(s) avec succès`,
        count: generated,
      });
      toast.success(`${generated} badge(s) généré(s) avec succès !`);
    } catch {
      const errorMsg = "Erreur lors de la génération";
      setResult({
        success: false,
        message: errorMsg,
        count: 0,
      });
      toast.error("Erreur", { description: errorMsg });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Navigation */}
      <Link
        href={`/events/${eventId}/badges`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux badges
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Générer des badges
        </h1>
        <p className="text-gray-500 mt-1">
          Sélectionnez les participants et lancez la génération
        </p>
      </div>

      {/* Sélection */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>
            Participants ({participants.length})
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={toggleSelectAll}>
            {selectedIds.size === participants.length
              ? "Tout désélectionner"
              : "Tout sélectionner"}
          </Button>
        </div>

        {participants.length > 0 ? (
          <div className="max-h-96 overflow-y-auto space-y-2">
            {participants.map((p) => (
              <label
                key={p.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(p.id)}
                  onChange={() => toggleSelect(p.id)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {getDisplayName(p.field_values) || "Participant"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {Object.entries(p.field_values).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                  </p>
                </div>
              </label>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            Aucun participant disponible.
            <br />
            <Link
              href={`/events/${eventId}/participants`}
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              Ajouter des participants
            </Link>
          </p>
        )}
      </Card>

      {/* Progression */}
      {generating && (
        <Card>
          <div className="flex items-center gap-4">
            <div className="animate-spin">
              <BadgeCheck className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Génération en cours...
              </p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${(progress.current / progress.total) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {progress.current} / {progress.total}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Résultat */}
      {result && (
        <Card>
          <div className="flex items-center gap-4">
            {result.success ? (
              <Check className="w-8 h-8 text-green-500" />
            ) : (
              <AlertCircle className="w-8 h-8 text-red-500" />
            )}
            <div>
              <p className={`font-medium ${result.success ? "text-green-700" : "text-red-700"}`}>
                {result.message}
              </p>
              {result.success && (
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => router.push(`/events/${eventId}/badges`)}
                >
                  Voir les badges
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Actions */}
      {selectedIds.size > 0 && !generating && !result && (
        <div className="flex justify-end">
          <Button onClick={handleGenerate}>
            <Play className="w-4 h-4" />
            Générer {selectedIds.size} badge(s)
          </Button>
        </div>
      )}
    </div>
  );
}
