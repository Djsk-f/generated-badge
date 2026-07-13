/**
 * Formulaire de création d'un template global.
 *
 * @module components/templates/template-create-form
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { BADGE_SIZES } from "@/lib/types";

export function TemplateCreateForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [widthMm, setWidthMm] = useState(85.6);
  const [heightMm, setHeightMm] = useState(53.98);
  const [orientation, setOrientation] = useState<"landscape" | "portrait">("landscape");
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [bgPreview, setBgPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("Le fichier ne doit pas dépasser 10 Mo");
      return;
    }

    setBgFile(file);
    setBgPreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleSizePreset = (key: string) => {
    const size = BADGE_SIZES[key as keyof typeof BADGE_SIZES];
    if (size && key !== "CUSTOM") {
      setWidthMm(size.width);
      setHeightMm(size.height);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Le nom est requis");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Créer le template
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          width_mm: widthMm,
          height_mm: heightMm,
          orientation,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const templateId = data.data.id;

      // 2. Upload le fond si présent
      if (bgFile) {
        const formData = new FormData();
        formData.append("file", bgFile);
        formData.append("template_id", templateId);

        const uploadRes = await fetch("/api/templates/background", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const uploadData = await uploadRes.json();
          throw new Error(uploadData.error);
        }
      }

      // 3. Rediriger vers l'éditeur
      router.push(`/templates/${templateId}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMsg);
      toast.error("Erreur", { description: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Nom */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Informations
        </h2>
        <div className="space-y-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            label="Nom du template"
            placeholder="Mon badge premium"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                         outline-none transition-colors"
              placeholder="Description optionnelle..."
            />
          </div>
        </div>
      </Card>

      {/* Fond d'image */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Fond d&apos;image
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Importez une image PNG ou JPG créée dans Canva, Figma ou un autre
          outil de design.
        </p>

        <div className="flex items-start gap-6">
          <label className="flex-1 cursor-pointer">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                bgPreview
                  ? "border-green-300 bg-green-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              {bgPreview ? (
                <div className="space-y-3">
                  <img
                    src={bgPreview}
                    alt="Aperçu"
                    className="max-h-40 mx-auto rounded"
                  />
                  <p className="text-sm text-green-600 font-medium">
                    Image sélectionnée
                  </p>
                  <p className="text-xs text-gray-500">Cliquez pour changer</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-sm font-medium text-gray-700">
                    Glissez-déposez ou cliquez
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG — max 10 Mo</p>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {!bgPreview && (
            <div className="flex-1 aspect-[85.6/53.98] bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Image className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="text-xs text-gray-400 mt-1">Aperçu du badge</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Dimensions */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Dimensions
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Format prédéfini
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                         outline-none transition-colors"
              onChange={(e) => handleSizePreset(e.target.value)}
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
              label="Largeur (mm)"
              type="number"
              value={widthMm}
              onChange={(e) => setWidthMm(Number(e.target.value))}
              min={30}
              max={300}
              step={0.1}
            />
            <Input
              label="Hauteur (mm)"
              type="number"
              value={heightMm}
              onChange={(e) => setHeightMm(Number(e.target.value))}
              min={30}
              max={300}
              step={0.1}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Orientation
              </label>
              <select
                value={orientation}
                onChange={(e) =>
                  setOrientation(e.target.value as "landscape" | "portrait")
                }
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
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Annuler
        </Button>
        <Button type="submit" loading={loading}>
          Créer et éditer
        </Button>
      </div>
    </form>
  );
}
