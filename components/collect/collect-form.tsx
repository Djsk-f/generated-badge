"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, INPUT_CLASSES } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type { FieldDefinition } from "@/lib/types";

interface CollectFormProps {
  eventId: string;
  fieldDefinitions: FieldDefinition[];
}

// INPUT_CLASSES imported from @/components/ui/input

function DynamicField({ field }: { field: FieldDefinition }) {
  const inputId = `field-${field.key}`;
  const required = field.required;

  const label = (
    <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
      {field.label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );

  switch (field.field_type) {
    case "TEXTAREA":
      return (
        <div className="space-y-1">
          {label}
          <textarea
            id={inputId}
            name={field.key}
            required={required}
            placeholder={field.placeholder ?? undefined}
            defaultValue={field.default_value ?? undefined}
            rows={3}
            className={`${INPUT_CLASSES} resize-y`}
          />
        </div>
      );

    case "NUMBER":
      return (
        <Input
          id={inputId}
          name={field.key}
          label={field.label}
          type="number"
          required={required}
          placeholder={field.placeholder ?? undefined}
          defaultValue={field.default_value ?? undefined}
        />
      );

    case "EMAIL":
      return (
        <Input
          id={inputId}
          name={field.key}
          label={field.label}
          type="email"
          required={required}
          placeholder={field.placeholder ?? undefined}
          defaultValue={field.default_value ?? undefined}
        />
      );

    case "PHONE":
      return (
        <Input
          id={inputId}
          name={field.key}
          label={field.label}
          type="tel"
          required={required}
          placeholder={field.placeholder ?? undefined}
          defaultValue={field.default_value ?? undefined}
        />
      );

    case "DATE":
      return (
        <Input
          id={inputId}
          name={field.key}
          label={field.label}
          type="date"
          required={required}
          defaultValue={field.default_value ?? undefined}
        />
      );

    case "BOOLEAN":
      return (
        <div className="space-y-1">
          {label}
          <div className="flex items-center gap-3 pt-1">
            <input
              id={inputId}
              name={field.key}
              type="checkbox"
              defaultChecked={field.default_value === "true"}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-500">{field.placeholder ?? "Activé"}</span>
          </div>
        </div>
      );

    case "SELECT":
      return (
        <div className="space-y-1">
          {label}
          <select
            id={inputId}
            name={field.key}
            required={required}
            defaultValue={field.default_value ?? ""}
            className={INPUT_CLASSES}
          >
            <option value="" disabled>
              {field.placeholder ?? "Sélectionnez..."}
            </option>
            {field.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );

    case "MULTI_SELECT":
      return (
        <div className="space-y-1">
          {label}
          <div className="space-y-1 pt-1">
            {field.options.map((opt) => (
              <label key={opt} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  name={field.key}
                  value={opt}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      );

    case "URL":
      return (
        <Input
          id={inputId}
          name={field.key}
          label={field.label}
          type="url"
          required={required}
          placeholder={field.placeholder ?? "https://..."}
          defaultValue={field.default_value ?? undefined}
        />
      );

    case "COLOR":
      return (
        <div className="space-y-1">
          {label}
          <input
            id={inputId}
            name={field.key}
            type="color"
            required={required}
            defaultValue={field.default_value ?? "#000000"}
            className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
          />
        </div>
      );

    case "IMAGE":
    case "QRCODE":
    case "BARCODE":
      return (
        <Input
          id={inputId}
          name={field.key}
          label={field.label}
          type="url"
          required={required}
          placeholder={field.placeholder ?? "URL de l'image"}
          defaultValue={field.default_value ?? undefined}
        />
      );

    case "TEXT":
    default:
      return (
        <Input
          id={inputId}
          name={field.key}
          label={field.label}
          type="text"
          required={required}
          placeholder={field.placeholder ?? undefined}
          defaultValue={field.default_value ?? undefined}
        />
      );
  }
}

export function CollectForm({ eventId, fieldDefinitions }: CollectFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visibleFields = fieldDefinitions.filter((f) => f.visible_in_form);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const fieldValues: Record<string, string> = {};

    formData.forEach((value, key) => {
      if (typeof value !== "string") return;
      fieldValues[key] = value;
    });

    // Collect multi-select values
    const multiSelectFields = visibleFields.filter((f) => f.field_type === "MULTI_SELECT");
    for (const f of multiSelectFields) {
      const values = formData.getAll(f.key).filter((v): v is string => typeof v === "string");
      if (values.length > 0) {
        fieldValues[f.key] = values.join(",");
      }
    }

    try {
      const res = await fetch("/api/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: eventId,
          field_values: fieldValues,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        const errorMsg = result.error ?? "Une erreur est survenue";
        setError(errorMsg);
        toast.error("Erreur", { description: errorMsg });
        return;
      }

      setSuccess(true);
      toast.success("Inscription confirmée !");
    } catch {
      const errorMsg = "Erreur réseau. Veuillez réessayer.";
      setError(errorMsg);
      toast.error("Erreur", { description: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Inscription confirmée !
        </h2>
        <p className="text-gray-500">
          Votre badge sera prêt lors de l&apos;événement.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Inscrivez-vous
      </h2>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {visibleFields.length === 0 ? (
          <p className="text-sm text-gray-500">
            Aucun champ à remplir pour cet événement.
          </p>
        ) : (
          visibleFields.map((field) => (
            <DynamicField key={field.id} field={field} />
          ))
        )}

        <Button type="submit" className="w-full" disabled={loading || visibleFields.length === 0}>
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Send className="w-4 h-4 mr-2" />
          )}
          S&apos;inscrire
        </Button>
      </form>
    </Card>
  );
}
