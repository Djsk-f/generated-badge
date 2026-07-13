/**
 * Étape 1 : Sélection des fichiers photo.
 *
 * Drag-and-drop + input webkitdirectory pour sélectionner un dossier.
 *
 * @module components/participants/photo-import/photo-import-step-select
 */

"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FolderOpen, X, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { PhotoFile } from "@/lib/types/photo-import";
import { validatePhotoFiles } from "@/lib/services/photo-import.service";

interface PhotoImportStepSelectProps {
  photoFiles: PhotoFile[];
  onAddFiles: (files: File[]) => void;
  onRemoveFile: (fileId: string) => void;
}

export function PhotoImportStepSelect({
  photoFiles,
  onAddFiles,
  onRemoveFile,
}: PhotoImportStepSelectProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<Array<{ file: string; error: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      const { valid, errors: validationErrors } = validatePhotoFiles(files);

      setErrors(validationErrors);

      if (valid.length > 0) {
        onAddFiles(valid);
      }
    },
    [onAddFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFiles(files);
      }
    },
    [handleFiles]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  const totalSize = photoFiles.reduce((acc, f) => acc + f.file.size, 0);

  return (
    <div className="space-y-4">
      {/* Zone de drop */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          isDragging
            ? "border-indigo-400 bg-indigo-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <Image className="w-8 h-8 text-gray-400" />
          </div>

          <div>
            <p className="text-gray-700 font-medium">
              Glissez-déposez vos photos ici
            </p>
            <p className="text-sm text-gray-500 mt-1">
              ou utilisez les boutons ci-dessous
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => folderInputRef.current?.click()}
            >
              <FolderOpen className="w-4 h-4" />
              Sélectionner un dossier
            </Button>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4" />
              Sélectionner des fichiers
            </Button>
          </div>

          <p className="text-xs text-gray-400">
            JPEG, PNG, WebP, GIF — max 10 Mo par fichier
          </p>
        </div>
      </div>

      {/* Inputs cachés */}
      <input
        ref={folderInputRef}
        type="file"
        // @ts-ignore - webkitdirectory n'est pas dans les types standard
        webkitdirectory=""
        multiple
        onChange={handleFileInputChange}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Erreurs de validation */}
      {errors.length > 0 && (
        <Card padding="sm" className="border-red-200 bg-red-50">
          <p className="text-sm font-medium text-red-700 mb-2">
            {errors.length} fichier(s) ignoré(s)
          </p>
          <ul className="text-xs text-red-600 space-y-1">
            {errors.slice(0, 5).map((err, i) => (
              <li key={i}>
                {err.file} — {err.error}
              </li>
            ))}
            {errors.length > 5 && (
              <li>... et {errors.length - 5} autre(s)</li>
            )}
          </ul>
        </Card>
      )}

      {/* Liste des fichiers sélectionnés */}
      {photoFiles.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">
              {photoFiles.length} photo(s) sélectionnée(s)
            </h3>
            <span className="text-sm text-gray-500">
              {(totalSize / 1024 / 1024).toFixed(1)} Mo
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2">
            {photoFiles.map((photo) => (
              <div
                key={photo.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                {/* Thumbnail */}
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                  <img
                    src={photo.previewUrl}
                    alt={photo.fileName}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Nom */}
                <span className="text-sm text-gray-700 flex-1 truncate">
                  {photo.file.name}
                </span>

                {/* Taille */}
                <span className="text-xs text-gray-400">
                  {(photo.file.size / 1024).toFixed(0)} Ko
                </span>

                {/* Supprimer */}
                <button
                  onClick={() => onRemoveFile(photo.id)}
                  className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
