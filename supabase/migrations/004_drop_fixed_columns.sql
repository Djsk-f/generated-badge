-- =============================================================
-- Migration 004 : Drop fixed participant columns
-- =============================================================
-- Les champs phone, photo_url, category, role, group, company
-- sont maintenant stockés dans field_values JSONB via les
-- FieldDefinitions. Seuls first_name, last_name, email restent
-- comme colonnes fixes.

ALTER TABLE participants DROP COLUMN IF EXISTS phone;
ALTER TABLE participants DROP COLUMN IF EXISTS photo_url;
ALTER TABLE participants DROP COLUMN IF EXISTS category;
ALTER TABLE participants DROP COLUMN IF EXISTS role;
ALTER TABLE participants DROP COLUMN IF EXISTS "group";
ALTER TABLE participants DROP COLUMN IF EXISTS company;
