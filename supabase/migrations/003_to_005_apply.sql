-- =============================================================
-- Migration 003-005: Field Definitions + cleanup
-- Idempotent: peut être exécuté plusieurs fois sans erreur
-- =============================================================

-- Type enum
DO $$ BEGIN
  CREATE TYPE field_type AS ENUM (
    'TEXT','TEXTAREA','NUMBER','EMAIL','PHONE','DATE',
    'BOOLEAN','IMAGE','SELECT','MULTI_SELECT',
    'QRCODE','BARCODE','COLOR','URL'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Table field_definitions
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

-- Index
CREATE INDEX IF NOT EXISTS idx_field_definitions_event_id ON field_definitions(event_id);

-- RLS
ALTER TABLE field_definitions ENABLE ROW LEVEL SECURITY;

-- Policy
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'field_defs_via_event'
  ) THEN
    CREATE POLICY "field_defs_via_event" ON field_definitions
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM events
          WHERE events.id = field_definitions.event_id
          AND events.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Colonne field_values sur participants
ALTER TABLE participants ADD COLUMN IF NOT EXISTS field_values JSONB DEFAULT '{}'::jsonb;

-- Supprimer les colonnes fixes si elles existent
ALTER TABLE participants DROP COLUMN IF EXISTS phone;
ALTER TABLE participants DROP COLUMN IF EXISTS photo_url;
ALTER TABLE participants DROP COLUMN IF EXISTS category;
ALTER TABLE participants DROP COLUMN IF EXISTS role;
ALTER TABLE participants DROP COLUMN IF EXISTS "group";
ALTER TABLE participants DROP COLUMN IF EXISTS company;
ALTER TABLE participants DROP COLUMN IF EXISTS first_name;
ALTER TABLE participants DROP COLUMN IF EXISTS last_name;
ALTER TABLE participants DROP COLUMN IF EXISTS email;
