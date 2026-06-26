-- Migration 001: Core tables
-- site_settings, users, session_logs, ip_bans

-- ── site_settings ──────────────────────────────────────────────────────────
CREATE TABLE site_settings (
  key        text PRIMARY KEY,
  value      text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

INSERT INTO site_settings (key, value) VALUES
  ('site_name',               'The Witching Hour'),
  ('site_tagline',            'For those who never stopped believing in magic.'),
  ('registration_open',       'true'),
  ('max_characters_per_user', '5'),
  ('xp_per_rp_post',          '10'),
  ('maintenance_mode',        'false'),
  ('launch_date',             '');

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_site_settings"
  ON site_settings FOR SELECT
  TO authenticated
  USING (true);

-- ── users ────────────────────────────────────────────────────────────────────
CREATE TABLE users (
  id                  uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name        text UNIQUE NOT NULL,
  avatar_url          text,
  bio                 text,
  theme_preference    text DEFAULT 'blood-moon',
  show_preference     text,
  watching_status     jsonb DEFAULT '{}',
  active_character_id uuid,  -- FK to characters added in Migration 004
  created_at          timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_any_user"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "users_update_own_row"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ── session_logs ──────────────────────────────────────────────────────────────
CREATE TABLE session_logs (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users ON DELETE CASCADE,
  ip_address text NOT NULL,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_session_logs_user_id    ON session_logs (user_id);
CREATE INDEX idx_session_logs_ip         ON session_logs (ip_address);
CREATE INDEX idx_session_logs_rate_limit ON session_logs (user_id, ip_address, created_at);

ALTER TABLE session_logs ENABLE ROW LEVEL SECURITY;
-- No user-facing policies — written via admin client only

-- ── ip_bans ───────────────────────────────────────────────────────────────────
CREATE TABLE ip_bans (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text UNIQUE NOT NULL,
  reason     text,
  banned_by  uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

ALTER TABLE ip_bans ENABLE ROW LEVEL SECURITY;
-- No user-facing policies — read/write via admin client only
