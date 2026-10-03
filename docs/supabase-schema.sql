-- =============================================================================
-- Aura Vega TV — Supabase PostgreSQL Schema
-- Version: 1.0.0
-- Platform: Supabase (PostgreSQL 15 + pgvector)
-- =============================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- =============================================================================
-- HOUSEHOLDS
-- =============================================================================
CREATE TABLE IF NOT EXISTS households (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name          TEXT NOT NULL,
  admin_id      UUID NOT NULL,
  plan          TEXT NOT NULL DEFAULT 'premium' CHECK (plan IN ('free', 'basic', 'premium')),
  max_members   INTEGER NOT NULL DEFAULT 6,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- PROFILES
-- =============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  household_id      UUID REFERENCES households(id) ON DELETE CASCADE,
  display_name      TEXT NOT NULL,
  avatar_url        TEXT,
  preferred_genres  TEXT[] DEFAULT '{}',
  disliked_genres   TEXT[] DEFAULT '{}',
  preferred_moods   TEXT[] DEFAULT '{}',
  age_rating_limit  TEXT DEFAULT 'R',
  language          TEXT DEFAULT 'en',
  aura_points       INTEGER DEFAULT 0,
  total_watch_hours DECIMAL(10,2) DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_household ON profiles(household_id);

-- =============================================================================
-- MEDIA CATALOG
-- =============================================================================
CREATE TABLE IF NOT EXISTS media_catalog (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  external_id       TEXT UNIQUE NOT NULL,  -- e.g. 'media-dune2'
  title             TEXT NOT NULL,
  year              INTEGER,
  rating            TEXT,
  runtime_minutes   INTEGER,
  imdb_score        DECIMAL(3,1),
  rotten_tomatoes   INTEGER,
  mood              TEXT,
  synopsis          TEXT,
  streaming_platform TEXT,
  director          TEXT,
  cast_members      TEXT[] DEFAULT '{}',
  tags              TEXT[] DEFAULT '{}',
  backdrop_url      TEXT,
  trailer_url       TEXT,
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- pgvector embedding column for semantic similarity
ALTER TABLE media_catalog ADD COLUMN IF NOT EXISTS embedding vector(32);

CREATE INDEX IF NOT EXISTS idx_media_tags ON media_catalog USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_media_embedding ON media_catalog USING ivfflat (embedding vector_cosine_ops);

-- =============================================================================
-- VIEWING SESSIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS viewing_sessions (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  household_id      UUID REFERENCES households(id) ON DELETE CASCADE,
  started_at        TIMESTAMPTZ DEFAULT NOW(),
  ended_at          TIMESTAMPTZ,
  participant_ids   UUID[] DEFAULT '{}',
  selected_media_id UUID REFERENCES media_catalog(id),
  consensus_score   INTEGER DEFAULT 0,
  time_of_day       TEXT,
  weather_condition TEXT,
  session_mood      TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_household ON viewing_sessions(household_id);
CREATE INDEX idx_sessions_started_at ON viewing_sessions(started_at DESC);

-- =============================================================================
-- VOTES
-- =============================================================================
CREATE TABLE IF NOT EXISTS votes (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id   UUID REFERENCES viewing_sessions(id) ON DELETE CASCADE,
  profile_id   UUID REFERENCES profiles(id) ON DELETE CASCADE,
  media_id     UUID REFERENCES media_catalog(id),
  voted_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, profile_id)
);

CREATE INDEX idx_votes_session ON votes(session_id);

-- =============================================================================
-- ANALYTICS EVENTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id  UUID,
  profile_id  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  event_type  TEXT NOT NULL,
  properties  JSONB DEFAULT '{}',
  timestamp   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_type ON analytics_events(event_type);
CREATE INDEX idx_events_timestamp ON analytics_events(timestamp DESC);
CREATE INDEX idx_events_profile ON analytics_events(profile_id);

-- =============================================================================
-- PLAYBACK HISTORY
-- =============================================================================
CREATE TABLE IF NOT EXISTS playback_history (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id      UUID REFERENCES profiles(id) ON DELETE CASCADE,
  media_id        UUID REFERENCES media_catalog(id),
  session_id      UUID REFERENCES viewing_sessions(id),
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  stopped_at      TIMESTAMPTZ,
  position_ms     BIGINT DEFAULT 0,
  completed       BOOLEAN DEFAULT FALSE,
  quality         TEXT DEFAULT '1080p',
  device_type     TEXT DEFAULT 'fire_tv'
);

CREATE INDEX idx_playback_profile ON playback_history(profile_id);
CREATE INDEX idx_playback_media ON playback_history(media_id);

-- =============================================================================
-- WATCHLIST
-- =============================================================================
CREATE TABLE IF NOT EXISTS watchlist (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id  UUID REFERENCES profiles(id) ON DELETE CASCADE,
  media_id    UUID REFERENCES media_catalog(id),
  added_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, media_id)
);

-- =============================================================================
-- NOTIFICATIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  profile_id   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  type         TEXT NOT NULL,
  title        TEXT NOT NULL,
  body         TEXT NOT NULL,
  metadata     JSONB DEFAULT '{}',
  read         BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_profile ON notifications(profile_id, read);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

-- Households: only members can read their own household
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
CREATE POLICY household_self_read ON households
  FOR SELECT USING (id IN (
    SELECT household_id FROM profiles WHERE id = auth.uid()
  ));

-- Profiles: household members can read each other
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_household_read ON profiles
  FOR SELECT USING (household_id IN (
    SELECT household_id FROM profiles WHERE id = auth.uid()
  ));
CREATE POLICY profiles_self_write ON profiles
  FOR ALL USING (id = auth.uid());

-- Sessions: household-scoped
ALTER TABLE viewing_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY sessions_household_read ON viewing_sessions
  FOR SELECT USING (household_id IN (
    SELECT household_id FROM profiles WHERE id = auth.uid()
  ));

-- Votes: own votes only
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY votes_own ON votes
  FOR ALL USING (profile_id = auth.uid());

-- Analytics: household admins only
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY analytics_household ON analytics_events
  FOR SELECT USING (profile_id = auth.uid());

-- Playback history: own history
ALTER TABLE playback_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY playback_own ON playback_history
  FOR ALL USING (profile_id = auth.uid());

-- Watchlist: own list
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY watchlist_own ON watchlist
  FOR ALL USING (profile_id = auth.uid());

-- Media catalog: public read
ALTER TABLE media_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY media_public_read ON media_catalog
  FOR SELECT USING (is_active = TRUE);

-- =============================================================================
-- REAL-TIME PUBLICATION
-- =============================================================================
-- Publish sessions, votes, notifications for Supabase Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE viewing_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE votes;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- =============================================================================
-- SEED: Default Household for Demo
-- =============================================================================
INSERT INTO households (id, name, admin_id, plan) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Jain Family Household', '00000000-0000-0000-0000-000000000010', 'premium')
ON CONFLICT DO NOTHING;

INSERT INTO profiles (id, household_id, display_name, preferred_genres, disliked_genres, aura_points, total_watch_hours) VALUES
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Ronak', ARRAY['Sci-Fi','Thriller','Documentary'], ARRAY[]::TEXT[], 1240, 247),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Priya',  ARRAY['Drama','Romance','Action'],         ARRAY[]::TEXT[], 980,  198),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'Meera',  ARRAY['Comedy','Family'],                   ARRAY['Horror']::TEXT[], 560,  112),
  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'Sam',    ARRAY['Action','Sci-Fi','Horror'],          ARRAY[]::TEXT[], 830,  167)
ON CONFLICT DO NOTHING;
