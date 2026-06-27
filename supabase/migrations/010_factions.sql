-- Helper functions use SECURITY DEFINER so they run with
-- owner privileges, allowing them to query user_roles without
-- triggering RLS recursion.

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
      AND r.name = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION is_moderator()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'moderator')
  );
$$;

CREATE TABLE factions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text NOT NULL UNIQUE,
  slug           text NOT NULL UNIQUE,
  color_hex      text NOT NULL,
  description    text NOT NULL DEFAULT '',
  lore           text NOT NULL DEFAULT '',
  leader_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  display_order  integer NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_factions_slug           ON factions(slug);
CREATE INDEX idx_factions_leader_user_id ON factions(leader_user_id);

ALTER TABLE factions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage factions"
  ON factions FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Anyone can read factions"
  ON factions FOR SELECT
  TO authenticated
  USING (true);

INSERT INTO factions
  (name, slug, color_hex, description, lore, display_order)
VALUES
  (
    'The Covenant',
    'covenant',
    '#e0b028',
    'Practitioners of ancient protective magic and Wiccan tradition.',
    '<p>The Covenant stands as the oldest circle of light-aligned
    practitioners in the known magical world. Bound by ancient
    agreements and Wiccan law, they walk a careful line between
    power and restraint. Not purely good — the Covenant''s rules
    can constrain as often as they protect. Draw from: the
    Halliwells, reformed practitioners, white lighters.</p>',
    1
  ),
  (
    'The Cabal',
    'cabal',
    '#c83818',
    'Those who seek power by other means — pragmatic, grey, and unapologetic.',
    '<p>The Cabal does not believe in the Covenant''s constraints.
    Its members have seen what blind adherence to the light costs,
    and they''ve chosen a different path. Not purely evil — the
    Cabal includes anti-heroes, grey practitioners, and those who
    simply refused to be told what their power was worth. Draw
    from: Cole Turner, dark witches, demon-aligned
    practitioners.</p>',
    2
  ),
  (
    'The Unbound',
    'unbound',
    '#3878a8',
    'Rogues, independents, and those who rejected both sides.',
    '<p>The Unbound answer to no one. Wildcards operating on their
    own terms, they are neither constrained by Covenant law nor
    drawn to Cabal ambition. Often the most morally interesting
    characters — their freedom is both their greatest strength
    and their greatest vulnerability. Draw from: rogue witches,
    mercenaries, neutral parties in the great magical war.</p>',
    3
  );
