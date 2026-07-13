/**
 * Toolbar de l'éditeur de template.
 *
 * @module components/templates/editor-toolbar
 */

"use client";

import {
  Save,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Grid3X3,
  Magnet,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TemplateElement } from "@/lib/types";

interface Props {
  // History
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  // View
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomFit: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  snapToGrid: boolean;
  onToggleSnap: () => void;
  previewMode: boolean;
  onTogglePreview: () => void;
  // Selection
  selectedIds: string[];
  onDelete: () => void;
  onDuplicate: () => void;
  onAlign: (alignment: "left" | "center" | "right" | "top" | "middle" | "bottom") => void;
  // Save
  onSave: () => void;
  saving: boolean;
  saved: boolean;
}

export function EditorToolbar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomFit,
  showGrid,
  onToggleGrid,
  snapToGrid,
  onToggleSnap,
  previewMode,
  onTogglePreview,
  selectedIds,
  onDelete,
  onDuplicate,
  onAlign,
  onSave,
  saving,
  saved,
}: Props) {
  const hasSelection = selectedIds.length > 0;
  const hasMultiple = selectedIds.length > 1;

  return (
    <div className="flex items-center gap-1 px-3 py-2 bg-white border-b border-gray-200">
      {/* Sauvegarder */}
      <Button
        size="sm"
        onClick={onSave}
        loading={saving}
        className="mr-2"
      >
        <Save className="w-4 h-4" />
        {saved ? "Sauvegardé !" : "Sauvegarder"}
      </Button>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      {/* Undo / Redo */}
      <Button
        size="sm"
        variant="ghost"
        onClick={onUndo}
        disabled={!canUndo}
        title="Annuler (Ctrl+Z)"
      >
        <Undo2 className="w-4 h-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={onRedo}
        disabled={!canRedo}
        title="Rétablir (Ctrl+Shift+Z)"
      >
        <Redo2 className="w-4 h-4" />
      </Button>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      {/* Zoom */}
      <Button size="sm" variant="ghost" onClick={onZoomOut} title="Zoom arrière">
        <ZoomOut className="w-4 h-4" />
      </Button>
      <span className="text-xs text-gray-500 w-12 text-center font-mono">
        {Math.round(zoom * 100)}%
      </span>
      <Button size="sm" variant="ghost" onClick={onZoomIn} title="Zoom avant">
        <ZoomIn className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={onZoomFit} title="Taille réelle">
        <Maximize className="w-4 h-4" />
      </Button>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      {/* Grid & Snap */}
      <Button
        size="sm"
        variant={showGrid ? "secondary" : "ghost"}
        onClick={onToggleGrid}
        title="Grille"
      >
        <Grid3X3 className="w-4 h-4" />
      </Button>
      <Button
        size="sm"
        variant={snapToGrid ? "secondary" : "ghost"}
        onClick={onToggleSnap}
        title="Aligner sur la grille"
      >
        <Magnet className="w-4 h-4" />
      </Button>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      {/* Preview */}
      <Button
        size="sm"
        variant={previewMode ? "secondary" : "ghost"}
        onClick={onTogglePreview}
        title="Mode aperçu"
      >
        {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        {previewMode ? "Éditer" : "Aperçu"}
      </Button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Selection actions */}
      {hasSelection && (
        <>
          <Button size="sm" variant="ghost" onClick={onDuplicate} title="Dupliquer (Ctrl+D)">
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            title="Supprimer (Suppr)"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>

          {hasMultiple && (
            <>
              <div className="w-px h-6 bg-gray-200 mx-1" />
              <Button size="sm" variant="ghost" onClick={() => onAlign("left")} title="Aligner à gauche">
                <AlignLeft className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onAlign("center")} title="Centrer horizontalement">
                <AlignCenter className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onAlign("right")} title="Aligner à droite">
                <AlignRight className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onAlign("top")} title="Aligner en haut">
                <AlignStartVertical className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onAlign("middle")} title="Centrer verticalement">
                <AlignCenterVertical className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onAlign("bottom")} title="Aligner en bas">
                <AlignEndVertical className="w-4 h-4" />
              </Button>
            </>
          )}
        </>
      )}
    </div>
  );
}
