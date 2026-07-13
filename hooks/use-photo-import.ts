/**
 * Hook principal pour le wizard d'import de photos.
 *
 * State machine basée sur useReducer.
 *
 * @module hooks/use-photo-import
 */

"use client";

import { useReducer, useCallback, useMemo } from "react";
import type {
  PhotoFile,
  PhotoMatch,
  PhotoConflict,
  PhotoImportStep,
  UploadResult,
} from "@/lib/types/photo-import";
import type { Participant, FieldDefinition } from "@/lib/types";
import {
  autoMatchPhotos,
  compressAllPhotos,
  createPhotoFiles,
} from "@/lib/services/photo-import.service";
import { useParallelUploader } from "./use-parallel-uploader";

// ─── State ──────────────────────────────────────────────────────────

interface State {
  eventId: string;
  step: PhotoImportStep;
  photoFiles: PhotoFile[];
  participants: Participant[];
  imageFields: FieldDefinition[];
  matches: PhotoMatch[];
  conflicts: PhotoConflict[];
  uploadResults: UploadResult[];
  targetFieldKey: string;
}

type Action =
  | { type: "SET_FILES"; photoFiles: PhotoFile[] }
  | { type: "REMOVE_FILE"; fileId: string }
  | { type: "SET_PARTICIPANTS"; participants: Participant[]; imageFields: FieldDefinition[] }
  | { type: "SET_TARGET_FIELD"; fieldKey: string }
  | { type: "SET_MATCHES"; matches: PhotoMatch[] }
  | { type: "UPDATE_MATCH"; match: PhotoMatch }
  | { type: "SET_CONFLICTS"; conflicts: PhotoConflict[] }
  | { type: "RESOLVE_CONFLICT"; participantId: string; resolution: "replace" | "skip" | "keep" }
  | { type: "RESOLVE_ALL_CONFLICTS"; resolution: "replace" | "skip" | "keep" }
  | { type: "UPDATE_PHOTO_FILES"; photoFiles: PhotoFile[] }
  | { type: "SET_UPLOAD_RESULTS"; results: UploadResult[] }
  | { type: "GO_NEXT" }
  | { type: "GO_BACK" }
  | { type: "SET_STEP"; step: PhotoImportStep }
  | { type: "RESET" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_FILES":
      return { ...state, photoFiles: action.photoFiles, step: "select" };

    case "REMOVE_FILE":
      return {
        ...state,
        photoFiles: state.photoFiles.filter((f) => f.id !== action.fileId),
      };

    case "SET_PARTICIPANTS":
      return {
        ...state,
        participants: action.participants,
        imageFields: action.imageFields,
      };

    case "SET_TARGET_FIELD":
      return { ...state, targetFieldKey: action.fieldKey };

    case "SET_MATCHES":
      return { ...state, matches: action.matches };

    case "UPDATE_MATCH":
      return {
        ...state,
        matches: state.matches.map((m) =>
          m.photoFileId === action.match.photoFileId ? action.match : m
        ),
      };

    case "SET_CONFLICTS":
      return { ...state, conflicts: action.conflicts };

    case "RESOLVE_CONFLICT":
      return {
        ...state,
        conflicts: state.conflicts.map((c) =>
          c.participantId === action.participantId
            ? { ...c, resolution: action.resolution }
            : c
        ),
      };

    case "RESOLVE_ALL_CONFLICTS":
      return {
        ...state,
        conflicts: state.conflicts.map((c) => ({
          ...c,
          resolution: action.resolution,
        })),
      };

    case "UPDATE_PHOTO_FILES":
      return { ...state, photoFiles: action.photoFiles };

    case "SET_UPLOAD_RESULTS":
      return { ...state, uploadResults: action.results };

    case "GO_NEXT": {
      const steps: PhotoImportStep[] = ["select", "match", "conflicts", "upload", "summary"];
      const currentIndex = steps.indexOf(state.step);
      const nextStep = steps[currentIndex + 1];

      // Sauter les conflits s'il n'y en a pas
      if (nextStep === "conflicts" && state.conflicts.length === 0) {
        return { ...state, step: "upload" };
      }

      return { ...state, step: nextStep ?? state.step };
    }

    case "GO_BACK": {
      const steps: PhotoImportStep[] = ["select", "match", "conflicts", "upload", "summary"];
      const currentIndex = steps.indexOf(state.step);
      const prevStep = steps[currentIndex - 1];

      // Sauter les conflits s'il n'y en a pas
      if (prevStep === "conflicts" && state.conflicts.length === 0) {
        return { ...state, step: "match" };
      }

      return { ...state, step: prevStep ?? state.step };
    }

    case "SET_STEP":
      return { ...state, step: action.step };

    case "RESET":
      return getInitialState(state.eventId);

    default:
      return state;
  }
}

function getInitialState(eventId: string): State {
  return {
    eventId,
    step: "select",
    photoFiles: [],
    participants: [],
    imageFields: [],
    matches: [],
    conflicts: [],
    uploadResults: [],
    targetFieldKey: "photo",
  };
}

// ─── Hook ───────────────────────────────────────────────────────────

