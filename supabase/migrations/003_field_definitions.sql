-- =============================================================
-- Migration 003: Field Definitions
-- =============================================================
-- Chaque événement définit ses propres champs de données.
-- Le moteur est 100% piloté par les métadonnées (metadata-driven).
-- =============================================================

-- ─── Types énumérés ─────────────────────────────────────────
CREATE TYPE field_type AS ENUM (
  'TEXT',
  'TEXTAREA',
  'NUMBER',
  'EMAIL',
  'PHONE',
  'DATE',
  'BOOLEAN',
  'IMAGE',
  'SELECT',
  'MULTI_SELECT',
  'QRCODE',
  'BARCODE',
  'COLOR',
  'URL'
);

-- ─── Table : field_definitions ──────────────────────────────
CREATE TABLE IF NOT EXISTS field_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  label TEXT NOT NULL,
  field_type field_type NOT NULL DEFAULT 'TEXT',
  required BOOLEAN DEFAULT false,
  placeholder TEXT,
  default_value TEXT,
  options JSONB DEFAULT '[]'::jsonb,
  validation JSONB DEFAULT '{}'::jsonb,
  "order" INTEGER NOT NULL DEFAULT 0,
  visible_on_badge BOOLEAN DEFAULT true,
  visible_in_form BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, key)
);

CREATE INDEX idx_field_definitions_event_id ON field_definitions(event_id);

ALTER TABLE field_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "field_defs_via_event" ON field_definitions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = field_definitions.event_id
      AND events.user_id = auth.uid()
    )
  );

-- ─── Ajouter field_values aux participants ──────────────────
-- Les données métier vont dans ce JSONB au lieu de colonnes fixes.
-- Les colonnes first_name/last_name/etc. restent pour rétrocompatibilité
-- et seront supprimées en Phase 6.
ALTER TABLE participants ADD COLUMN IF NOT EXISTS field_values JSONB DEFAULT '{}'::jsonb;
