-- ============================================================
-- Migration 023: board hierarchy, denormalized counts, seed data
-- ============================================================

-- 2a. ADD new columns to boards
ALTER TABLE boards
  ADD COLUMN parent_id         uuid REFERENCES boards(id) ON DELETE CASCADE,
  ADD COLUMN is_category       boolean NOT NULL DEFAULT false,
  ADD COLUMN thread_count      integer NOT NULL DEFAULT 0,
  ADD COLUMN post_count        integer NOT NULL DEFAULT 0,
  ADD COLUMN last_post_at      timestamptz,
  ADD COLUMN last_post_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN icon_url          text;

CREATE INDEX idx_boards_parent_id    ON boards(parent_id);
CREATE INDEX idx_boards_display_order ON boards(display_order);

-- 2b. Recursive ancestor-update helper (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION update_board_counts(
  p_board_id      uuid,
  p_thread_delta  integer     DEFAULT 0,
  p_post_delta    integer     DEFAULT 0,
  p_last_post_at  timestamptz DEFAULT NULL,
  p_last_post_uid uuid        DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the board itself
  UPDATE boards SET
    thread_count      = thread_count + p_thread_delta,
    post_count        = post_count   + p_post_delta,
    last_post_at      = CASE WHEN p_last_post_at IS NOT NULL THEN p_last_post_at      ELSE last_post_at      END,
    last_post_user_id = CASE WHEN p_last_post_at IS NOT NULL THEN p_last_post_uid     ELSE last_post_user_id END
  WHERE id = p_board_id;

  -- Walk ancestors and update all of them
  WITH RECURSIVE ancestors AS (
    SELECT parent_id
    FROM   boards
    WHERE  id = p_board_id AND parent_id IS NOT NULL
    UNION ALL
    SELECT b.parent_id
    FROM   boards b
    JOIN   ancestors a ON b.id = a.parent_id
    WHERE  a.parent_id IS NOT NULL
  )
  UPDATE boards SET
    thread_count      = thread_count + p_thread_delta,
    post_count        = post_count   + p_post_delta,
    last_post_at      = CASE WHEN p_last_post_at IS NOT NULL THEN p_last_post_at      ELSE last_post_at      END,
    last_post_user_id = CASE WHEN p_last_post_at IS NOT NULL THEN p_last_post_uid     ELSE last_post_user_id END
  WHERE id IN (SELECT parent_id FROM ancestors);
END;
$$;

-- 2c. Trigger functions and triggers

-- Thread created
CREATE OR REPLACE FUNCTION trg_fn_thread_created()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  PERFORM update_board_counts(NEW.board_id, 1, 0, NULL, NULL);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_thread_created
AFTER INSERT ON board_threads
FOR EACH ROW EXECUTE FUNCTION trg_fn_thread_created();

-- Thread deleted
CREATE OR REPLACE FUNCTION trg_fn_thread_deleted()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  PERFORM update_board_counts(OLD.board_id, -1, 0, NULL, NULL);
  RETURN OLD;
END;
$$;

CREATE TRIGGER trg_thread_deleted
AFTER DELETE ON board_threads
FOR EACH ROW EXECUTE FUNCTION trg_fn_thread_deleted();

-- Post created
-- NOTE: board_posts uses author_id (not user_id) — confirmed via Step 1 schema check
CREATE OR REPLACE FUNCTION trg_fn_post_created()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  v_board_id uuid;
  v_user_id  uuid;
BEGIN
  SELECT board_id INTO v_board_id
  FROM board_threads WHERE id = NEW.thread_id;

  v_user_id := NEW.author_id;

  PERFORM update_board_counts(v_board_id, 0, 1, NEW.created_at, v_user_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_post_created
AFTER INSERT ON board_posts
FOR EACH ROW EXECUTE FUNCTION trg_fn_post_created();

-- Post deleted (count decrement only — last_post_at recalc on delete is Q-item)
CREATE OR REPLACE FUNCTION trg_fn_post_deleted()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  v_board_id uuid;
BEGIN
  SELECT board_id INTO v_board_id
  FROM board_threads WHERE id = OLD.thread_id;

  PERFORM update_board_counts(v_board_id, 0, -1, NULL, NULL);
  RETURN OLD;
END;
$$;

CREATE TRIGGER trg_post_deleted
AFTER DELETE ON board_posts
FOR EACH ROW EXECUTE FUNCTION trg_fn_post_deleted();

-- 2d. Seed data
DO $$
DECLARE
  -- Category UUIDs
  v_cat_charmed    uuid := gen_random_uuid();
  v_cat_buffy      uuid := gen_random_uuid();
  v_cat_craft      uuid := gen_random_uuid();
  v_cat_practical  uuid := gen_random_uuid();
  v_cat_ahs        uuid := gen_random_uuid();
  v_cat_chilling   uuid := gen_random_uuid();
  v_cat_secret     uuid := gen_random_uuid();
  v_cat_secondary  uuid := gen_random_uuid();
  v_cat_community  uuid := gen_random_uuid();
  v_cat_rp         uuid := gen_random_uuid();

  -- Charmed forums
  v_charmed_general   uuid := gen_random_uuid();
  v_charmed_episode   uuid := gen_random_uuid();
  v_charmed_theories  uuid := gen_random_uuid();
  v_charmed_creations uuid := gen_random_uuid();

  -- Buffy & Angel forums
  v_buffy_general     uuid := gen_random_uuid();
  v_buffy_episode     uuid := gen_random_uuid();
  v_buffy_theories    uuid := gen_random_uuid();
  v_buffy_creations   uuid := gen_random_uuid();

  -- The Craft forums
  v_craft_general     uuid := gen_random_uuid();
  v_craft_episode     uuid := gen_random_uuid();
  v_craft_theories    uuid := gen_random_uuid();
  v_craft_creations   uuid := gen_random_uuid();

  -- Practical Magic forums
  v_practical_general   uuid := gen_random_uuid();
  v_practical_episode   uuid := gen_random_uuid();
  v_practical_theories  uuid := gen_random_uuid();
  v_practical_creations uuid := gen_random_uuid();

  -- AHS: Coven forums
  v_ahs_general     uuid := gen_random_uuid();
  v_ahs_episode     uuid := gen_random_uuid();
  v_ahs_theories    uuid := gen_random_uuid();
  v_ahs_creations   uuid := gen_random_uuid();

  -- Chilling Adventures forums
  v_chilling_general   uuid := gen_random_uuid();
  v_chilling_episode   uuid := gen_random_uuid();
  v_chilling_theories  uuid := gen_random_uuid();
  v_chilling_creations uuid := gen_random_uuid();

  -- The Secret Circle forums
  v_secret_general     uuid := gen_random_uuid();
  v_secret_episode     uuid := gen_random_uuid();
  v_secret_theories    uuid := gen_random_uuid();
  v_secret_creations   uuid := gen_random_uuid();

  -- Secondary Canons forums
  v_sec_east_end   uuid := gen_random_uuid();
  v_sec_motherland uuid := gen_random_uuid();
  v_sec_discovery  uuid := gen_random_uuid();
  v_sec_sabrina    uuid := gen_random_uuid();

  -- Community forums
  v_comm_lounge        uuid := gen_random_uuid();
  v_comm_intros        uuid := gen_random_uuid();
  v_comm_announcements uuid := gen_random_uuid();
  v_comm_bulletin      uuid := gen_random_uuid();

  -- Placeholder subforum
  v_charmed_seasons uuid := gen_random_uuid();

BEGIN
  -- CATEGORIES (is_category = true, parent_id = null, scope = 'public')
  INSERT INTO boards (id, name, category, scope, parent_id, is_category, display_order, discord_announce, is_rp_board) VALUES
    (v_cat_charmed,   'Charmed',             '', 'public', NULL, true, 10,  false, false),
    (v_cat_buffy,     'Buffy & Angel',       '', 'public', NULL, true, 20,  false, false),
    (v_cat_craft,     'The Craft',           '', 'public', NULL, true, 30,  false, false),
    (v_cat_practical, 'Practical Magic',     '', 'public', NULL, true, 40,  false, false),
    (v_cat_ahs,       'AHS: Coven',          '', 'public', NULL, true, 50,  false, false),
    (v_cat_chilling,  'Chilling Adventures', '', 'public', NULL, true, 60,  false, false),
    (v_cat_secret,    'The Secret Circle',   '', 'public', NULL, true, 70,  false, false),
    (v_cat_secondary, 'Secondary Canons',    '', 'public', NULL, true, 80,  false, false),
    (v_cat_community, 'Community',           '', 'public', NULL, true, 90,  false, false),
    (v_cat_rp,        'The Circle (RP)',     '', 'public', NULL, true, 100, false, false);

  -- CHARMED FORUMS
  INSERT INTO boards (id, name, category, scope, parent_id, is_category, display_order, discord_announce, is_rp_board) VALUES
    (v_charmed_general,   'General Discussion', '', 'public', v_cat_charmed, false, 10, false, false),
    (v_charmed_episode,   'Episode Discussion', '', 'public', v_cat_charmed, false, 20, false, false),
    (v_charmed_theories,  'Fan Theories',       '', 'public', v_cat_charmed, false, 30, false, false),
    (v_charmed_creations, 'Fan Creations',      '', 'public', v_cat_charmed, false, 40, false, false);

  -- BUFFY & ANGEL FORUMS
  INSERT INTO boards (id, name, category, scope, parent_id, is_category, display_order, discord_announce, is_rp_board) VALUES
    (v_buffy_general,   'General Discussion', '', 'public', v_cat_buffy, false, 10, false, false),
    (v_buffy_episode,   'Episode Discussion', '', 'public', v_cat_buffy, false, 20, false, false),
    (v_buffy_theories,  'Fan Theories',       '', 'public', v_cat_buffy, false, 30, false, false),
    (v_buffy_creations, 'Fan Creations',      '', 'public', v_cat_buffy, false, 40, false, false);

  -- THE CRAFT FORUMS
  INSERT INTO boards (id, name, category, scope, parent_id, is_category, display_order, discord_announce, is_rp_board) VALUES
    (v_craft_general,   'General Discussion', '', 'public', v_cat_craft, false, 10, false, false),
    (v_craft_episode,   'Episode Discussion', '', 'public', v_cat_craft, false, 20, false, false),
    (v_craft_theories,  'Fan Theories',       '', 'public', v_cat_craft, false, 30, false, false),
    (v_craft_creations, 'Fan Creations',      '', 'public', v_cat_craft, false, 40, false, false);

  -- PRACTICAL MAGIC FORUMS
  INSERT INTO boards (id, name, category, scope, parent_id, is_category, display_order, discord_announce, is_rp_board) VALUES
    (v_practical_general,   'General Discussion', '', 'public', v_cat_practical, false, 10, false, false),
    (v_practical_episode,   'Episode Discussion', '', 'public', v_cat_practical, false, 20, false, false),
    (v_practical_theories,  'Fan Theories',       '', 'public', v_cat_practical, false, 30, false, false),
    (v_practical_creations, 'Fan Creations',      '', 'public', v_cat_practical, false, 40, false, false);

  -- AHS: COVEN FORUMS
  INSERT INTO boards (id, name, category, scope, parent_id, is_category, display_order, discord_announce, is_rp_board) VALUES
    (v_ahs_general,   'General Discussion', '', 'public', v_cat_ahs, false, 10, false, false),
    (v_ahs_episode,   'Episode Discussion', '', 'public', v_cat_ahs, false, 20, false, false),
    (v_ahs_theories,  'Fan Theories',       '', 'public', v_cat_ahs, false, 30, false, false),
    (v_ahs_creations, 'Fan Creations',      '', 'public', v_cat_ahs, false, 40, false, false);

  -- CHILLING ADVENTURES FORUMS
  INSERT INTO boards (id, name, category, scope, parent_id, is_category, display_order, discord_announce, is_rp_board) VALUES
    (v_chilling_general,   'General Discussion', '', 'public', v_cat_chilling, false, 10, false, false),
    (v_chilling_episode,   'Episode Discussion', '', 'public', v_cat_chilling, false, 20, false, false),
    (v_chilling_theories,  'Fan Theories',       '', 'public', v_cat_chilling, false, 30, false, false),
    (v_chilling_creations, 'Fan Creations',      '', 'public', v_cat_chilling, false, 40, false, false);

  -- THE SECRET CIRCLE FORUMS
  INSERT INTO boards (id, name, category, scope, parent_id, is_category, display_order, discord_announce, is_rp_board) VALUES
    (v_secret_general,   'General Discussion', '', 'public', v_cat_secret, false, 10, false, false),
    (v_secret_episode,   'Episode Discussion', '', 'public', v_cat_secret, false, 20, false, false),
    (v_secret_theories,  'Fan Theories',       '', 'public', v_cat_secret, false, 30, false, false),
    (v_secret_creations, 'Fan Creations',      '', 'public', v_cat_secret, false, 40, false, false);

  -- SECONDARY CANONS FORUMS
  INSERT INTO boards (id, name, category, scope, parent_id, is_category, display_order, discord_announce, is_rp_board) VALUES
    (v_sec_east_end,   'Witches of East End',    '', 'public', v_cat_secondary, false, 10, false, false),
    (v_sec_motherland, 'Motherland: Fort Salem',  '', 'public', v_cat_secondary, false, 20, false, false),
    (v_sec_discovery,  'A Discovery of Witches', '', 'public', v_cat_secondary, false, 30, false, false),
    (v_sec_sabrina,    'Sabrina (90s)',           '', 'public', v_cat_secondary, false, 40, false, false);

  -- COMMUNITY FORUMS
  INSERT INTO boards (id, name, description, category, scope, parent_id, is_category, display_order, discord_announce, is_rp_board) VALUES
    (v_comm_lounge,        'The Manor Lounge',   'General chat for the community.',               '', 'public', v_cat_community, false, 10, false, false),
    (v_comm_intros,        'Introductions',      'New to the coven? Say hello.',                  '', 'public', v_cat_community, false, 20, false, false),
    (v_comm_announcements, 'Site Announcements', 'Official updates from staff.',                  '', 'public', v_cat_community, false, 30, false, false),
    (v_comm_bulletin,      'The Bulletin Board', 'Events, promotions, and looking-for-RP posts.', '', 'public', v_cat_community, false, 40, false, false);

  -- PLACEHOLDER SUBFORUM under Charmed > Episode Discussion
  INSERT INTO boards (id, name, description, category, scope, parent_id, is_category, display_order, discord_announce, is_rp_board) VALUES
    (v_charmed_seasons, 'Season by Season', 'Episode discussion broken down by season.', '', 'public', v_charmed_episode, false, 10, false, false);

END;
$$;
