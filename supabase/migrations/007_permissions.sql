-- Stub required because CREATE POLICY validates function existence at creation
-- time. is_admin() is redefined with the real implementation in 010_factions.sql.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$ SELECT false; $$;

CREATE TABLE permissions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL UNIQUE,
  description text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage permissions"
  ON permissions FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Authenticated users can read permissions"
  ON permissions FOR SELECT
  TO authenticated
  USING (true);

INSERT INTO permissions (name, description) VALUES
  ('manage_site',        'Full site control — admin only'),
  ('manage_users',       'View and modify user accounts'),
  ('manage_roles',       'Assign and revoke roles'),
  ('manage_factions',    'Create, edit, and delete factions'),
  ('moderate_boards',    'Delete, pin, and lock posts across all boards'),
  ('moderate_own_board', 'Moderate a specific scoped board'),
  ('manage_lore',        'Create, edit, and publish Grimoire entries'),
  ('approve_characters', 'Review and approve character submissions'),
  ('award_xp',           'Manually award XP to characters'),
  ('post_announcement',  'Post faction or site-wide announcements'),
  ('manage_faction',     'Manage a specific faction as faction leader'),
  ('manage_boards',      'Create and configure forum boards'),
  ('manage_events',      'Create and manage site events and rewatch events'),
  ('manage_apothecary',  'Manage Apothecary listings and power catalog'),
  ('manage_waitlist',    'View and export waitlist signups'),
  ('ban_users',          'Issue and remove IP bans');
