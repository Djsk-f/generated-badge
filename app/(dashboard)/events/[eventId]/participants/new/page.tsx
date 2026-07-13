/**
 * Page d'ajout manuel d'un participant.
 * Le formulaire est généré dynamiquement depuis les FieldDefinitions de l'événement.
 *
 * @module app/(dashboard)/events/[eventId]/participants/new/page
 */

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, UserPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, INPUT_CLASSES } from "@/components/ui/input";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { createParticipantAction } from "../actions";
import type { FieldDefinition } from "@/lib/types";

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

export default function NewParticipantPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const router = useRouter();

  const [fieldDefinitions, setFieldDefinitions] = useState<FieldDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/field-definitions?event_id=${eventId}`);
        if (res.ok) {
          const data = await res.json();
          setFieldDefinitions(data.fieldDefinitions ?? []);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [eventId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const fieldValues: Record<string, string> = {};

    for (const fd of fieldDefinitions) {
      if (fd.field_type === "MULTI_SELECT") {
        const checked = formData.getAll(fd.key);
        if (checked.length > 0) {
          fieldValues[fd.key] = checked.join(", ");
        }
      } else if (fd.field_type === "BOOLEAN") {
        fieldValues[fd.key] = formData.get(fd.key) === "on" ? "true" : "false";
      } else {
        const val = formData.get(fd.key);
        if (val !== null && val !== "") {
          fieldValues[fd.key] = String(val);
        }
      }
    }

    try {
      const result = await createParticipantAction(eventId, fieldValues);
      if (result.success) {
        toast.success("Participant ajouté avec succès !");
        router.push(`/events/${eventId}/participants`);
      } else {
        setError(result.error);
        toast.error("Erreur", { description: result.error });
      }
    } catch {
      const errorMsg = "Erreur lors de la création";
      setError(errorMsg);
      toast.error("Erreur", { description: errorMsg });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Chargement du formulaire...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Événements", href: "/events" },
          { label: "...", href: `/events/${eventId}` },
          { label: "Participants", href: `/events/${eventId}/participants` },
          { label: "Ajouter" },
        ]}
      />

      <div className="flex items-center gap-4">
        <Link
          href={`/events/${eventId}/participants`}
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ajouter un participant</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Remplissez les informations du participant.
          </p>
        </div>
      </div>

      {fieldDefinitions.length === 0 ? (
        <Card padding="lg">
          <div className="text-center text-gray-500 py-8">
            <p className="mb-2">
              Aucun champ défini pour cet événement.
            </p>
            <p className="text-sm">
              Assignez un template à l&apos;événement pour générer les champs automatiquement.
            </p>
            <Link href={`/events/${eventId}`} className="mt-3 inline-block">
              <Button size="sm" variant="outline">Retour à l&apos;événement</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Card padding="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            {fieldDefinitions
              .filter((f) => f.visible_in_form)
              .map((fd) => (
                <DynamicField key={fd.id} field={fd} />
              ))}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Link href={`/events/${eventId}/participants`}>
                <Button type="button" variant="outline">Annuler</Button>
              </Link>
              <Button type="submit" loading={submitting}>
                <UserPlus className="w-4 h-4" />
                Ajouter
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
