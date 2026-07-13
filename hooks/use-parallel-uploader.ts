/**
 * Hook pour l'upload parallèle avec contrôle de concurrence.
 *
 * Pattern sémaphore Promise pool.
 *
 * @module hooks/use-parallel-uploader
 */

"use client";

import { useState, useCallback, useRef } from "react";
import type { UploadItem, UploadQueueItem, UploadItemStatus } from "@/lib/types/photo-import";

interface UseParallelUploaderOptions {
  /** Nombre max d'uploads simultanés (défaut: 3) */
  concurrency?: number;
  /** Callback appelé pour chaque résultat d'upload */
  onUploadComplete?: (item: UploadQueueItem) => void;
}

interface UseParallelUploaderReturn {
  /** File d'upload avec statuts */
  queue: UploadQueueItem[];
  /** Nombre total d'items */
  totalCount: number;
  /** Nombre d'items terminés (succès + échec) */
  completedCount: number;
  /** Progression globale (0-100) */
  progress: number;
  /** Upload en cours */
  isUploading: boolean;
  /** Lancer l'upload */
  upload: (items: UploadItem[]) => Promise<UploadQueueItem[]>;
  /** Annuler l'upload */
  cancel: () => void;
}

export function useParallelUploader(
  options: UseParallelUploaderOptions = {}
): UseParallelUploaderReturn {
  const { concurrency = 3, onUploadComplete } = options;

  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const totalCount = queue.length;
  const completedCount = queue.filter(
    (item) => item.status === "uploaded" || item.status === "failed"
  ).length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const updateItemStatus = useCallback(
    (id: string, status: UploadItemStatus, error?: string) => {
      setQueue((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status, error } : item
        )
      );
    },
    []
  );

  const uploadSingle = useCallback(
    async (item: UploadQueueItem, signal: AbortSignal): Promise<UploadQueueItem> => {
      try {
        updateItemStatus(item.id, "uploading");

        const formData = new FormData();
        formData.append("file", item.file, item.fileName);
        formData.append("participantId", item.participantId);
        formData.append("fieldKey", item.fieldKey);

        const response = await fetch(
          `/api/events/${item.id.split("-")[0]}/participants/photos`,
          {
            method: "POST",
            body: formData,
            signal,
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Upload échoué");
        }

        const result = await response.json();
        updateItemStatus(item.id, "uploaded");

        const updatedItem: UploadQueueItem = { ...item, status: "uploaded" };
        onUploadComplete?.(updatedItem);
        return updatedItem;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          updateItemStatus(item.id, "failed", "Annulé");
          return { ...item, status: "failed", error: "Annulé" };
        }

        const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
        updateItemStatus(item.id, "failed", errorMessage);

        const updatedItem: UploadQueueItem = {
          ...item,
          status: "failed",
          error: errorMessage,
        };
        onUploadComplete?.(updatedItem);
        return updatedItem;
      }
    },
    [updateItemStatus, onUploadComplete]
  );

  const upload = useCallback(
    async (items: UploadItem[]): Promise<UploadQueueItem[]> => {
      // Initialiser la queue
      const initialQueue: UploadQueueItem[] = items.map((item) => ({
        ...item,
        status: "pending" as const,
      }));

      setQueue(initialQueue);
      setIsUploading(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const results: UploadQueueItem[] = [];
      let index = 0;

      // Pattern sémaphore
      const worker = async () => {
        while (index < items.length) {
          const currentIndex = index++;
          const item = initialQueue[currentIndex];

          if (controller.signal.aborted) break;

          const result = await uploadSingle(item, controller.signal);
          results.push(result);
        }
      };

      // Lancer les workers
      const workers = Array.from(
        { length: Math.min(concurrency, items.length) },
        () => worker()
      );

      await Promise.all(workers);

      setIsUploading(false);
      abortControllerRef.current = null;

      return results;
    },
    [concurrency, uploadSingle]
  );

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsUploading(false);
  }, []);

  return {
    queue,
    totalCount,
    completedCount,
    progress,
    isUploading,
    upload,
    cancel,
  };
}
