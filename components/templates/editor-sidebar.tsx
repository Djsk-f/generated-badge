/**
 * Panneau latéral gauche — composants disponibles.
 *
 * @module components/templates/editor-sidebar
 */

"use client";

import {
  Type,
  Camera,
  QrCode,
  Image,
  Square,
  Circle,
  Minus,
  Barcode,
} from "lucide-react";
import type { TemplateElement, TemplateElementType } from "@/lib/types";

const COMPONENTS: Array<{
  type: TemplateElementType;
  label: string;
  icon: React.ElementType;
  description: string;
  defaults: Partial<TemplateElement>;
}> = [
  {
    type: "text",
    label: "Texte",
    icon: Type,
    description: "Nom, titre, catégorie...",
    defaults: {
      width_mm: 40,
      height_mm: 8,
      style: { fontSize: 14, fontWeight: "normal", fontStyle: "normal", fontFamily: "Montserrat", color: "#000000", textAlign: "left", letterSpacing: 0, textTransform: "none" },
    },
  },
  {
    type: "photo",
    label: "Photo",
    icon: Camera,
    description: "Photo du participant",
    defaults: {
      width_mm: 20,
      height_mm: 20,
      shape: "rect",
    },
  },
  {
    type: "qr",
    label: "QR Code",
    icon: QrCode,
    description: "Code QR dynamique",
    defaults: {
      width_mm: 18,
      height_mm: 18,
      field: "badge.qr_data",
    },
  },
  {
    type: "logo",
    label: "Logo",
    icon: Image,
    description: "Logo de l'événement",
    defaults: {
      width_mm: 25,
      height_mm: 15,
      source: "event",
    },
  },
  {
    type: "barcode",
    label: "Code-barres",
    icon: Barcode,
    description: "Code-barres du badge",
    defaults: {
      width_mm: 30,
      height_mm: 10,
      field: "badge.code",
    },
  },
  {
    type: "rect",
    label: "Rectangle",
    icon: Square,
    description: "Zone colorée",
    defaults: {
      width_mm: 40,
      height_mm: 15,
      backgroundColor: "#3b82f6",
      borderRadius: 0,
    },
  },
  {
    type: "circle",
    label: "Cercle",
    icon: Circle,
    description: "Forme ronde",
    defaults: {
      width_mm: 15,
      height_mm: 15,
      backgroundColor: "#e5e7eb",
    },
  },
  {
    type: "line",
    label: "Ligne",
    icon: Minus,
    description: "Séparateur",
    defaults: {
      width_mm: 50,
      height_mm: 0.5,
      strokeColor: "#d1d5db",
      strokeWidth: 0.5,
    },
  },
];

interface Props {
  onAdd: (element: TemplateElement) => void;
}

export function EditorSidebar({ onAdd }: Props) {
  const handleAdd = (comp: (typeof COMPONENTS)[number]) => {
    const id = `el_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    onAdd({
      id,
      type: comp.type,
      x_mm: 5,
      y_mm: 5,
      ...comp.defaults,
    } as TemplateElement);
  };

  return (
    <div className="w-56 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-3 border-b border-gray-100">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Composants
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {COMPONENTS.map((comp) => {
          const Icon = comp.icon;
          return (
            <button
              key={comp.type}
              onClick={() => handleAdd(comp)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
                         hover:bg-gray-50 active:bg-gray-100 transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-blue-50
                            flex items-center justify-center transition-colors">
                <Icon className="w-4 h-4 text-gray-500 group-hover:text-indigo-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-700">{comp.label}</p>
                <p className="text-xs text-gray-400 truncate">{comp.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="p-3 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">
          Glissez ou cliquez pour ajouter
        </p>
      </div>
    </div>
  );
}
