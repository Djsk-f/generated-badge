/**
 * Hook de state management pour l'éditeur de template.
 * Gère l'historique (undo/redo), la sélection, le drag.
 *
 * @module components/templates/hooks/use-editor-state
 */

"use client";

import { useState, useCallback, useRef } from "react";
import type { TemplateElement } from "@/lib/types";

interface HistoryEntry {
  elements: TemplateElement[];
}

interface EditorState {
  elements: TemplateElement[];
  selectedIds: string[];
  history: HistoryEntry[];
  historyIndex: number;
  zoom: number;
  showGrid: boolean;
  showRulers: boolean;
  snapToGrid: boolean;
  gridSize: number;
  previewMode: boolean;
}

export function useEditorState(initialElements: TemplateElement[]) {
  const [state, setState] = useState<EditorState>({
    elements: initialElements,
    selectedIds: [],
    history: [{ elements: initialElements }],
    historyIndex: 0,
    zoom: 1,
    showGrid: true,
    showRulers: true,
    snapToGrid: true,
    gridSize: 1,
    previewMode: false,
  });

  const dragRef = useRef<{ startX: number; startY: number; elements: TemplateElement[] } | null>(null);
  const clipboardRef = useRef<TemplateElement[]>([]);

  // ─── History helpers ───────────────────────────────────────────

  const pushHistory = useCallback((elements: TemplateElement[]) => {
    setState((prev) => {
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push({ elements });
      // Limiter l'historique à 50 entrées
      if (newHistory.length > 50) newHistory.shift();
      return {
        ...prev,
        elements,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  const undo = useCallback(() => {
    setState((prev) => {
      if (prev.historyIndex <= 0) return prev;
      const newIndex = prev.historyIndex - 1;
      return {
        ...prev,
        elements: prev.history[newIndex].elements,
        historyIndex: newIndex,
        selectedIds: [],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((prev) => {
      if (prev.historyIndex >= prev.history.length - 1) return prev;
      const newIndex = prev.historyIndex + 1;
      return {
        ...prev,
        elements: prev.history[newIndex].elements,
        historyIndex: newIndex,
        selectedIds: [],
      };
    });
  }, []);

  // ─── Element operations ────────────────────────────────────────

  const addElement = useCallback((element: TemplateElement) => {
    setState((prev) => {
      const newElements = [...prev.elements, element];
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push({ elements: newElements });
      return {
        ...prev,
        elements: newElements,
        selectedIds: [element.id],
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  const updateElement = useCallback((id: string, patch: Partial<TemplateElement>) => {
    setState((prev) => {
      const newElements = prev.elements.map((el) =>
        el.id === id ? { ...el, ...patch } : el
      );
      return { ...prev, elements: newElements };
    });
  }, []);

  const commitElementUpdate = useCallback(() => {
    setState((prev) => {
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push({ elements: prev.elements });
      return {
        ...prev,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  const removeElements = useCallback((ids: string[]) => {
    setState((prev) => {
      const newElements = prev.elements.filter((el) => !ids.includes(el.id));
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push({ elements: newElements });
      return {
        ...prev,
        elements: newElements,
        selectedIds: [],
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  const duplicateElements = useCallback((ids: string[]) => {
    setState((prev) => {
      const toDuplicate = prev.elements.filter((el) => ids.includes(el.id));
      const newElements = toDuplicate.map((el) => ({
        ...el,
        id: `el_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        x_mm: el.x_mm + 3,
        y_mm: el.y_mm + 3,
      }));
      const allNew = [...prev.elements, ...newElements];
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push({ elements: allNew });
      return {
        ...prev,
        elements: allNew,
        selectedIds: newElements.map((el) => el.id),
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  /** Copie les éléments sélectionnés dans le presse-papier interne */
  const copyToClipboard = useCallback((ids: string[]) => {
    setState((prev) => {
      const toCopy = prev.elements.filter((el) => ids.includes(el.id));
      clipboardRef.current = toCopy;
      return prev;
    });
  }, []);

  /** Colle les éléments du presse-papier avec décalage */
  const pasteFromClipboard = useCallback(() => {
    const toPaste = clipboardRef.current;
    if (toPaste.length === 0) return;

    setState((prev) => {
      const newElements = toPaste.map((el) => ({
        ...el,
        id: `el_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        x_mm: el.x_mm + 5,
        y_mm: el.y_mm + 5,
      }));
      const allNew = [...prev.elements, ...newElements];
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push({ elements: allNew });
      return {
        ...prev,
        elements: allNew,
        selectedIds: newElements.map((el) => el.id),
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  const reorderElement = useCallback((id: string, direction: "up" | "down" | "top" | "bottom") => {
    setState((prev) => {
      const idx = prev.elements.findIndex((el) => el.id === id);
      if (idx === -1) return prev;

      const newElements = [...prev.elements];
      const [el] = newElements.splice(idx, 1);

      switch (direction) {
        case "up":
          newElements.splice(Math.max(0, idx - 1), 0, el);
          break;
        case "down":
          newElements.splice(Math.min(newElements.length, idx + 1), 0, el);
          break;
        case "top":
          newElements.push(el);
          break;
        case "bottom":
          newElements.unshift(el);
          break;
      }

      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push({ elements: newElements });
      return {
        ...prev,
        elements: newElements,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  const alignElements = useCallback((ids: string[], alignment: "left" | "center" | "right" | "top" | "middle" | "bottom") => {
    setState((prev) => {
      const selected = prev.elements.filter((el) => ids.includes(el.id));
      if (selected.length < 2) return prev;

      let reference: number;
      const newElements = prev.elements.map((el) => {
        if (!ids.includes(el.id)) return el;

        switch (alignment) {
          case "left":
            reference = Math.min(...selected.map((s) => s.x_mm));
            return { ...el, x_mm: reference };
          case "center":
            reference = (Math.min(...selected.map((s) => s.x_mm)) + Math.max(...selected.map((s) => s.x_mm + s.width_mm))) / 2;
            return { ...el, x_mm: Math.round((reference - el.width_mm / 2) * 10) / 10 };
          case "right":
            reference = Math.max(...selected.map((s) => s.x_mm + s.width_mm));
            return { ...el, x_mm: Math.round((reference - el.width_mm) * 10) / 10 };
          case "top":
            reference = Math.min(...selected.map((s) => s.y_mm));
            return { ...el, y_mm: reference };
          case "middle":
            reference = (Math.min(...selected.map((s) => s.y_mm)) + Math.max(...selected.map((s) => s.y_mm + s.height_mm))) / 2;
            return { ...el, y_mm: Math.round((reference - el.height_mm / 2) * 10) / 10 };
          case "bottom":
            reference = Math.max(...selected.map((s) => s.y_mm + s.height_mm));
            return { ...el, y_mm: Math.round((reference - el.height_mm) * 10) / 10 };
          default:
            return el;
        }
      });

      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push({ elements: newElements });
      return {
        ...prev,
        elements: newElements,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  // ─── Selection ─────────────────────────────────────────────────

  const selectElement = useCallback((id: string | null, additive = false) => {
    setState((prev) => ({
      ...prev,
      selectedIds: id
        ? additive
          ? prev.selectedIds.includes(id)
            ? prev.selectedIds.filter((i) => i !== id)
            : [...prev.selectedIds, id]
          : [id]
        : [],
    }));
  }, []);

  const selectAll = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedIds: prev.elements.map((el) => el.id),
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setState((prev) => ({ ...prev, selectedIds: [] }));
  }, []);

  // ─── View controls ─────────────────────────────────────────────

  const setZoom = useCallback((zoom: number) => {
    setState((prev) => ({ ...prev, zoom: Math.max(0.25, Math.min(3, zoom)) }));
  }, []);

  const toggleGrid = useCallback(() => {
    setState((prev) => ({ ...prev, showGrid: !prev.showGrid }));
  }, []);

  const toggleSnap = useCallback(() => {
    setState((prev) => ({ ...prev, snapToGrid: !prev.snapToGrid }));
  }, []);

  const togglePreview = useCallback(() => {
    setState((prev) => ({ ...prev, previewMode: !prev.previewMode, selectedIds: [] }));
  }, []);

  const zoomIn = useCallback(() => {
    setState((prev) => ({ ...prev, zoom: Math.min(3, prev.zoom + 0.1) }));
  }, []);

  const zoomOut = useCallback(() => {
    setState((prev) => ({ ...prev, zoom: Math.max(0.25, prev.zoom - 0.1) }));
  }, []);

  const zoomFit = useCallback(() => {
    setState((prev) => ({ ...prev, zoom: 1 }));
  }, []);

  /** Déplace un élément d'un index source vers un index cible */
  const moveElementToIndex = useCallback((fromIndex: number, toIndex: number) => {
    setState((prev) => {
      if (fromIndex === toIndex) return prev;
      if (fromIndex < 0 || fromIndex >= prev.elements.length) return prev;
      if (toIndex < 0 || toIndex >= prev.elements.length) return prev;

      const newElements = [...prev.elements];
      const [moved] = newElements.splice(fromIndex, 1);
      newElements.splice(toIndex, 0, moved);

      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push({ elements: newElements });
      return {
        ...prev,
        elements: newElements,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  return {
    state,
    // History
    undo,
    redo,
    canUndo: state.historyIndex > 0,
    canRedo: state.historyIndex < state.history.length - 1,
    // Elements
    addElement,
    updateElement,
    commitElementUpdate,
    removeElements,
    duplicateElements,
    copyToClipboard,
    pasteFromClipboard,
    reorderElement,
    moveElementToIndex,
    alignElements,
    // Selection
    selectElement,
    selectAll,
    clearSelection,
    // View
    setZoom,
    zoomIn,
    zoomOut,
    zoomFit,
    toggleGrid,
    toggleSnap,
    togglePreview,
    // Drag ref
    dragRef,
  };
}
