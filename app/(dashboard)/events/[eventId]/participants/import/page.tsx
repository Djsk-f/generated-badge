/**
 * Page d'import de participants via CSV/Excel.
 *
 * Les colonnes sont mappées dynamiquement aux FieldDefinitions de l'événement.
 * Les données sont stockées dans `field_values` JSONB.
 *
 * @module app/(dashboard)/events/[eventId]/participants/import/page
 */

"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, FileSpreadsheet, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { importParticipantsAction } from "../actions";
import { ColumnMapper, type ColumnMapping } from "@/components/participants/column-mapper";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import type { FieldDefinition } from "@/lib/types";

export default function ImportParticipantsPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [rawData, setRawData] = useState<Record<string, string>[]>([]);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importResult, setImportResult] = useState<{
    imported: number;
    errors: string[];
  } | null>(null);

  const [fieldDefinitions, setFieldDefinitions] = useState<FieldDefinition[]>([]);
  const [loadingFields, setLoadingFields] = useState(true);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});

  useEffect(() => {
    async function loadFields() {
      try {
        const res = await fetch(`/api/field-definitions?event_id=${eventId}`);
        if (res.ok) {
          const json = await res.json();
          setFieldDefinitions(json.fieldDefinitions ?? []);
        }
      } catch {
        // silently fail — form will show no dynamic fields
      } finally {
        setLoadingFields(false);
      }
    }
    loadFields();
  }, [eventId]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;

      setFile(selectedFile);
      setImportResult(null);
      setRawData([]);
      setColumnMapping({});

      if (selectedFile.name.endsWith(".csv")) {
        const Papa = (await import("papaparse")).default;
        Papa.parse(selectedFile, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setRawData(results.data as Record<string, string>[]);
          },
        });
      } else {
        const XLSX = await import("xlsx");
        const data = await selectedFile.arrayBuffer();
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        setRawData(XLSX.utils.sheet_to_json<Record<string, string>>(firstSheet));
      }
    },
    []
  );

  const handleImport = async () => {
    if (!rawData.length) return;

    setImporting(true);
    try {
      // Sanitize: ensure all values are plain strings (xlsx can produce Date objects)
      const sanitized = rawData.map((row) => {
        const plain: Record<string, string> = {};
        for (const [k, v] of Object.entries(row)) {
          const val = v as unknown;
          plain[k] = val instanceof Date ? val.toISOString() : String(val ?? "");
        }
        return plain;
      });
      const result = await importParticipantsAction(
        eventId,
        sanitized,
        columnMapping
      );
      if (result.success && result.data) {
        setImportResult(result.data);
      } else {
        const errorMsg = "error" in result ? result.error : "Erreur lors de l'import";
        setImportResult({ imported: 0, errors: [errorMsg] });
      }
    } catch (e) {
      setImportResult({ imported: 0, errors: [e instanceof Error ? e.message : "Erreur lors de l'import"] });
    } finally {
      setImporting(false);
    }
  };

  const detectedColumns = useMemo(
    () => (rawData.length > 0 ? Object.keys(rawData[0]) : []),
    [rawData]
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Événements", href: "/events" },
          { label: "...", href: `/events/${eventId}` },
          { label: "Participants", href: `/events/${eventId}/participants` },
          { label: "Importer" },
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
          <h1 className="text-2xl font-bold text-gray-900">
            Importer des participants
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Chargez un fichier CSV ou Excel. Mappez les colonnes aux champs de
            l&apos;événement.
          </p>
        </div>
      </div>

      {/* Sélection du fichier */}
      <Card padding="lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Sélectionner le fichier
        </h2>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
          <FileSpreadsheet className="w-10 h-10 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-600 mb-3">
            Glissez-déposez ou cliquez pour sélectionner
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="absolute w-px h-px overflow-hidden"
            style={{ clip: "rect(0 0 0 0)" }}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4" />
            Sélectionner un fichier
          </Button>
          <p className="text-xs text-gray-400 mt-2">
            CSV, XLSX, XLS — max 5 Mo
          </p>
        </div>

        {file && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800">{file.name}</span>
            <span className="text-sm text-green-600">
              ({(file.size / 1024).toFixed(1)} Ko)
            </span>
          </div>
        )}
      </Card>

      {/* Aperçu des données */}
      {rawData.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900">
            Aperçu — {rawData.length} ligne(s)
          </h3>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200" style={{ background: "linear-gradient(180deg, #f5f3ff 0%, #fafafa 100%)" }}>
                  {detectedColumns.map((col) => (
                    <th
                      key={col}
                      className="text-left py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider px-3"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rawData.slice(0, 10).map((row, i) => (
                  <tr key={i} className="hover:bg-indigo-50/30 transition-colors duration-150">
                    {detectedColumns.map((col) => (
                      <td key={col} className="py-2.5 px-3 text-sm text-gray-700">
                        {row[col] || <span className="text-gray-300">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {rawData.length > 10 && (
              <p className="text-xs text-gray-400 mt-2">
                ... et {rawData.length - 10} autre(s) ligne(s)
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Mapping colonnes → champs */}
      {detectedColumns.length > 0 && (
        <ColumnMapper
          fieldDefinitions={fieldDefinitions}
          detectedColumns={detectedColumns}
          loading={loadingFields}
          onChange={setColumnMapping}
        />
      )}

      {/* Résultat de l'import */}
      {importResult && (
        <Card>
          {importResult.imported > 0 ? (
            <div className="text-center py-4">
              <Check className="w-12 h-12 mx-auto text-green-500 mb-3" />
              <h3 className="text-lg font-medium text-gray-900">
                {importResult.imported} participant(s) importé(s)
              </h3>
              <div className="flex justify-center gap-3 mt-4">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/events/${eventId}/participants`)}
                >
                  Voir les participants
                </Button>
                <Button
                  onClick={() => router.push(`/events/${eventId}/badges`)}
                >
                  Télécharger les badges
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-3" />
              <h3 className="text-lg font-medium text-gray-900">
                Échec de l&apos;import
              </h3>
              <p className="text-sm text-red-600 mt-2">
                {importResult.errors.join("; ")}
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Actions */}
      {rawData.length > 0 && !importResult && (
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setFile(null);
              setRawData([]);
              setColumnMapping({});
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleImport}
            loading={importing}
            disabled={!rawData.length}
          >
            Importer {rawData.length} participant(s)
          </Button>
        </div>
      )}
    </div>
  );
}
