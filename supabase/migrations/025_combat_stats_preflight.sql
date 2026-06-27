-- ── 2a. ALTER boards ──────────────────────────────
ALTER TABLE boards
  ADD COLUMN staff_only_threads
    boolean NOT NULL DEFAULT false;

-- ── 2b. ALTER board_threads ───────────────────────
ALTER TABLE board_threads
  ADD COLUMN thread_type text NOT NULL DEFAULT 'standard'
    CHECK (thread_type IN ('standard','combat','ascension')),
  ADD COLUMN is_locked_for_edit
    boolean NOT NULL DEFAULT false;

-- Index for filtering by thread_type
CREATE INDEX idx_board_threads_thread_type
  ON board_threads(thread_type);

-- ── 2c. ALTER factions ────────────────────────────
ALTER TABLE factions
  ADD COLUMN promotions_board_id
    uuid REFERENCES boards(id) ON DELETE SET NULL,
  ADD COLUMN ascension_chamber_label
    text;

-- Index on FK
CREATE INDEX idx_factions_promotions_board_id
  ON factions(promotions_board_id);

-- ── 2d. ALTER characters ──────────────────────────
-- Stat columns (all default to base value of 1;
-- site_settings.stat_base_value is the canonical
-- source for new character initialization —
-- these defaults are fallbacks only)
ALTER TABLE characters
  ADD COLUMN vitality
    integer NOT NULL DEFAULT 1,
  ADD COLUMN arcana
    integer NOT NULL DEFAULT 1,
  ADD COLUMN intuition
    integer NOT NULL DEFAULT 1,
  ADD COLUMN aura
    integer NOT NULL DEFAULT 1,
  ADD COLUMN ward
    integer NOT NULL DEFAULT 1,
  ADD COLUMN unspent_stat_points
    integer NOT NULL DEFAULT 0,
  ADD COLUMN pending_promotion
    boolean NOT NULL DEFAULT false,
  ADD COLUMN last_combat_defeat_at
    timestamptz,
  ADD COLUMN updated_at
    timestamptz NOT NULL DEFAULT now();

-- Trigger to maintain characters.updated_at
CREATE OR REPLACE FUNCTION trg_fn_characters_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_characters_updated_at
BEFORE UPDATE ON characters
FOR EACH ROW EXECUTE FUNCTION
  trg_fn_characters_updated_at();

-- ── 2e. ALTER character_level_thresholds ──────────
-- NOTE: PK column is 'level' (verified in Step 1e schema check).
-- WHERE clauses use 'level', not 'level_number'.
ALTER TABLE character_level_thresholds
  ADD COLUMN max_hp
    integer NOT NULL DEFAULT 20,
  ADD COLUMN stat_points_awarded
    integer NOT NULL DEFAULT 2;

-- Level 1: Novice
UPDATE character_level_thresholds
SET max_hp = 20, stat_points_awarded = 0
WHERE level = 1;

-- Level 2: Apprentice
UPDATE character_level_thresholds
SET max_hp = 30, stat_points_awarded = 2
WHERE level = 2;

-- Level 3: Adept
UPDATE character_level_thresholds
SET max_hp = 45, stat_points_awarded = 2
WHERE level = 3;

-- Level 4: Practitioner
UPDATE character_level_thresholds
SET max_hp = 60, stat_points_awarded = 3
WHERE level = 4;

-- Level 5: Elder
UPDATE character_level_thresholds
SET max_hp = 80, stat_points_awarded = 3
WHERE level = 5;

-- ── 2f. site_settings seeds ───────────────────────
-- ON CONFLICT DO NOTHING ensures existing keys are
-- never overwritten. Safe to run idempotently.
INSERT INTO site_settings (key, value) VALUES
-- Stat system
('stat_base_value',               '1'),
('stat_creation_pool',            '5'),
('stat_creation_cap',             '3'),
('stat_points_per_level',         '2'),
('hp_per_vitality_point',         '5'),
('defense_rating_base',           '10'),
-- Combat system
('xp_per_combat_win',             '50'),
('combat_turn_timeout_hours',     '24'),
('combat_invite_expiry_hours',    '48'),
('max_concurrent_combat_threads', '3'),
('combat_xp_level_scaling_min',   '0.5'),
('combat_xp_level_scaling_max',   '2.0'),
('combat_defeat_cooldown_hours',  '24'),
-- Post enchantments
('post_enchantment_types',
  '[{"emoji":"✨","label":"Enchanted"},{"emoji":"🔥","label":"Fierce"},{"emoji":"💀","label":"Dark"},{"emoji":"💜","label":"Coven"},{"emoji":"⚡","label":"Power"}]'),
-- Ascension system (all labels admin-configurable)
('ascension_rite_label',          'Ascension Rite'),
('ascension_granted_label',       'Ascension Granted'),
('ascension_return_label',        'Return to Practice'),
('ascension_request_label',       'Request Ascension Rite'),
('ascension_chamber_label',       'The Ascension Chamber'),
('ascension_summons_label',       'The Summoning'),
('ascension_forfeit_label',       'Withdrawal — Return to Practice')
ON CONFLICT (key) DO NOTHING;
