/**
 * Composant de mapping des colonnes Excel vers les FieldDefinitions.
 *
 * Le mapping est libre — l'utilisateur choisit quelle colonne correspond à quel champ.
 *
 * @module components/participants/column-mapper
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { Check, AlertCircle, Loader2 } from "lucide-react";
import type { FieldDefinition } from "@/lib/types";

/** Mapping Excel column → field definition key */
export interface ColumnMapping {
  [excelColumn: string]: string;
}

interface Props {
  fieldDefinitions: FieldDefinition[];
  detectedColumns: string[];
  loading: boolean;
  onChange: (mapping: ColumnMapping) => void;
}

/**
 * Attempts to auto-match Excel columns to field keys by name similarity.
 */
function autoMatch(
  fieldDefinitions: FieldDefinition[],
  detectedColumns: string[]
): ColumnMapping {
  const mapping: ColumnMapping = {};
  const used = new Set<string>();

  for (const fd of fieldDefinitions) {
    const candidates = [
      fd.label.toLowerCase(),
      fd.key.toLowerCase(),
    ];

    for (const col of detectedColumns) {
      if (used.has(col)) continue;
      const colLower = col.toLowerCase().trim();
      for (const c of candidates) {
        if (colLower === c || colLower.includes(c) || c.includes(colLower)) {
          mapping[col] = fd.key;
          used.add(col);
          break;
        }
      }
      if (mapping[col]) break;
    }
  }

  return mapping;
}

export function ColumnMapper({
  fieldDefinitions,
  detectedColumns,
  loading,
  onChange,
}: Props) {
  const [mapping, setMapping] = useState<ColumnMapping>({});

  // Auto-match on first data load
  useEffect(() => {
    if (detectedColumns.length > 0 && fieldDefinitions.length > 0) {
      setMapping(autoMatch(fieldDefinitions, detectedColumns));
    }
  }, [detectedColumns, fieldDefinitions]);

  // Notify parent on mapping change
  useEffect(() => {
    onChange(mapping);
  }, [mapping, onChange]);

  const handleSelect = (col: string, targetKey: string) => {
    setMapping((prev) => ({
      ...prev,
      [col]: targetKey || "",
    }));
  };

  const usedTargets = new Set(Object.values(mapping).filter(Boolean));

  if (loading) {
    return (
      <Card>
        <div className="flex items-center gap-3 py-4">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          <span className="text-sm text-gray-500">
            Chargement des champs...
          </span>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <CardTitle>Correspondance colonnes ↔ champs</CardTitle>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Mappez chaque colonne de votre fichier aux champs de l&apos;événement
        (définis par les calques du template).
      </p>

      {fieldDefinitions.length === 0 ? (
        <div className="p-4 bg-amber-50 rounded-lg">
          <p className="text-sm text-amber-700">
            Aucun champ défini pour cet événement. Créez un template avec des
            calques nommés d&apos;abord.
          </p>
        </div>
      ) : (
        <>
          {/* Mapping table */}
          <div className="space-y-2 mb-4">
            {detectedColumns.map((col) => (
              <div
                key={col}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all duration-200"
              >
                <code className="text-sm font-mono font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded min-w-[140px]">
                  {col}
                </code>
                <span className="text-gray-300">→</span>
                <select
                  value={mapping[col] ?? ""}
                  onChange={(e) => handleSelect(col, e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 bg-white"
                >
                  <option value="">— Ignorer —</option>
                  {fieldDefinitions.map((f) => (
                    <option key={f.key} value={f.key}>
                      {f.label}
                    </option>
                  ))}
                </select>
                {mapping[col] && (
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="p-3 bg-gray-50 rounded-lg text-sm">
            {Object.values(mapping).filter(Boolean).length === 0 ? (
              <span className="text-gray-500">
                Aucun mapping défini
              </span>
            ) : (
              <span className="text-green-600 font-medium">
                ✓ {Object.values(mapping).filter(Boolean).length} colonne(s)
                mappée(s) sur {fieldDefinitions.length} champ(s) disponible(s)
              </span>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
