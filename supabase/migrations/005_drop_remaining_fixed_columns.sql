-- =============================================================
-- Migration 005 : Drop remaining fixed participant columns
-- =============================================================
-- Aucune colonne fixe pour les données participant.
-- Tout est dans field_values JSONB, piloté par les
-- FieldDefinitions (auto-générées depuis les calques du template).

ALTER TABLE participants DROP COLUMN IF EXISTS first_name;
ALTER TABLE participants DROP COLUMN IF EXISTS last_name;
ALTER TABLE participants DROP COLUMN IF EXISTS email;
