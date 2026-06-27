-- 1. New permission: manage_admins
INSERT INTO permissions (name, description)
VALUES (
  'manage_admins',
  'Appoint and revoke admin badges and functional admin roles. Super Admin only.'
);

-- 2. Update is_admin() to include super_admin.
-- CRITICAL: must happen before super_admin role exists
-- in user_roles, but the function must be updated now
-- so RLS policies evaluate correctly the moment the
-- first super_admin user_roles row is inserted.
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
      AND r.name IN ('admin', 'super_admin')
  );
$$;

-- 3. super_admin role — your account only.
-- is_permanent = true prevents deletion.
-- is_invisible = false — shows on profile.
INSERT INTO roles (name, display_name, is_invisible, is_permanent)
VALUES ('super_admin', 'Super Admin', false, true);

-- 4. Functional admin roles — invisible, each maps to
-- one admin panel section. Granted alongside the admin
-- badge role to give appointed admins access to specific
-- sections only.
INSERT INTO roles (name, display_name, is_invisible, is_permanent)
VALUES
  ('character_manager', 'Character Manager', true, false),
  ('faction_manager',   'Faction Manager',   true, false),
  ('board_manager',     'Board Manager',     true, false),
  ('events_manager',    'Events Manager',    true, false),
  ('apothecary_manager','Apothecary Manager',true, false),
  ('settings_manager',  'Settings Manager',  true, false),
  ('player_manager',    'Player Manager',    true, false),
  ('ban_manager',       'Ban Manager',       true, false);

-- 5. Wipe admin role permission matrix.
-- The admin role is now a cosmetic badge only.
-- It shows "Administrator" on profiles but unlocks
-- nothing in the panel on its own.
UPDATE role_permissions
SET is_enabled = false
WHERE role_id = (SELECT id FROM roles WHERE name = 'admin');

-- 6. Seed role_permissions for all new roles.
-- super_admin gets every permission enabled.
-- Functional roles get only their scoped permissions.

-- super_admin: all permissions enabled
INSERT INTO role_permissions (role_id, permission_id, is_enabled)
SELECT
  (SELECT id FROM roles WHERE name = 'super_admin'),
  p.id,
  true
FROM permissions p;

-- character_manager: approve_characters + award_xp
INSERT INTO role_permissions (role_id, permission_id, is_enabled)
SELECT
  (SELECT id FROM roles WHERE name = 'character_manager'),
  p.id,
  true
FROM permissions p
WHERE p.name IN ('approve_characters', 'award_xp');

-- faction_manager: manage_factions
INSERT INTO role_permissions (role_id, permission_id, is_enabled)
SELECT
  (SELECT id FROM roles WHERE name = 'faction_manager'),
  p.id,
  true
FROM permissions p
WHERE p.name = 'manage_factions';

-- board_manager: manage_boards
INSERT INTO role_permissions (role_id, permission_id, is_enabled)
SELECT
  (SELECT id FROM roles WHERE name = 'board_manager'),
  p.id,
  true
FROM permissions p
WHERE p.name = 'manage_boards';

-- events_manager: manage_events
INSERT INTO role_permissions (role_id, permission_id, is_enabled)
SELECT
  (SELECT id FROM roles WHERE name = 'events_manager'),
  p.id,
  true
FROM permissions p
WHERE p.name = 'manage_events';

-- apothecary_manager: manage_apothecary
INSERT INTO role_permissions (role_id, permission_id, is_enabled)
SELECT
  (SELECT id FROM roles WHERE name = 'apothecary_manager'),
  p.id,
  true
FROM permissions p
WHERE p.name = 'manage_apothecary';

-- settings_manager: manage_site + manage_waitlist
INSERT INTO role_permissions (role_id, permission_id, is_enabled)
SELECT
  (SELECT id FROM roles WHERE name = 'settings_manager'),
  p.id,
  true
FROM permissions p
WHERE p.name IN ('manage_site', 'manage_waitlist');

-- player_manager: manage_users + award_xp
INSERT INTO role_permissions (role_id, permission_id, is_enabled)
SELECT
  (SELECT id FROM roles WHERE name = 'player_manager'),
  p.id,
  true
FROM permissions p
WHERE p.name IN ('manage_users', 'award_xp');

-- ban_manager: ban_users
INSERT INTO role_permissions (role_id, permission_id, is_enabled)
SELECT
  (SELECT id FROM roles WHERE name = 'ban_manager'),
  p.id,
  true
FROM permissions p
WHERE p.name = 'ban_users';
