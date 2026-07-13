/**
 * Types globaux de l'application Badge Management Platform.
 *
 * @module types
 */

// ─── Enums & Constants ──────────────────────────────────────────────

export const BADGE_STATUSES = [
  "NOT_READY",
  "READY",
  "GENERATING",
  "GENERATED",
  "LOST",
  "REPLACED",
] as const;

export type BadgeStatus = (typeof BADGE_STATUSES)[number];

export const HISTORY_ACTIONS = [
  "CREATED",
  "GENERATED",
  "DOWNLOADED",
  "REPRINTED",
  "LOST",
  "REPLACED",
] as const;

export type HistoryAction = (typeof HISTORY_ACTIONS)[number];

export const BADGE_SIZES = {
  CREDIT_CARD: { width: 85.6, height: 53.98, label: "Carte bancaire (85.6 x 54 mm)" },
  VERTICAL: { width: 53.98, height: 85.6, label: "PVC Vertical (54 x 86 mm)" },
  A6: { width: 105, height: 148, label: "A6 (105 x 148 mm)" },
  A7: { width: 74, height: 105, label: "A7 (74 x 105 mm)" },
  CUSTOM: { width: 0, height: 0, label: "Personnalisé" },
} as const;

export type BadgeSizeKey = keyof typeof BADGE_SIZES;

// ─── Database Models ────────────────────────────────────────────────

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface BadgeEvent {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  logo_url: string | null;
  badge_width_mm: number;
  badge_height_mm: number;
  badge_orientation: "landscape" | "portrait";
  active_template_id: string | null;
  created_at: string;
  updated_at: string;
}

/** @deprecated Utiliser BadgeEvent à la place */
export type Event = BadgeEvent;

