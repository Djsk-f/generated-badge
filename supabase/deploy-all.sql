-- =============================================================
-- BadgeGen — Migration complète pour déploiement
-- =============================================================
-- Copier/coller ce fichier dans Supabase Dashboard → SQL Editor
-- Exécuter une seule fois
-- =============================================================

-- ─── Extension UUID ──────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Type enum field_type ────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE field_type AS ENUM (
    'TEXT','TEXTAREA','NUMBER','EMAIL','PHONE','DATE',
    'BOOLEAN','IMAGE','SELECT','MULTI_SELECT',
    'QRCODE','BARCODE','COLOR','URL'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ─── Table : profiles ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'users_own_profile') THEN
    CREATE POLICY "users_own_profile" ON profiles
      FOR ALL USING (auth.uid() = id);
  END IF;
END $$;

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

CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'users_own_events') THEN
    CREATE POLICY "users_own_events" ON events
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ─── Table : participants ────────────────────────────────────
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  field_values JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  collect_token TEXT,
  collect_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_participants_event_id ON participants(event_id);

ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'participants_via_event') THEN
    CREATE POLICY "participants_via_event" ON participants
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM events
          WHERE events.id = participants.event_id
          AND events.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ─── Table : templates ───────────────────────────────────────
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

CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'users_own_templates') THEN
    CREATE POLICY "users_own_templates" ON templates
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ─── Table : field_definitions ───────────────────────────────
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
  is_display_name BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, key)
);

CREATE INDEX IF NOT EXISTS idx_field_definitions_event_id ON field_definitions(event_id);

ALTER TABLE field_definitions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'field_defs_via_event') THEN
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

-- ─── Table : badges ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  template_id UUID,
  badge_code TEXT NOT NULL,
  batch_number INTEGER,
  status TEXT NOT NULL CHECK (status IN (
    'NOT_READY','READY','GENERATING','GENERATED','LOST','REPLACED'
  )) DEFAULT 'NOT_READY',
  pdf_url TEXT,
  generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_badges_event_id ON badges(event_id);
CREATE INDEX IF NOT EXISTS idx_badges_participant_id ON badges(participant_id);
CREATE INDEX IF NOT EXISTS idx_badges_status ON badges(status);
CREATE INDEX IF NOT EXISTS idx_badges_batch_number ON badges(batch_number);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_badges_code_event') THEN
    CREATE UNIQUE INDEX idx_badges_code_event ON badges(badge_code, event_id);
  END IF;
END $$;

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'badges_via_event') THEN
    CREATE POLICY "badges_via_event" ON badges
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM events
          WHERE events.id = badges.event_id
          AND events.user_id = auth.uid()
        )
      );
  END IF;
END $$;

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

CREATE INDEX IF NOT EXISTS idx_badge_batches_event_id ON badge_batches(event_id);

ALTER TABLE badge_batches ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'batches_via_event') THEN
    CREATE POLICY "batches_via_event" ON badge_batches
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM events
          WHERE events.id = badge_batches.event_id
          AND events.user_id = auth.uid()
        )
      );
  END IF;
END $$;

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

CREATE INDEX IF NOT EXISTS idx_badge_history_badge_id ON badge_history(badge_id);
CREATE INDEX IF NOT EXISTS idx_badge_history_event_id ON badge_history(event_id);

ALTER TABLE badge_history ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'history_via_event') THEN
    CREATE POLICY "history_via_event" ON badge_history
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM events
          WHERE events.id = badge_history.event_id
          AND events.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ─── Storage Policies ────────────────────────────────────────
-- Politiques pour les buckets publics

-- event-logos
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can read logos') THEN
    CREATE POLICY "Anyone can read logos" ON storage.objects
      FOR SELECT USING (bucket_id = 'event-logos');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload logos') THEN
    CREATE POLICY "Authenticated users can upload logos" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'event-logos' AND auth.role() = 'authenticated');
  END IF;
END $$;

-- participant-photos
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can read photos') THEN
    CREATE POLICY "Anyone can read photos" ON storage.objects
      FOR SELECT USING (bucket_id = 'participant-photos');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload photos') THEN
    CREATE POLICY "Authenticated users can upload photos" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'participant-photos' AND auth.role() = 'authenticated');
  END IF;
END $$;

-- template-backgrounds
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can read templates') THEN
    CREATE POLICY "Anyone can read templates" ON storage.objects
      FOR SELECT USING (bucket_id = 'template-backgrounds');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload templates') THEN
    CREATE POLICY "Authenticated users can upload templates" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'template-backgrounds' AND auth.role() = 'authenticated');
  END IF;
END $$;

-- badge-pdfs (privé)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can read PDFs') THEN
    CREATE POLICY "Authenticated users can read PDFs" ON storage.objects
      FOR SELECT USING (bucket_id = 'badge-pdfs' AND auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload PDFs') THEN
    CREATE POLICY "Authenticated users can upload PDFs" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'badge-pdfs' AND auth.role() = 'authenticated');
  END IF;
END $$;

-- =============================================================
-- FIN DE LA MIGRATION
-- =============================================================
-- Vérifier que les tables sont créées :
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- =============================================================
