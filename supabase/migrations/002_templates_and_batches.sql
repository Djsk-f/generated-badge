-- =============================================================
-- Migration 002: Templates globaux + badge_batches
-- =============================================================
-- Les templates sont globaux (réutilisables entre événements).
-- Chaque utilisateur a sa propre bibliothèque de templates.
-- =============================================================

-- ─── Table : templates (global par user) ─────────────────────
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  background_url TEXT,
  width_mm NUMERIC(6,2) NOT NULL DEFAULT 85.6,
  height_mm NUMERIC(6,2) NOT NULL DEFAULT 53.98,
  orientation TEXT CHECK (orientation IN ('landscape', 'portrait')) DEFAULT 'landscape',
  bleed_mm NUMERIC(4,2) DEFAULT 0,
  safety_margin_mm NUMERIC(4,2) DEFAULT 3,
  elements JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_templates_user_id ON templates(user_id);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_templates" ON templates
  FOR ALL USING (auth.uid() = user_id);

-- ─── Table : badge_batches ───────────────────────────────────
CREATE TABLE IF NOT EXISTS badge_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  template_id UUID REFERENCES templates(id),
  badge_count INTEGER NOT NULL DEFAULT 0,
  generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_badge_batches_event_id ON badge_batches(event_id);

ALTER TABLE badge_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "batches_via_event" ON badge_batches
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = badge_batches.event_id
      AND events.user_id = auth.uid()
    )
  );

-- ─── Storage bucket ──────────────────────────────────────────
-- Créer "template-backgrounds" (public) dans Supabase Dashboard > Storage
