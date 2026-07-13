-- =============================================================
-- Migration 006: Add is_display_name to field_definitions
-- =============================================================
-- Permet d'identifier quel champ représente l'identité principale
-- d'un participant (ex: "nom", "fullname").
-- Seul un champ par événement peut avoir is_display_name = true.

ALTER TABLE field_definitions ADD COLUMN IF NOT EXISTS is_display_name BOOLEAN DEFAULT false;

-- Index pour retrouver rapidement le champ d'affichage d'un événement
CREATE INDEX IF NOT EXISTS idx_field_definitions_display_name
  ON field_definitions(event_id)
  WHERE is_display_name = true;
