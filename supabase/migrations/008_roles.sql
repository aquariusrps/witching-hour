CREATE TABLE roles (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL UNIQUE,
  display_name text NOT NULL,
  is_invisible boolean NOT NULL DEFAULT false,
  is_permanent boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE role_permissions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id       uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  is_enabled    boolean NOT NULL DEFAULT false,
  UNIQUE (role_id, permission_id)
);

CREATE INDEX idx_role_permissions_role_id
  ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id
  ON role_permissions(permission_id);

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage roles"
  ON roles FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Authenticated users can read roles"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins manage role_permissions"
  ON role_permissions FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Authenticated users can read role_permissions"
  ON role_permissions FOR SELECT
  TO authenticated
  USING (true);

INSERT INTO roles (name, display_name, is_invisible, is_permanent)
VALUES
  ('admin',           'Admin',           false, true),
  ('moderator',       'Moderator',       false, false),
  ('lore_keeper',     'Lore Keeper',     false, false),
  ('faction_leader',  'Faction Leader',  false, false),
  ('founding_member', 'Founding Member', false, false);

INSERT INTO role_permissions (role_id, permission_id, is_enabled)
SELECT r.id, p.id,
  CASE
    WHEN r.name = 'admin' THEN true
    WHEN r.name = 'moderator' AND p.name IN (
      'moderate_boards', 'moderate_own_board', 'approve_characters',
      'award_xp', 'post_announcement', 'manage_lore', 'ban_users'
    ) THEN true
    WHEN r.name = 'lore_keeper' AND p.name IN (
      'manage_lore'
    ) THEN true
    WHEN r.name = 'faction_leader' AND p.name IN (
      'manage_faction', 'post_announcement', 'moderate_own_board'
    ) THEN true
    ELSE false
  END
FROM roles r
CROSS JOIN permissions p;
