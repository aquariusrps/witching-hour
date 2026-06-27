CREATE TABLE character_level_thresholds (
  level                integer PRIMARY KEY,
  xp_required          integer NOT NULL,
  label                text NOT NULL,
  unlocks_description  text,
  created_at           timestamptz NOT NULL DEFAULT now()
);

-- Seed: five starting levels. All values are admin-editable
-- via the admin panel (TWH-2.6). Nothing in application code
-- hardcodes these values — always query this table.
INSERT INTO character_level_thresholds
  (level, xp_required, label, unlocks_description)
VALUES
  (1, 0,    'Novice',       'Access to basic RP boards and character creation.'),
  (2, 100,  'Apprentice',   'Unlocks faction board access and power purchases.'),
  (3, 300,  'Adept',        'Unlocks advanced RP locations and rare powers.'),
  (4, 750,  'Practitioner', 'Unlocks elder board access and artifact purchases.'),
  (5, 1500, 'Elder',        'Full access. Eligible for Faction Leader nomination.');

CREATE TABLE character_xp_log (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id uuid NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  amount       integer NOT NULL,
  reason       text NOT NULL,
  awarded_by   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_character_xp_log_character_id
  ON character_xp_log(character_id);

CREATE TABLE character_powers (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id      uuid NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  power_name        text NOT NULL,
  power_description text,
  source            text NOT NULL
                    CHECK (source IN (
                      'apothecary', 'level_unlock', 'admin_grant'
                    )),
  acquired_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_character_powers_character_id
  ON character_powers(character_id);

ALTER TABLE character_level_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_xp_log           ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_powers           ENABLE ROW LEVEL SECURITY;

-- Level thresholds are public read, admin write.
CREATE POLICY "Anyone can read level thresholds"
  ON character_level_thresholds FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins manage level thresholds"
  ON character_level_thresholds FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- XP log: users can read their own characters' logs.
-- Admins can read all.
CREATE POLICY "Users can read own xp log"
  ON character_xp_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM characters c
      WHERE c.id = character_id
        AND (c.user_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Admins manage xp log"
  ON character_xp_log FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Powers: public read for active characters, owner + admin write.
CREATE POLICY "Anyone can read powers of active characters"
  ON character_powers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM characters c
      WHERE c.id = character_id
        AND (c.status = 'active' OR c.user_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Admins manage character powers"
  ON character_powers FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
