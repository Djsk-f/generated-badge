/**
 * Panneau de propriétés de l'élément sélectionné.
 *
 * @module components/templates/editor-properties
 */

"use client";

import { useState, useRef, useEffect } from "react";
import {
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Trash2,
  Copy,
  Lock,
  Unlock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { type TemplateElement, type AvailableField, AVAILABLE_FIELDS, FONT_FAMILIES } from "@/lib/types";

/**
 * URL des fonts supplémentaires chargées dynamiquement dans le template editor.
 * Ces fonts ne sont pas chargées dans le layout principal pour réduire le bundle.
 */
const EXTRA_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700&family=Libre+Baskerville:wght@400;700&family=Crimson+Pro:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700&family=Sora:wght@300;400;500;600;700&display=swap";

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
  element: TemplateElement | null;
  backgroundUrl?: string | null;
  availableFields?: AvailableField[];
  onUpdate: (patch: Partial<TemplateElement>) => void;
  onCommit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onReorder: (direction: "up" | "down" | "top" | "bottom") => void;
}

export function EditorProperties({
  element,
  backgroundUrl,
  availableFields = [...AVAILABLE_FIELDS],
  onUpdate,
  onCommit,
  onDuplicate,
  onDelete,
  onReorder,
}: Props) {
  const [tab, setTab] = useState<"position" | "style" | "data">("position");

  // Charger les fonts supplémentaires dynamiquement
  useEffect(() => {
    const existingLink = document.querySelector(`link[href="${EXTRA_FONTS_URL}"]`);
    if (!existingLink) {
      const link = document.createElement("link");
      link.href = EXTRA_FONTS_URL;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
  }, []);

  if (!element) {
    return (
      <div className="w-64 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-3 border-b border-gray-100">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Propriétés
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <span className="text-gray-400 text-lg">...</span>
            </div>
            <p className="text-sm text-gray-500">
              Sélectionnez un élément pour éditer ses propriétés
            </p>
          </div>
        </div>
      </div>
    );
  }

  const updateAndCommit = (patch: Partial<TemplateElement>) => {
    onUpdate(patch);
  };

  const commitAndFlush = () => {
    onCommit();
  };

  const isText = element.type === "text";
  const isPhoto = element.type === "photo";
  const isShape = element.type === "rect" || element.type === "circle";
  const isLine = element.type === "line";
  const hasData = !isShape && !isLine;

  const typeLabel =
    element.type === "text" ? "Texte"
    : element.type === "photo" ? "Photo"
    : element.type === "qr" ? "QR Code"
    : element.type === "logo" ? "Logo"
    : element.type === "barcode" ? "Code-barres"
    : element.type === "rect" ? "Rectangle"
    : element.type === "circle" ? "Cercle"
    : element.type === "line" ? "Ligne"
    : element.type;

  return (
    <div className="w-64 bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {typeLabel}
          </h3>
          <div className="flex gap-0.5">
            <Button size="sm" variant="ghost" onClick={onDuplicate} title="Dupliquer">
              <Copy className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              className="text-red-500 hover:text-red-600"
              title="Supprimer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-2">
          {(["position", "style", "data"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${
                tab === t
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "position" ? "Position" : t === "style" ? "Style" : "Données"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {tab === "position" && (
          <>
            {/* Position */}
            <FieldGroup label="Position (mm)">
              <div className="grid grid-cols-2 gap-2">
                <NumberInput
                  label="X"
                  value={element.x_mm}
                  onChange={(v) => updateAndCommit({ x_mm: v })}
                  onBlur={commitAndFlush}
                  step={0.5}
                />
                <NumberInput
                  label="Y"
                  value={element.y_mm}
                  onChange={(v) => updateAndCommit({ y_mm: v })}
                  onBlur={commitAndFlush}
                  step={0.5}
                />
              </div>
            </FieldGroup>

            {/* Taille */}
            <FieldGroup label="Taille (mm)">
              <div className="grid grid-cols-2 gap-2">
                <NumberInput
                  label="Larg."
                  value={element.width_mm}
                  onChange={(v) => updateAndCommit({ width_mm: v })}
                  onBlur={commitAndFlush}
                  step={0.5}
                  min={1}
                />
                <NumberInput
                  label="Haut."
                  value={element.height_mm}
                  onChange={(v) => updateAndCommit({ height_mm: v })}
                  onBlur={commitAndFlush}
                  step={0.5}
                  min={1}
                />
              </div>
            </FieldGroup>

            {/* Z-order */}
            <FieldGroup label="Ordre des couches">
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => onReorder("top")} className="flex-1">
                  <ChevronsUp className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => onReorder("up")} className="flex-1">
                  <ArrowUp className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => onReorder("down")} className="flex-1">
                  <ArrowDown className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => onReorder("bottom")} className="flex-1">
                  <ChevronsDown className="w-3 h-3" />
                </Button>
              </div>
            </FieldGroup>
          </>
        )}

        {tab === "style" && (
          <>
            {isText && (
              <>
                <FieldGroup label="Typographie">
                  <SelectInput
                    label="Police"
                    value={element.style?.fontFamily ?? "Montserrat"}
                    onChange={(v) => updateAndCommit({ style: { ...element.style, fontFamily: v } })}
                    onBlur={commitAndFlush}
                    options={FONT_FAMILIES.map((f) => ({ value: f.value, label: f.label }))}
                    groups={[
                      { label: "Sans-serif", values: ["Montserrat", "Poppins", "DM Sans", "Outfit", "Sora", "Raleway", "Oswald"] },
                      { label: "Display", values: ["Bebas Neue"] },
                      { label: "Serif", values: ["Playfair Display", "Libre Baskerville", "Crimson Pro"] },
                      { label: "Classiques PDF", values: ["Helvetica", "Times Roman", "Courier"] },
                    ]}
                  />
                  <NumberInput
                    label="Taille police"
                    value={element.style?.fontSize ?? 12}
                    onChange={(v) => updateAndCommit({ style: { ...element.style, fontSize: v } })}
                    onBlur={commitAndFlush}
                    min={4}
                    max={72}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <SelectInput
                      label="Graisse"
                      value={element.style?.fontWeight ?? "normal"}
                      onChange={(v) => updateAndCommit({ style: { ...element.style, fontWeight: v as "normal" | "bold" } })}
                      onBlur={commitAndFlush}
                      options={[
                        { value: "normal", label: "Normal" },
                        { value: "bold", label: "Gras" },
                      ]}
                    />
                    <SelectInput
                      label="Style"
                      value={element.style?.fontStyle ?? "normal"}
                      onChange={(v) => updateAndCommit({ style: { ...element.style, fontStyle: v as "normal" | "italic" } })}
                      onBlur={commitAndFlush}
                      options={[
                        { value: "normal", label: "Droit" },
                        { value: "italic", label: "Italique" },
                      ]}
                    />
                  </div>
                  <SelectInput
                    label="Alignement"
                    value={element.style?.textAlign ?? "left"}
                    onChange={(v) => updateAndCommit({ style: { ...element.style, textAlign: v as "left" | "center" | "right" } })}
                    onBlur={commitAndFlush}
                    options={[
                      { value: "left", label: "Gauche" },
                      { value: "center", label: "Centre" },
                      { value: "right", label: "Droite" },
                    ]}
                  />
                </FieldGroup>
                <FieldGroup label="Espacement">
                  <NumberInput
                    label="Inter-lettres"
                    value={element.style?.letterSpacing ?? 0}
                    onChange={(v) => updateAndCommit({ style: { ...element.style, letterSpacing: v } })}
                    onBlur={commitAndFlush}
                    min={-5}
                    max={20}
                  />
                  <SelectInput
                    label="Transforme"
                    value={element.style?.textTransform ?? "none"}
                    onChange={(v) => updateAndCommit({ style: { ...element.style, textTransform: v as "none" | "uppercase" | "lowercase" | "capitalize" } })}
                    onBlur={commitAndFlush}
                    options={[
                      { value: "none", label: "Aucun" },
                      { value: "uppercase", label: "Majuscules" },
                      { value: "lowercase", label: "Minuscules" },
                      { value: "capitalize", label: "Capitalize" },
                    ]}
                  />
                </FieldGroup>
                <FieldGroup label="Couleur">
                  <ColorInput
                    value={element.style?.color ?? "#000000"}
                    onChange={(v) => updateAndCommit({ style: { ...element.style, color: v } })}
                    onBlur={commitAndFlush}
                    backgroundUrl={backgroundUrl}
                  />
                </FieldGroup>
              </>
            )}

            {isPhoto && (
              <FieldGroup label="Forme">
                <SelectInput
                  label="Forme"
                  value={element.shape ?? "rect"}
                  onChange={(v) => updateAndCommit({ shape: v as "rect" | "circle" })}
                  onBlur={commitAndFlush}
                  options={[
                    { value: "rect", label: "Rectangle" },
                    { value: "circle", label: "Cercle" },
                  ]}
                />
              </FieldGroup>
            )}

            {isShape && (
              <FieldGroup label="Apparence">
                <ColorInput
                  label="Couleur de fond"
                  value={element.backgroundColor ?? "#e5e7eb"}
                  onChange={(v) => updateAndCommit({ backgroundColor: v })}
                  onBlur={commitAndFlush}
                  backgroundUrl={backgroundUrl}
                />
                {element.type === "rect" && (
                  <NumberInput
                    label="Border radius"
                    value={element.borderRadius ?? 0}
                    onChange={(v) => updateAndCommit({ borderRadius: v })}
                    onBlur={commitAndFlush}
                    min={0}
                    max={50}
                  />
                )}
              </FieldGroup>
            )}

            {isLine && (
              <FieldGroup label="Apparence">
                <ColorInput
                  label="Couleur"
                  value={element.strokeColor ?? "#000000"}
                  onChange={(v) => updateAndCommit({ strokeColor: v })}
                  onBlur={commitAndFlush}
                  backgroundUrl={backgroundUrl}
                />
                <NumberInput
                  label="Épaisseur (mm)"
                  value={element.strokeWidth ?? 0.5}
                  onChange={(v) => updateAndCommit({ strokeWidth: v })}
                  onBlur={commitAndFlush}
                  step={0.1}
                  min={0.1}
                />
              </FieldGroup>
            )}
          </>
        )}

        {tab === "data" && (
          <>
            {/* Nom du calque */}
            <FieldGroup label="Nom du calque">
              <input
                type="text"
                value={element.name ?? ""}
                onChange={(e) => updateAndCommit({ name: e.target.value || undefined })}
                onBlur={commitAndFlush}
                placeholder={TYPE_LABELS[element.type] ?? element.type}
                className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm
                           focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                           outline-none transition-colors"
              />
              <p className="text-xs text-gray-400 mt-1">
                Ce nom sera utilisé comme <strong>variable</strong> lors de l&apos;import Excel.
              </p>
            </FieldGroup>

            {/* Champ de données */}
            {hasData ? (
              <FieldGroup label="Champ de données">
                <select
                  value={element.field ?? ""}
                  onChange={(e) => {
                    updateAndCommit({ field: e.target.value || undefined });
                    commitAndFlush();
                  }}
                  className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm
                             focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                             outline-none transition-colors bg-white"
                >
                  <option value="">— Aucun champ —</option>
                  {availableFields.map((f) => (
                    <option key={f.key} value={f.key}>
                      {f.label}
                    </option>
                  ))}
                </select>
                {element.field && (
                  <p className="text-xs text-gray-400 mt-1">
                    Clé : <code className="bg-gray-100 px-1 rounded">{element.field}</code>
                  </p>
                )}
              </FieldGroup>
            ) : (
              <div className="text-center text-gray-400 py-6">
                <p className="text-sm">Pas de données pour ce type</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Sous-composants ──────────────────────────────────────────────

function FieldGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
        {label}
      </label>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  onBlur,
  step = 1,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  onBlur?: () => void;
  step?: number;
  min?: number;
  max?: number;
}) {
  const [local, setLocal] = useState(String(value));
  const lastCommitted = useRef(value);

  // Sync when element switches or external value changes (not while typing)
  useEffect(() => {
    if (document.activeElement?.getAttribute("type") !== "number") {
      setLocal(String(value));
      lastCommitted.current = value;
    }
  }, [value]);

  const commit = () => {
    const num = Number(local);
    if (local === "" || isNaN(num)) {
      setLocal(String(lastCommitted.current));
    } else {
      const clamped = min !== undefined ? Math.max(min, num) : num;
      const final = max !== undefined ? Math.min(max, clamped) : clamped;
      if (final !== lastCommitted.current) {
        onChange(final);
        lastCommitted.current = final;
      }
      setLocal(String(final));
    }
    onBlur?.();
  };

  return (
    <div>
      <label className="text-xs text-gray-500 mb-0.5 block">{label}</label>
      <input
        type="number"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") { e.currentTarget.blur(); } }}
        step={step}
        min={min}
        max={max}
        className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-sm
                   focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                   outline-none transition-colors"
      />
    </div>
  );
}

function SelectInput({
  label,
  value,
  onChange,
  onBlur,
  options,
  groups,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  options: Array<{ value: string; label: string }>;
  groups?: Array<{ label: string; values: string[] }>;
}) {
  const renderOption = (o: { value: string; label: string }) => (
    <option key={o.value} value={o.value}>
      {o.label}
    </option>
  );

  return (
    <div>
      <label className="text-xs text-gray-500 mb-0.5 block">{label}</label>
      <select
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          onBlur?.();
        }}
        className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-sm
                   focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                   outline-none transition-colors bg-white"
      >
        {groups
          ? groups.map((g) => (
              <optgroup key={g.label} label={g.label}>
                {options.filter((o) => g.values.includes(o.value)).map(renderOption)}
              </optgroup>
            ))
          : options.map(renderOption)}
      </select>
    </div>
  );
}

function ColorInput({
  label,
  value,
  onChange,
  onBlur,
  backgroundUrl,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  backgroundUrl?: string | null;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [imgPickerOpen, setImgPickerOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoverColor, setHoverColor] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu au clicextérieur
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const handleEyedropper = async () => {
    setMenuOpen(false);
    if (typeof window !== "undefined" && "EyeDropper" in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) onChange(result.sRGBHex);
      } catch {}
    } else {
      alert("Pipette non supportée. Utilisez Chrome ou Edge.");
    }
  };

  const openImagePicker = () => {
    setMenuOpen(false);
    setImgPickerOpen(true);
  };

  const handleImgLoad = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.drawImage(img, 0, 0);
  };

  const pickFromImage = (e: React.MouseEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * img.naturalWidth;
    const y = ((e.clientY - rect.top) / rect.height) * img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const px = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
    const hex = `#${[px[0], px[1], px[2]].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
    onChange(hex);
    setImgPickerOpen(false);
    setHoverColor(null);
  };

  const imgRef = useRef<HTMLImageElement | null>(null);

  // Charger image pour le picker
  useEffect(() => {
    if (!imgPickerOpen || !backgroundUrl) return;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      handleImgLoad(img);
    };
    img.src = backgroundUrl;
  }, [imgPickerOpen, backgroundUrl]);

  return (
    <>
      <div>
        {label && <label className="text-xs text-gray-500 mb-0.5 block">{label}</label>}
        <div className="flex items-stretch">
          {/* Color swatch */}
          <div className="relative flex-shrink-0">
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div
              className="w-9 h-9 rounded-l-lg border border-r-0 border-gray-200 cursor-pointer transition-shadow hover:shadow-md"
              style={{ backgroundColor: value }}
            />
          </div>

          {/* Hex input */}
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            className="flex-1 px-2 py-1.5 border border-gray-200 text-sm font-mono
                       focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                       outline-none transition-colors min-w-0"
          />

          {/* Pipette button */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-r-lg
                         border border-gray-200 hover:bg-gray-50 transition-colors"
              title="Pipette"
            >
              <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.773 4.773zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-1 overflow-hidden">
                <button
                  onClick={handleEyedropper}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.773 4.773zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-left">
                    <div className="font-medium">Pipette écran</div>
                    <div className="text-xs text-gray-400">Chrome, Edge</div>
                  </div>
                </button>
                {backgroundUrl && (
                  <button
                    onClick={openImagePicker}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25a1.5 1.5 0 001.5 1.5z" />
                    </svg>
                    <div className="text-left">
                      <div className="font-medium">Pipette image</div>
                      <div className="text-xs text-gray-400">Depuis le fond</div>
                    </div>
                  </button>
                )}
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <div className="px-3 py-2 flex items-center gap-2">
                    <div className="w-5 h-5 rounded border border-gray-200" style={{ backgroundColor: value }} />
                    <span className="text-xs font-mono text-gray-500">{value}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image picker modal */}
      {imgPickerOpen && backgroundUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div>
                <h3 className="font-semibold text-gray-900">Choisir une couleur</h3>
                <p className="text-xs text-gray-500 mt-0.5">Cliquez sur l&apos;image pour sélectionner</p>
              </div>
              <div className="flex items-center gap-3">
                {hoverColor && (
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5">
                    <div className="w-5 h-5 rounded border border-gray-200" style={{ backgroundColor: hoverColor }} />
                    <span className="text-xs font-mono text-gray-600">{hoverColor}</span>
                  </div>
                )}
                <button
                  onClick={() => { setImgPickerOpen(false); setHoverColor(null); }}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            <div
              className="relative cursor-crosshair bg-[conic-gradient(#e5e7eb_0_25%,transparent_0_50%,#e5e7eb_0_75%,transparent_0)] bg-[length:16px_16px]"
              style={{ backgroundImage: "linear-gradient(45deg, #f3f4f6 25%, transparent 25%), linear-gradient(-45deg, #f3f4f6 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f3f4f6 75%), linear-gradient(-45deg, transparent 75%, #f3f4f6 75%)", backgroundSize: "16px 16px", backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0" }}
              onMouseMove={(e) => {
                const canvas = canvasRef.current;
                const img = imgRef.current;
                if (!canvas || !img) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * img.naturalWidth;
                const y = ((e.clientY - rect.top) / rect.height) * img.naturalHeight;
                const ctx = canvas.getContext("2d");
                if (!ctx) return;
                const px = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
                setHoverColor(`#${[px[0], px[1], px[2]].map((c) => c.toString(16).padStart(2, "0")).join("")}`);
              }}
              onClick={pickFromImage}
              onMouseLeave={() => setHoverColor(null)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={backgroundUrl}
                alt=""
                className="w-full h-auto max-h-[60vh] object-contain relative z-10"
                draggable={false}
              />
              {hoverColor && (
                <div
                  className="absolute z-20 w-7 h-7 rounded-full border-[3px] border-white shadow-lg pointer-events-none -translate-x-1/2 -translate-y-1/2"
                  style={{ backgroundColor: hoverColor, left: "50%", top: "50%" }}
                />
              )}
            </div>
            <div className="px-5 py-3 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => { setImgPickerOpen(false); setHoverColor(null); }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </>
  );
}
