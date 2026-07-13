-- =============================================================
-- Migration 007: Ajouter batch_number à la table badges
-- =============================================================
-- Le code utilise batch_number (INTEGER) pour la numérotation
-- séquentielle des batches, mais le schéma initial avait
-- batch_id (UUID) pour référencer badge_batches.
-- Cette migration ajoute batch_number tout en gardant batch_id
-- pour la rétrocompatibilité.
-- =============================================================

-- Ajouter la colonne batch_number
ALTER TABLE badges ADD COLUMN IF NOT EXISTS batch_number INTEGER;

-- Créer un index pour les requêtes par batch
CREATE INDEX IF NOT EXISTS idx_badges_batch_number ON badges(batch_number);

-- Copier les données de batch_id vers batch_number si nécessaire
-- (batch_id est un UUID, on ne peut pas le convertir en INTEGER directement)
-- On laisse batch_id intact pour la rétrocompatibilité
