CREATE TABLE characters (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name         text NOT NULL,
  avatar_url   text,
  bio          text,
  faction_id   uuid REFERENCES factions(id) ON DELETE SET NULL,
  canon_source text NOT NULL DEFAULT 'original'
               CHECK (canon_source IN (
                 'charmed', 'buffy', 'angel', 'the_craft',
                 'practical_magic', 'ahs_coven',
                 'chilling_adventures', 'secret_circle',
                 'witches_of_east_end', 'motherland_fort_salem',
                 'discovery_of_witches', 'sabrina_90s',
                 'original', 'all'
               )),
  xp           integer NOT NULL DEFAULT 0,
  level        integer NOT NULL DEFAULT 1,
  status       text NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'active', 'suspended')),
  is_npc       boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_characters_user_id    ON characters(user_id);
CREATE INDEX idx_characters_faction_id ON characters(faction_id);
CREATE INDEX idx_characters_status     ON characters(status);

-- active_character_id column already exists on users (added in 001_core_tables).
-- Now that characters exists, add the FK constraint.
ALTER TABLE users
  ADD CONSTRAINT users_active_character_id_fkey
  FOREIGN KEY (active_character_id)
  REFERENCES characters(id)
  ON DELETE SET NULL;

ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

-- Users can read any active character (for IC post display,
-- character profiles, faction rosters).
CREATE POLICY "Anyone can read active characters"
  ON characters FOR SELECT
  TO authenticated
  USING (status = 'active' OR user_id = auth.uid() OR is_admin());

-- Users can insert their own characters only.
CREATE POLICY "Users can create their own characters"
  ON characters FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own non-suspended characters.
-- Admins can update any character (for approval/suspension).
CREATE POLICY "Users can update their own characters"
  ON characters FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());

-- Only admins can delete characters.
CREATE POLICY "Admins can delete characters"
  ON characters FOR DELETE
  TO authenticated
  USING (is_admin());
