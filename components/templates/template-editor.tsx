/**
 * Éditeur visuel de template de badge — version moderne.
 *
 * @module components/templates/template-editor
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Template, TemplateElement, TemplateElementType, AvailableField } from "@/lib/types";
import { useEditorState } from "./hooks/use-editor-state";
import { EditorToolbar } from "./editor-toolbar";
import { EditorSidebar } from "./editor-sidebar";
import { EditorCanvas } from "./editor-canvas";
import { EditorProperties } from "./editor-properties";
import { EditorLayers } from "./editor-layers";

interface Props {
  template: Template;
}

type SidePanel = "properties" | "layers";

export function TemplateEditor({ template }: Props) {
  const router = useRouter();
  const [sidePanel, setSidePanel] = useState<SidePanel>("properties");

  const {
    state,
    undo,
    redo,
    canUndo,
    canRedo,
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
    selectElement,
    clearSelection,
    zoomIn,
    zoomOut,
    zoomFit,
    toggleGrid,
    toggleSnap,
    togglePreview,
  } = useEditorState(template.elements ?? []);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [availableFields, setAvailableFields] = useState<AvailableField[]>([]);

  // Charger les field definitions de tous les événements de l'utilisateur (un seul appel)
  useEffect(() => {
    const loadFields = async () => {
      try {
        const fdRes = await fetch("/api/field-definitions?user_all=true");
        if (!fdRes.ok) return;
        const { fieldDefinitions } = await fdRes.json();

        const allFields: AvailableField[] = [];
        const seen = new Set<string>();
        for (const fd of fieldDefinitions ?? []) {
          const key = `participant.${fd.key}`;
          if (!seen.has(key)) {
            seen.add(key);
            allFields.push({ key, label: fd.label });
          }
        }
        setAvailableFields(allFields);
      } catch {
        // Silently fail — keep system fields only
      }
    };
    loadFields();
  }, []);

  // ─── Save ──────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: template.id,
          elements: state.elements,
        }),
      });
      if (!res.ok) throw new Error("Erreur sauvegarde");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setSaveError("Erreur lors de la sauvegarde");
      setTimeout(() => setSaveError(null), 3000);
    } finally {
      setSaving(false);
    }
  }, [template.id, state.elements]);

  // ─── Keyboard shortcuts ────────────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z undo
      if (e.key === "z" && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Ctrl+Shift+Z redo
      if (e.key === "z" && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        e.preventDefault();
        redo();
      }
      // Ctrl+S save
      if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSave();
      }
      // Ctrl+A select all
      if (e.key === "a" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        // selectAll();
      }
      // Escape clear selection
      if (e.key === "Escape") {
        clearSelection();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, handleSave, clearSelection]);

  // ─── Custom events from canvas ─────────────────────────────────

  useEffect(() => {
    const handleDelete = (e: Event) => {
      const ids = (e as CustomEvent).detail.ids;
      removeElements(ids);
    };
    const handleDuplicate = (e: Event) => {
      const ids = (e as CustomEvent).detail.ids;
      duplicateElements(ids);
    };
    const handleCopy = (e: Event) => {
      const ids = (e as CustomEvent).detail.ids;
      copyToClipboard(ids);
    };
    const handlePaste = () => {
      pasteFromClipboard();
    };

    window.addEventListener("editor:delete", handleDelete);
    window.addEventListener("editor:duplicate", handleDuplicate);
    window.addEventListener("editor:copy", handleCopy);
    window.addEventListener("editor:paste", handlePaste);
    return () => {
      window.removeEventListener("editor:delete", handleDelete);
      window.removeEventListener("editor:duplicate", handleDuplicate);
      window.removeEventListener("editor:copy", handleCopy);
      window.removeEventListener("editor:paste", handlePaste);
    };
  }, [removeElements, duplicateElements, copyToClipboard, pasteFromClipboard]);

  // ─── Selected element ──────────────────────────────────────────

  const selectedElement =
    state.selectedIds.length === 1
      ? state.elements.find((el) => el.id === state.selectedIds[0]) ?? null
      : null;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
      {/* Toolbar */}
      <EditorToolbar
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        zoom={state.zoom}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onZoomFit={zoomFit}
        showGrid={state.showGrid}
        onToggleGrid={toggleGrid}
        snapToGrid={state.snapToGrid}
        onToggleSnap={toggleSnap}
        previewMode={state.previewMode}
        onTogglePreview={togglePreview}
        selectedIds={state.selectedIds}
        onDelete={() => removeElements(state.selectedIds)}
        onDuplicate={() => duplicateElements(state.selectedIds)}
        onAlign={(alignment) => alignElements(state.selectedIds, alignment)}
        onSave={handleSave}
        saving={saving}
        saved={saved}
      />

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar — components */}
        {!state.previewMode && (
          <EditorSidebar onAdd={addElement} />
        )}

        {/* Canvas */}
        <EditorCanvas
          template={template}
          elements={state.elements}
          selectedIds={state.selectedIds}
          zoom={state.zoom}
          showGrid={state.showGrid}
          snapToGrid={state.snapToGrid}
          gridSize={state.gridSize}
          previewMode={state.previewMode}
          availableFields={availableFields}
          onSelect={(id, additive) => selectElement(id, additive ?? false)}
          onUpdate={updateElement}
          onCommit={commitElementUpdate}
        />

        {/* Right sidebar — properties / layers */}
        {!state.previewMode && (
          <div className="flex flex-col">
            {/* Tab switcher */}
            <div className="flex bg-white border-l border-b border-gray-200">
              <button
                onClick={() => setSidePanel("properties")}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                  sidePanel === "properties"
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Propriétés
              </button>
              <button
                onClick={() => setSidePanel("layers")}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                  sidePanel === "layers"
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Calques ({state.elements.length})
              </button>
            </div>

            {sidePanel === "properties" ? (
              <EditorProperties
                element={selectedElement}
                backgroundUrl={template.background_url}
                availableFields={availableFields}
                onUpdate={(patch) =>
                  selectedElement && updateElement(selectedElement.id, patch)
                }
                onCommit={commitElementUpdate}
                onDuplicate={() =>
                  selectedElement && duplicateElements([selectedElement.id])
                }
                onDelete={() =>
                  selectedElement && removeElements([selectedElement.id])
                }
                onReorder={(dir) =>
                  selectedElement && reorderElement(selectedElement.id, dir)
                }
              />
            ) : (
              <EditorLayers
                elements={state.elements}
                selectedIds={state.selectedIds}
                onSelect={(id, additive) => selectElement(id, additive ?? false)}
                onMoveElement={moveElementToIndex}
                onUpdateElement={updateElement}
                onCommit={commitElementUpdate}
              />
            )}
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-white border-t border-gray-200 text-xs text-gray-500">
        <span>
          {template.width_mm} x {template.height_mm} mm
          {state.snapToGrid && " • Snap ON"}
        </span>
        <span>
          {saveError ? (
            <span className="text-red-600">{saveError}</span>
          ) : state.selectedIds.length > 0 ? (
            `${state.selectedIds.length} sélectionné(s)`
          ) : (
            `${state.elements.length} élément(s)`
          )}
        </span>
        <span>
          Ctrl+Z annuler • Ctrl+S sauvegarder • Suppr supprimer
        </span>
      </div>
    </div>
  );
}
