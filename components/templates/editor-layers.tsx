/**
 * Panneau des calques avec drag & drop pour réordonner.
 *
 * @module components/templates/editor-layers
 */

"use client";

import { useState, useRef, useCallback } from "react";
import {
  Type,
  Camera,
  QrCode,
  Image,
  Square,
  Circle,
  Minus,
  Barcode,
  GripVertical,
  Pencil,
  Lock,
  Unlock,
  Check,
  X,
} from "lucide-react";
import type { TemplateElement } from "@/lib/types";

const ICONS: Record<string, React.ElementType> = {
  text: Type,
  photo: Camera,
  qr: QrCode,
  logo: Image,
  barcode: Barcode,
  rect: Square,
  circle: Circle,
  line: Minus,
};

const TYPE_LABELS: Record<string, string> = {
  text: "Texte",
  photo: "Photo",
  qr: "QR Code",
  logo: "Logo",
  barcode: "Code-barres",
  rect: "Rectangle",
  circle: "Cercle",
  line: "Ligne",
};

interface Props {
  elements: TemplateElement[];
  selectedIds: string[];
  onSelect: (id: string | null, additive?: boolean) => void;
  onMoveElement: (fromIndex: number, toIndex: number) => void;
  onUpdateElement: (id: string, patch: Partial<TemplateElement>) => void;
  onCommit: () => void;
}

export function EditorLayers({
  elements,
  selectedIds,
  onSelect,
  onMoveElement,
  onUpdateElement,
  onCommit,
}: Props) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // L'ordre d'affichage est inverse (index 0 = calque du haut = dernier dans le tableau)
  const displayElements = [...elements].reverse();

  const getDisplayName = (el: TemplateElement): string => {
    if (el.name) return el.name;
    const base = TYPE_LABELS[el.type] ?? el.type;
    if (el.field) {
      const fieldLabel = el.field.split(".").pop();
      return `${base} (${fieldLabel})`;
    }
    return base;
  };

  // ─── Drag & Drop ───────────────────────────────────────────────

  const handleDragStart = useCallback((e: React.DragEvent, displayIdx: number) => {
    setDragIndex(displayIdx);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(displayIdx));
    // Image fantôme
    const ghost = e.currentTarget.cloneNode(true) as HTMLElement;
    ghost.style.opacity = "0.5";
    ghost.style.position = "absolute";
    ghost.style.top = "-1000px";
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    setTimeout(() => document.body.removeChild(ghost), 0);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, displayIdx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverIndex(displayIdx);
  }, []);

  const handleDragLeave = useCallback(() => {
    setOverIndex(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, toDisplayIdx: number) => {
    e.preventDefault();
    if (dragIndex === null) return;

    // Convertir display index → elements index
    const fromElementIdx = elements.length - 1 - dragIndex;
    const toElementIdx = elements.length - 1 - toDisplayIdx;

    onMoveElement(fromElementIdx, toElementIdx);
    setDragIndex(null);
    setOverIndex(null);
  }, [dragIndex, elements.length, onMoveElement]);

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setOverIndex(null);
  }, []);

  // ─── Renaming ──────────────────────────────────────────────────

  const startEditing = (el: TemplateElement) => {
    setEditingId(el.id);
    setEditValue(el.name ?? "");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const confirmRename = () => {
    if (editingId) {
      onUpdateElement(editingId, { name: editValue.trim() || undefined });
      onCommit();
    }
    setEditingId(null);
    setEditValue("");
  };

  const cancelRename = () => {
    setEditingId(null);
    setEditValue("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-100">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Calques
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          Glissez pour réordonner. Le nom = variable Excel.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {displayElements.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            <p className="text-sm">Aucun élément</p>
          </div>
        ) : (
          <div className="p-1 space-y-0.5">
            {displayElements.map((el, displayIdx) => {
              const Icon = ICONS[el.type] ?? Square;
              const isSelected = selectedIds.includes(el.id);
              const isDragging = dragIndex === displayIdx;
              const isOver = overIndex === displayIdx && dragIndex !== displayIdx;
              const isEditing = editingId === el.id;

              return (
                <div
                  key={el.id}
                  draggable={!isEditing}
                  onDragStart={(e) => handleDragStart(e, displayIdx)}
                  onDragOver={(e) => handleDragOver(e, displayIdx)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, displayIdx)}
                  onDragEnd={handleDragEnd}
                  onClick={(e) => onSelect(el.id, e.metaKey || e.ctrlKey)}
                  className={`
                    flex items-center gap-1.5 px-2 py-1.5 rounded-md text-left
                    transition-all duration-150 group
                    ${isSelected
                      ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                      : "text-gray-600 hover:bg-gray-50"
                    }
                    ${isDragging ? "opacity-40" : ""}
                    ${isOver ? "bg-blue-100 border-t-2 border-blue-400" : ""}
                    cursor-pointer
                  `}
                >
                  {/* Drag handle */}
                  <div className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-300 group-hover:text-gray-400">
                    <GripVertical className="w-3.5 h-3.5" />
                  </div>

                  {/* Lock toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateElement(el.id, { locked: !el.locked });
                      onCommit();
                    }}
                    className={`flex-shrink-0 transition-colors ${
                      el.locked
                        ? "text-amber-500 hover:text-amber-600"
                        : "text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100"
                    }`}
                    title={el.locked ? "Déverrouiller" : "Verrouiller"}
                  >
                    {el.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                  </button>

                  {/* Icon */}
                  <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${el.locked ? "opacity-50" : ""}`} />

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input
                          ref={inputRef}
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") confirmRename();
                            if (e.key === "Escape") cancelRename();
                          }}
                          onBlur={confirmRename}
                          className="flex-1 px-1.5 py-0.5 text-xs border border-blue-300 rounded
                                     focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
                          placeholder="Nom du calque..."
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); confirmRename(); }}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); cancelRename(); }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className={`text-xs font-medium truncate ${el.locked ? "opacity-50" : ""}`}>
                          {getDisplayName(el)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(el);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-opacity"
                        >
                          <Pencil className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-2 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">
          {elements.length} élément(s) • {selectedIds.length} sélectionné(s)
        </p>
      </div>
    </div>
  );
}