export interface Participant {
  id: string;
  event_id: string;
  /** Toutes les données du participant, pilotées par les FieldDefinitions */
  field_values: Record<string, string>;
  metadata: Record<string, unknown>;
  collect_token: string | null;
  collect_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Badge {
  id: string;
  event_id: string;
  participant_id: string;
  template_id: string | null;
  badge_code: string;
  /** @deprecated Utiliser batch_number à la place */
  batch_id: string | null;
  /** Numéro de batch séquentiel (1, 2, 3...) */
  batch_number: number | null;
  status: BadgeStatus;
  pdf_url: string | null;
  generated_at: string | null;
  created_at: string;
}

export interface BadgeBatch {
  id: string;
  event_id: string;
  user_id: string;
  template_id: string | null;
  badge_count: number;
  generated_at: string | null;
  created_at: string;
}

export interface BadgeHistory {
  id: string;
  badge_id: string;
  event_id: string;
  action: HistoryAction;
  details: Record<string, unknown>;
  created_at: string;
}

// ─── Field Definitions (Metadata-Driven) ──────────────────────────────

export const FIELD_TYPES = [
  "TEXT",
  "TEXTAREA",
  "NUMBER",
  "EMAIL",
  "PHONE",
  "DATE",
  "BOOLEAN",
  "IMAGE",
  "SELECT",
  "MULTI_SELECT",
  "QRCODE",
  "BARCODE",
  "COLOR",
  "URL",
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  TEXT: "Texte",
  TEXTAREA: "Texte long",
  NUMBER: "Nombre",
  EMAIL: "Email",
  PHONE: "Téléphone",
  DATE: "Date",
  BOOLEAN: "Oui/Non",
  IMAGE: "Image",
  SELECT: "Sélection",
  MULTI_SELECT: "Sélection multiple",
  QRCODE: "QR Code",
  BARCODE: "Code-barres",
  COLOR: "Couleur",
  URL: "URL",
};

export interface FieldDefinition {
  id: string;
  event_id: string;
  key: string;
  label: string;
  field_type: FieldType;
  required: boolean;
  placeholder: string | null;
  default_value: string | null;
  options: string[];
  validation: Record<string, unknown>;
  order: number;
  visible_on_badge: boolean;
  visible_in_form: boolean;
  is_display_name: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Entrée pour le dropdown du template editor.
 * Générée dynamiquement à partir des FieldDefinitions d'un événement.
 */
export interface AvailableField {
  key: string;
  label: string;
}

// ─── Template Types ─────────────────────────────────────────────────

/**
 * Template global — appartient à un utilisateur, réutilisable entre événements.
 */
export interface Template {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  background_url: string | null;
  width_mm: number;
  height_mm: number;
  orientation: "landscape" | "portrait";
  bleed_mm: number;
  safety_margin_mm: number;
  elements: TemplateElement[];
  created_at: string;
  updated_at: string;
}

export type TemplateElementType =
  | "text"
  | "photo"
  | "qr"
  | "barcode"
  | "logo"
  | "rect"
  | "circle"
  | "line";

export interface TemplateElement {
  id: string;
  type: TemplateElementType;
  /** Nom personnalisé du calque (utilisé comme variable pour l'import Excel) */
  name?: string;
  /** Verrouillé = pas de déplacement/sélection sur le canvas */
  locked?: boolean;
  x_mm: number;
  y_mm: number;
  width_mm: number;
  height_mm: number;
  /** Champ de données lié (ex: "participant.fullname") */
  field?: string;
  style?: {
    fontSize?: number;
    fontWeight?: "normal" | "bold";
    fontStyle?: "normal" | "italic";
    fontFamily?: string;
    color?: string;
    textAlign?: "left" | "center" | "right";
    letterSpacing?: number;
    textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  };
  shape?: "rect" | "circle";
  source?: "event";
  backgroundColor?: string;
  borderRadius?: number;
  strokeColor?: string;
  strokeWidth?: number;
}

export const AVAILABLE_FIELDS = [
  { key: "event.name", label: "Nom événement" },
  { key: "event.location", label: "Lieu" },
  { key: "badge.code", label: "Code badge" },
  { key: "badge.qr_data", label: "QR Code" },
] as const;

export const AVAILABLE_COMPONENTS = [
  { type: "text" as const, label: "Texte", icon: "Type" },
  { type: "photo" as const, label: "Photo", icon: "Camera" },
  { type: "qr" as const, label: "QR Code", icon: "QrCode" },
  { type: "logo" as const, label: "Logo", icon: "Image" },
  { type: "barcode" as const, label: "Code-barres", icon: "Barcode" },
  { type: "rect" as const, label: "Rectangle", icon: "Square" },
  { type: "circle" as const, label: "Cercle", icon: "Circle" },
  { type: "line" as const, label: "Ligne", icon: "Minus" },
] as const;

/** Polices disponibles pour les éléments texte. */
export const FONT_FAMILIES = [
  // Sans-serif modernes
  { value: "Montserrat", label: "Montserrat", category: "Sans-serif", pdfFamily: "Helvetica" },
  { value: "Poppins", label: "Poppins", category: "Sans-serif", pdfFamily: "Helvetica" },
  { value: "DM Sans", label: "DM Sans", category: "Sans-serif", pdfFamily: "Helvetica" },
  { value: "Outfit", label: "Outfit", category: "Sans-serif", pdfFamily: "Helvetica" },
  { value: "Sora", label: "Sora", category: "Sans-serif", pdfFamily: "Helvetica" },
  { value: "Raleway", label: "Raleway", category: "Sans-serif", pdfFamily: "Helvetica" },
  { value: "Oswald", label: "Oswald", category: "Sans-serif condensé", pdfFamily: "Helvetica" },
  { value: "Bebas Neue", label: "Bebas Neue", category: "Display", pdfFamily: "Helvetica" },
  // Serif élégantes
  { value: "Playfair Display", label: "Playfair Display", category: "Serif", pdfFamily: "Times-Roman" },
  { value: "Libre Baskerville", label: "Libre Baskerville", category: "Serif", pdfFamily: "Times-Roman" },
  { value: "Crimson Pro", label: "Crimson Pro", category: "Serif", pdfFamily: "Times-Roman" },
  // Classiques PDF
  { value: "Helvetica", label: "Helvetica (PDF)", category: "Classique", pdfFamily: "Helvetica" },
  { value: "Times Roman", label: "Times Roman (PDF)", category: "Classique", pdfFamily: "Times-Roman" },
  { value: "Courier", label: "Courier (PDF)", category: "Classique", pdfFamily: "Courier" },
] as const;

// ─── Form & Action Types ────────────────────────────────────────────

export type ActionResponse<T = void> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; details?: Record<string, string[]> };

export interface BatchState {
  batchNumber: number;
  total: number;
  processed: number;
  failed: number;
  status: "idle" | "running" | "completed" | "error";
}

export interface CollectFormData {
  event_id: string;
  field_values: Record<string, string>;
}

export interface DashboardStats {
  totalEvents: number;
  totalParticipants: number;
  totalBadgesGenerated: number;
  totalBadgesPending: number;
}
