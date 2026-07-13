-- =============================================================
-- Event Badge Generator - Schéma de base de données
-- =============================================================
-- Exécuter dans l'éditeur SQL de Supabase ou via le CLI :
--   supabase db push
-- =============================================================

-- ─── Extension UUID ──────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Table : profiles ────────────────────────────────────────
-- Extension de auth.users pour stocker le nom complet
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS : chaque utilisateur ne voit que son profil
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_profile" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Trigger : créer un profil automatiquement à l'inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── Table : events ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  location TEXT,
  logo_url TEXT,
  active_template_id UUID,
  badge_width_mm NUMERIC(6,2) DEFAULT 85.60,
  badge_height_mm NUMERIC(6,2) DEFAULT 53.98,
  badge_orientation TEXT CHECK (badge_orientation IN ('landscape', 'portrait')) DEFAULT 'landscape',
  custom_fields JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_events_user_id ON events(user_id);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_events" ON events
  FOR ALL USING (auth.uid() = user_id);

-- ─── Table : participants ────────────────────────────────────
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  photo_url TEXT,
  category TEXT,
  role TEXT,
  "group" TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  collect_token TEXT,
  collect_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_participants_event_id ON participants(event_id);

ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "participants_via_event" ON participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = participants.event_id
      AND events.user_id = auth.uid()
    )
  );

-- ─── Table : badges ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  template_id UUID,
  badge_code TEXT NOT NULL,
  batch_id UUID,
  status TEXT NOT NULL CHECK (status IN (
    'NOT_READY','READY','GENERATING','GENERATED','LOST','REPLACED'
  )) DEFAULT 'NOT_READY',
  pdf_url TEXT,
  generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_badges_event_id ON badges(event_id);
CREATE INDEX idx_badges_participant_id ON badges(participant_id);
CREATE INDEX idx_badges_status ON badges(status);

-- Unicité du code badge par événement
CREATE UNIQUE INDEX idx_badges_code_event ON badges(badge_code, event_id);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "badges_via_event" ON badges
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = badges.event_id
      AND events.user_id = auth.uid()
    )
  );

-- ─── Table : badge_history ───────────────────────────────────
CREATE TABLE IF NOT EXISTS badge_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN (
    'CREATED','GENERATED','DOWNLOADED','REPRINTED','REPLACED','LOST'
  )),
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_badge_history_badge_id ON badge_history(badge_id);
CREATE INDEX idx_badge_history_event_id ON badge_history(event_id);

ALTER TABLE badge_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "history_via_event" ON badge_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = badge_history.event_id
      AND events.user_id = auth.uid()
    )
  );

-- ─── Storage Buckets ─────────────────────────────────────────
-- Créer les buckets dans Supabase Dashboard > Storage :
-- 1. "event-logos" (public)
-- 2. "participant-photos" (public)
-- 3. "badge-pdfs" (private)
-- 4. "template-backgrounds" (public)

-- Politiques Storage (à exécuter si nécessaire) :
-- INSERT pour les utilisateurs authentifiés
-- SELECT public pour les logos, photos et templates
-- SELECT private pour les PDFs (via URL signée)
