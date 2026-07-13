/**
 * Canvas de l'éditeur avec drag & drop, snapping, guides.
 *
 * @module components/templates/editor-canvas
 */

"use client";

import { useRef, useCallback, useEffect, useState } from "react";
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
import { AVAILABLE_FIELDS, type TemplateElement, type Template, type AvailableField } from "@/lib/types";

const MM_TO_PX = 3.78;

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

interface Props {
  template: Template;
  elements: TemplateElement[];
  selectedIds: string[];
  zoom: number;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  previewMode: boolean;
  availableFields?: AvailableField[];
  onSelect: (id: string | null, additive?: boolean) => void;
  onUpdate: (id: string, patch: Partial<TemplateElement>) => void;
  onCommit: () => void;
}

interface DragState {
  id: string;
  startX: number;
  startY: number;
  origX: number;
  origY: number;
}

interface ResizeState {
  id: string;
  handle: string;
  startX: number;
  startY: number;
  origX: number;
  origY: number;
  origW: number;
  origH: number;
}

export function EditorCanvas({
  template,
  elements,
  selectedIds,
  zoom,
  showGrid,
  snapToGrid,
  gridSize,
  previewMode,
  availableFields = [...AVAILABLE_FIELDS],
  onSelect,
  onUpdate,
  onCommit,
}: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<DragState | null>(null);
  const [resizing, setResizing] = useState<ResizeState | null>(null);
  const [guides, setGuides] = useState<{ x?: number; y?: number }>({});

  const widthPx = template.width_mm * MM_TO_PX;
  const heightPx = template.height_mm * MM_TO_PX;

  const snap = (value: number): number => {
    if (!snapToGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  };

  const pxToMm = (px: number) => Math.round((px / MM_TO_PX) * 10) / 10;

  // ─── Drag ──────────────────────────────────────────────────────

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, id: string) => {
      if (previewMode) return;

      const el = elements.find((el) => el.id === id);
      if (!el) return;

      e.stopPropagation();
      e.preventDefault();

      onSelect(id, e.metaKey || e.ctrlKey);

      // Tous les calques (y compris locked) peuvent être déplacés
      setDragging({
        id,
        startX: e.clientX,
        startY: e.clientY,
        origX: el.x_mm,
        origY: el.y_mm,
      });
    },
    [elements, onSelect, previewMode]
  );

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = pxToMm(e.clientX - dragging.startX);
      const dy = pxToMm(e.clientY - dragging.startY);

      let newX = snap(dragging.origX + dx);
      let newY = snap(dragging.origY + dy);

      // Bounds
      const el = elements.find((el) => el.id === dragging.id);
      if (el) {
        newX = Math.max(0, Math.min(template.width_mm - el.width_mm, newX));
        newY = Math.max(0, Math.min(template.height_mm - el.height_mm, newY));
      }

      // Snap guides
      const newGuides: { x?: number; y?: number } = {};
      if (Math.abs(newX - dragging.origX) < 0.01) newGuides.x = newX;
      if (Math.abs(newY - dragging.origY) < 0.01) newGuides.y = newY;
      setGuides(newGuides);

      onUpdate(dragging.id, { x_mm: newX, y_mm: newY });
    };

    const handleMouseUp = () => {
      setDragging(null);
      setGuides({});
      onCommit();
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, elements, template.width_mm, template.height_mm, snap, onUpdate, onCommit]);

  // ─── Resize ────────────────────────────────────────────────────

  const handleResizeStart = useCallback(
    (e: React.MouseEvent, id: string, handle: string) => {
      if (previewMode) return;

      const el = elements.find((el) => el.id === id);
      if (!el || el.locked) return;

      e.stopPropagation();
      e.preventDefault();

      setResizing({
        id,
        handle,
        startX: e.clientX,
        startY: e.clientY,
        origX: el.x_mm,
        origY: el.y_mm,
        origW: el.width_mm,
        origH: el.height_mm,
      });
    },
    [elements, previewMode]
  );

  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = pxToMm(e.clientX - resizing.startX);
      const dy = pxToMm(e.clientY - resizing.startY);

      let newX = resizing.origX;
      let newY = resizing.origY;
      let newW = resizing.origW;
      let newH = resizing.origH;

      if (resizing.handle.includes("e")) {
        newW = snap(Math.max(2, resizing.origW + dx));
      }
      if (resizing.handle.includes("w")) {
        newW = snap(Math.max(2, resizing.origW - dx));
        newX = snap(resizing.origX + dx);
      }
      if (resizing.handle.includes("s")) {
        newH = snap(Math.max(2, resizing.origH + dy));
      }
      if (resizing.handle.includes("n")) {
        newH = snap(Math.max(2, resizing.origH - dy));
        newY = snap(resizing.origY + dy);
      }

      // Bounds
      newX = Math.max(0, newX);
      newY = Math.max(0, newY);
      if (newX + newW > template.width_mm) newW = template.width_mm - newX;
      if (newY + newH > template.height_mm) newH = template.height_mm - newY;

      onUpdate(resizing.id, { x_mm: newX, y_mm: newY, width_mm: newW, height_mm: newH });
    };

    const handleMouseUp = () => {
      setResizing(null);
      onCommit();
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizing, template.width_mm, template.height_mm, snap, onUpdate, onCommit]);

  // ─── Keyboard shortcuts ────────────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (previewMode) return;

      // Arrow keys for nudge — tous les calques (y compris locked)
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        if (selectedIds.length === 0) return;
        e.preventDefault();

        const step = e.shiftKey ? 1 : 0.5;
        const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
        const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;

        selectedIds.forEach((id) => {
          const el = elements.find((el) => el.id === id);
          if (!el) return;
          onUpdate(id, {
            x_mm: Math.max(0, Math.min(template.width_mm - el.width_mm, el.x_mm + dx)),
            y_mm: Math.max(0, Math.min(template.height_mm - el.height_mm, el.y_mm + dy)),
          });
        });
        onCommit();
      }

      // Delete — skip locked
      if (e.key === "Delete" || e.key === "Backspace") {
        const deletableIds = selectedIds.filter((id) => {
          const el = elements.find((el) => el.id === id);
          return el && !el.locked;
        });
        if (deletableIds.length > 0) {
          window.dispatchEvent(
            new CustomEvent("editor:delete", { detail: { ids: deletableIds } })
          );
        }
      }

      // Ctrl+D duplicate
      if (e.key === "d" && (e.ctrlKey || e.metaKey)) {
        if (selectedIds.length > 0) {
          e.preventDefault();
          window.dispatchEvent(
            new CustomEvent("editor:duplicate", { detail: { ids: selectedIds } })
          );
        }
      }

      // Ctrl+C copy
      if (e.key === "c" && (e.ctrlKey || e.metaKey)) {
        if (selectedIds.length > 0) {
          e.preventDefault();
          window.dispatchEvent(
            new CustomEvent("editor:copy", { detail: { ids: selectedIds } })
          );
        }
      }

      // Ctrl+V paste
      if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("editor:paste"));
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedIds, elements, previewMode, template.width_mm, template.height_mm, onUpdate, onCommit]);

  // ─── Render element ────────────────────────────────────────────

  const renderElement = (el: TemplateElement) => {
    const x = el.x_mm * MM_TO_PX;
    const y = el.y_mm * MM_TO_PX;
    const w = el.width_mm * MM_TO_PX;
    const h = el.height_mm * MM_TO_PX;
    const isSelected = selectedIds.includes(el.id) && !previewMode;

    const baseStyle: React.CSSProperties = {
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      cursor: previewMode ? "default" : "move",
      outline: isSelected ? "2px solid #3b82f6" : "none",
      outlineOffset: 2,
      transition: dragging?.id === el.id || resizing?.id === el.id ? "none" : "outline-color 0.15s",
    };

    const content = (() => {
      switch (el.type) {
        case "text": {
          const fieldLabel = availableFields.find((f) => f.key === el.field)?.label ?? el.field ?? "Texte";
          return (
            <div
              style={{
                fontSize: el.style?.fontSize ? el.style.fontSize * MM_TO_PX / 3 : 10,
                fontWeight: el.style?.fontWeight === "bold" ? "bold" : "normal",
                fontStyle: el.style?.fontStyle || "normal",
                color: el.style?.color || "#000000",
                textAlign: el.style?.textAlign || "left",
                letterSpacing: el.style?.letterSpacing ? `${el.style.letterSpacing}px` : undefined,
                textTransform: el.style?.textTransform || "none",
                display: "flex",
                alignItems: "center",
                padding: 2,
                fontFamily: el.style?.fontFamily ? `${el.style.fontFamily}, sans-serif` : "Helvetica, Arial, sans-serif",
                lineHeight: 1.2,
              }}
            >
              {fieldLabel}
            </div>
          );
        }

        case "photo":
          return (
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#e5e7eb",
                borderRadius: el.shape === "circle" ? "50%" : 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <Camera className="w-5 h-5 text-gray-400" />
            </div>
          );

        case "qr":
          return (
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <QrCode className="w-6 h-6 text-gray-400" />
            </div>
          );

        case "logo":
          return (
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#f9fafb",
                border: "1px dashed #d1d5db",
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image className="w-5 h-5 text-gray-400" />
            </div>
          );

        case "barcode":
          return (
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Barcode className="w-5 h-5 text-gray-400" />
            </div>
          );

        case "rect":
          return (
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: el.backgroundColor || "#e5e7eb",
                borderRadius: el.borderRadius || 0,
              }}
            />
          );

        case "circle":
          return (
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: el.backgroundColor || "#e5e7eb",
                borderRadius: "50%",
              }}
            />
          );

        case "line":
          return (
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: el.strokeColor || "#d1d5db",
              }}
            />
          );

        default:
          return null;
      }
    })();

    // Resize handles — hidden for locked layers
    const resizeHandles = isSelected && !el.locked ? (
      <>
        {["nw", "ne", "sw", "se", "n", "s", "e", "w"].map((handle) => {
          const isCorner = handle.length === 2;
          const size = isCorner ? 8 : 6;
          const style: React.CSSProperties = {
            position: "absolute",
            width: size,
            height: size,
            backgroundColor: "#3b82f6",
            border: "1.5px solid white",
            borderRadius: 2,
            zIndex: 10,
          };

          if (handle.includes("n")) style.top = -size / 2;
          if (handle.includes("s")) style.bottom = -size / 2;
          if (handle.includes("w")) style.left = -size / 2;
          if (handle.includes("e")) style.right = -size / 2;
          if (handle === "n" || handle === "s") style.left = "50%";
          if (handle === "n" || handle === "s") style.transform = "translateX(-50%)";
          if (handle === "e" || handle === "w") style.top = "50%";
          if (handle === "e" || handle === "w") style.transform = "translateY(-50%)";

          const cursors: Record<string, string> = {
            nw: "nwse-resize",
            ne: "nesw-resize",
            sw: "nesw-resize",
            se: "nwse-resize",
            n: "ns-resize",
            s: "ns-resize",
            e: "ew-resize",
            w: "ew-resize",
          };

          return (
            <div
              key={handle}
              style={{ ...style, cursor: cursors[handle] }}
              onMouseDown={(e) => handleResizeStart(e, el.id, handle)}
            />
          );
        })}
      </>
    ) : null;

    return (
      <div
        key={el.id}
        style={baseStyle}
        onMouseDown={(e) => handleMouseDown(e, el.id)}
      >
        {content}
        {resizeHandles}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center p-8">
      <div
        ref={canvasRef}
        className="relative shadow-2xl rounded-lg overflow-hidden"
        style={{
          width: widthPx * zoom,
          height: heightPx * zoom,
          transform: `scale(1)`,
          transformOrigin: "center center",
        }}
        onClick={() => !previewMode && onSelect(null)}
      >
        {/* Background */}
        {template.background_url ? (
          <img
            src={template.background_url}
            alt="Fond"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
        ) : (
          <div className="absolute inset-0 bg-white" />
        )}

        {/* Grid */}
        {showGrid && !previewMode && (
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
              backgroundSize: `${MM_TO_PX * gridSize * zoom}px ${MM_TO_PX * gridSize * zoom}px`,
            }}
          />
        )}

        {/* Guide lines */}
        {guides.x !== undefined && !previewMode && (
          <div
            className="absolute top-0 bottom-0 w-px bg-red-400 pointer-events-none z-50"
            style={{ left: guides.x * MM_TO_PX * zoom }}
          />
        )}
        {guides.y !== undefined && !previewMode && (
          <div
            className="absolute left-0 right-0 h-px bg-red-400 pointer-events-none z-50"
            style={{ top: guides.y * MM_TO_PX * zoom }}
          />
        )}

        {/* Elements */}
        <div
          style={{
            width: widthPx,
            height: heightPx,
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
          }}
        >
          {elements.map(renderElement)}
        </div>
      </div>
    </div>
  );
}
