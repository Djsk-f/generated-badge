/**
 * Composant formulaire de création/édition d'événement.
 *
 * @module components/events/event-form
 */

"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createEventAction } from "@/app/(dashboard)/events/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { BADGE_SIZES } from "@/lib/types";

export function EventForm() {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const result = await createEventAction(formData);
      return result;
    },
    null
  );

  // Toast sur changement d'état
  useEffect(() => {
    if (state && !state.success && state.error) {
      toast.error("Erreur", { description: state.error });
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      {state && !state.success && state.details && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">
          {Object.entries(state.details).map(([field, errors]) => (
            <p key={field}>{errors.join(", ")}</p>
          ))}
        </div>
      )}

      {/* Informations générales */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Informations générales
        </h2>
        <div className="space-y-4">
          <Input
            name="name"
            label="Nom de l&apos;événement"
            placeholder="Camp Jeunesse 2026"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                         outline-none transition-colors"
              placeholder="Description optionnelle..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input name="location" label="Lieu" placeholder="Paris, France" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input name="start_date" label="Date de début" type="date" />
            <Input name="end_date" label="Date de fin" type="date" />
          </div>
        </div>
      </Card>

      {/* Configuration du badge */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Dimensions du badge
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Vous pourrez créer et personnaliser le template de badge après la
          création de l&apos;événement.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Format prédéfini
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                         outline-none transition-colors"
              onChange={(e) => {
                const size =
                  BADGE_SIZES[e.target.value as keyof typeof BADGE_SIZES];
                if (size && e.target.value !== "CUSTOM") {
                  const widthInput = document.querySelector(
                    'input[name="badge_width_mm"]'
                  ) as HTMLInputElement;
                  const heightInput = document.querySelector(
                    'input[name="badge_height_mm"]'
                  ) as HTMLInputElement;
                  if (widthInput) widthInput.value = String(size.width);
                  if (heightInput) heightInput.value = String(size.height);
                }
              }}
            >
              {Object.entries(BADGE_SIZES).map(([key, size]) => (
                <option key={key} value={key}>
                  {size.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              name="badge_width_mm"
              label="Largeur (mm)"
              type="number"
              defaultValue={85.6}
              min={30}
              max={300}
              step={0.1}
            />
            <Input
              name="badge_height_mm"
              label="Hauteur (mm)"
              type="number"
              defaultValue={53.98}
              min={30}
              max={300}
              step={0.1}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Orientation
              </label>
              <select
                name="badge_orientation"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                           outline-none transition-colors"
              >
                <option value="landscape">Paysage</option>
                <option value="portrait">Portrait</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Annuler
        </Button>
        <Button type="submit" loading={isPending}>
          Créer l&apos;événement
        </Button>
      </div>
    </form>
  );
}