export interface UsePhotoImportReturn {
  state: State;
  /** Nombre total de photos */
  totalPhotos: number;
  /** Photos correspondantes */
  matchedCount: number;
  /** Photos non correspondantes */
  unmatchedCount: number;
  /** Conflits */
  conflictCount: number;
  /** Peut passer à l'étape suivante */
  canProceed: boolean;
  /** Actions */
  addFiles: (files: File[]) => void;
  removeFile: (fileId: string) => void;
  setTargetField: (fieldKey: string) => void;
  autoMatch: () => void;
  updateMatch: (match: PhotoMatch) => void;
  resolveConflict: (participantId: string, resolution: "replace" | "skip" | "keep") => void;
  resolveAllConflicts: (resolution: "replace" | "skip" | "keep") => void;
  compressAll: () => Promise<void>;
  startUpload: () => Promise<void>;
  goNext: () => void;
  goBack: () => void;
  setStep: (step: PhotoImportStep) => void;
  reset: () => void;
  /** Upload parallèle */
  uploader: ReturnType<typeof useParallelUploader>;
}

export function usePhotoImport(eventId: string): UsePhotoImportReturn {
  const [state, dispatch] = useReducer(reducer, eventId, getInitialState);
  const uploader = useParallelUploader({ concurrency: 3 });

  const totalPhotos = state.photoFiles.length;
  const matchedCount = state.matches.filter((m) => m.confidence !== "none").length;
  const unmatchedCount = state.matches.filter((m) => m.confidence === "none").length;
  const conflictCount = state.conflicts.length;

  const canProceed = useMemo(() => {
    switch (state.step) {
      case "select":
        return state.photoFiles.length > 0;
      case "match":
        return state.matches.length > 0;
      case "conflicts":
        return state.conflicts.every((c) => c.resolution !== undefined);
      case "upload":
        return true;
      case "summary":
        return false;
      default:
        return false;
    }
  }, [state]);

  const addFiles = useCallback(
    (files: File[]) => {
      const photoFiles = createPhotoFiles(files);
      dispatch({ type: "SET_FILES", photoFiles });
    },
    []
  );

  const removeFile = useCallback((fileId: string) => {
    dispatch({ type: "REMOVE_FILE", fileId });
  }, []);

  const setTargetField = useCallback((fieldKey: string) => {
    dispatch({ type: "SET_TARGET_FIELD", fieldKey });
  }, []);

  const autoMatch = useCallback(() => {
    if (state.participants.length === 0 || state.photoFiles.length === 0) return;

    const matches = autoMatchPhotos(
      state.photoFiles,
      state.participants,
      state.targetFieldKey
    );
    dispatch({ type: "SET_MATCHES", matches });

    // Détecter les conflits (participants qui ont déjà une photo)
    const conflicts: PhotoConflict[] = [];
    for (const match of matches) {
      if (!match.participantId || match.confidence === "none") continue;

      const participant = state.participants.find((p) => p.id === match.participantId);
      if (!participant) continue;

      const existingPhoto = participant.field_values[state.targetFieldKey];
      if (existingPhoto) {
        conflicts.push({
          participantId: match.participantId,
          participantName: participant.field_values[state.targetFieldKey] || "Inconnu",
          fieldKey: state.targetFieldKey,
          existingPhotoUrl: existingPhoto,
          newPhotoFileId: match.photoFileId,
          resolution: "replace",
        });
      }
    }

    if (conflicts.length > 0) {
      dispatch({ type: "SET_CONFLICTS", conflicts });
    }
  }, [state.participants, state.photoFiles, state.targetFieldKey]);

  const updateMatch = useCallback((match: PhotoMatch) => {
    dispatch({ type: "UPDATE_MATCH", match });
  }, []);

  const resolveConflict = useCallback(
    (participantId: string, resolution: "replace" | "skip" | "keep") => {
      dispatch({ type: "RESOLVE_CONFLICT", participantId, resolution });
    },
    []
  );

  const resolveAllConflicts = useCallback(
    (resolution: "replace" | "skip" | "keep") => {
      dispatch({ type: "RESOLVE_ALL_CONFLICTS", resolution });
    },
    []
  );

  const compressAll = useCallback(async () => {
    const updated = await compressAllPhotos(
      state.photoFiles,
      (completed, total) => {
        // Progression gérée par le composant
      }
    );
    dispatch({ type: "UPDATE_PHOTO_FILES", photoFiles: updated });
  }, [state.photoFiles]);

  const startUpload = useCallback(async () => {
    // Préparer les items d'upload
    const items = state.photoFiles
      .filter((f) => f.status === "compressed" && f.compressedBlob)
      .map((f) => {
        const match = state.matches.find((m) => m.photoFileId === f.id);
        return {
          id: f.id,
          file: f.compressedBlob!,
          participantId: match?.participantId || "",
          fieldKey: state.targetFieldKey,
          fileName: `${f.fileName}.webp`,
        };
      })
      .filter((item) => item.participantId);

    if (items.length === 0) return;

    const results = await uploader.upload(items);
    dispatch({
      type: "SET_UPLOAD_RESULTS",
      results: results.map((r) => ({
        photoFileId: r.id,
        participantId: r.participantId,
        success: r.status === "uploaded",
        error: r.error,
      })),
    });
  }, [state.photoFiles, state.matches, state.targetFieldKey, uploader]);

  const goNext = useCallback(() => dispatch({ type: "GO_NEXT" }), []);
  const goBack = useCallback(() => dispatch({ type: "GO_BACK" }), []);
  const setStep = useCallback(
    (step: PhotoImportStep) => dispatch({ type: "SET_STEP", step }),
    []
  );
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  return {
    state,
    totalPhotos,
    matchedCount,
    unmatchedCount,
    conflictCount,
    canProceed,
    addFiles,
    removeFile,
    setTargetField,
    autoMatch,
    updateMatch,
    resolveConflict,
    resolveAllConflicts,
    compressAll,
    startUpload,
    goNext,
    goBack,
    setStep,
    reset,
    uploader,
  };
}
