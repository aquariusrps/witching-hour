-- Migration 017: forums core — boards, board_threads, board_posts, ooc_posts, updated_at trigger, RLS

-- TABLES

CREATE TABLE boards (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name               text NOT NULL,
  description        text,
  category           text NOT NULL,
  scope              text NOT NULL DEFAULT 'public'
                     CHECK (scope IN (
                       'public', 'faction', 'rp',
                       'staff', 'admin', 'chronicle'
                     )),
  scope_id           uuid,
  is_rp_board        boolean NOT NULL DEFAULT false,
  forced_theme       text,
  min_level_required integer,
  discord_announce   boolean NOT NULL DEFAULT false,
  display_order      integer NOT NULL DEFAULT 0,
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_boards_scope    ON boards(scope);
CREATE INDEX idx_boards_scope_id ON boards(scope_id);

CREATE TABLE board_threads (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id     uuid NOT NULL REFERENCES boards(id)
               ON DELETE CASCADE,
  author_id    uuid NOT NULL REFERENCES auth.users(id)
               ON DELETE CASCADE,
  title        text NOT NULL,
  canon_source text
               CHECK (canon_source IS NULL OR canon_source IN (
                 'charmed', 'buffy', 'angel', 'the_craft',
                 'practical_magic', 'ahs_coven',
                 'chilling_adventures', 'secret_circle',
                 'witches_of_east_end', 'motherland_fort_salem',
                 'discovery_of_witches', 'sabrina_90s',
                 'original', 'all'
               )),
  is_spoiler   boolean NOT NULL DEFAULT false,
  is_pinned    boolean NOT NULL DEFAULT false,
  is_locked    boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_board_threads_board_id
  ON board_threads(board_id);
CREATE INDEX idx_board_threads_author_id
  ON board_threads(author_id);
CREATE INDEX idx_board_threads_updated_at
  ON board_threads(updated_at DESC);

CREATE TABLE board_posts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id    uuid NOT NULL REFERENCES board_threads(id)
               ON DELETE CASCADE,
  author_id    uuid NOT NULL REFERENCES auth.users(id)
               ON DELETE CASCADE,
  character_id uuid REFERENCES characters(id)
               ON DELETE SET NULL,
  is_ic        boolean NOT NULL DEFAULT false,
  content      text NOT NULL,
  is_flagged   boolean NOT NULL DEFAULT false,
  flag_reason  text,
  flagged_by   uuid REFERENCES auth.users(id)
               ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_board_posts_thread_id
  ON board_posts(thread_id);
CREATE INDEX idx_board_posts_author_id
  ON board_posts(author_id);
CREATE INDEX idx_board_posts_character_id
  ON board_posts(character_id);

CREATE TABLE ooc_posts (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id  uuid NOT NULL REFERENCES board_threads(id)
             ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES auth.users(id)
             ON DELETE CASCADE,
  content    text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ooc_posts_thread_id ON ooc_posts(thread_id);

-- TRIGGER: keep board_threads.updated_at current on every new post

CREATE OR REPLACE FUNCTION update_thread_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE board_threads
  SET updated_at = now()
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_board_posts_update_thread
  AFTER INSERT ON board_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_thread_updated_at();

-- RLS: BOARDS

ALTER TABLE boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read boards per scope"
  ON boards FOR SELECT
  TO authenticated
  USING (
    scope IN ('public', 'rp')
    OR (
      scope = 'faction'
      AND EXISTS (
        SELECT 1 FROM characters c
        WHERE c.faction_id = boards.scope_id
          AND c.user_id = auth.uid()
          AND c.status = 'active'
      )
    )
    OR (scope = 'staff' AND is_moderator())
    OR (scope = 'admin' AND is_admin())
    OR (scope = 'chronicle' AND is_admin())
  );

CREATE POLICY "Admins manage boards"
  ON boards FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- RLS: BOARD_THREADS

ALTER TABLE board_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read threads in accessible boards"
  ON board_threads FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM boards b
      WHERE b.id = board_threads.board_id
        AND (
          b.scope IN ('public', 'rp')
          OR (
            b.scope = 'faction'
            AND EXISTS (
              SELECT 1 FROM characters c
              WHERE c.faction_id = b.scope_id
                AND c.user_id = auth.uid()
                AND c.status = 'active'
            )
          )
          OR (b.scope = 'staff' AND is_moderator())
          OR (b.scope = 'admin' AND is_admin())
          OR (b.scope = 'chronicle' AND is_admin())
        )
    )
  );

CREATE POLICY "Users can create threads"
  ON board_threads FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM boards b
      WHERE b.id = board_threads.board_id
        AND (
          b.scope IN ('public', 'rp')
          OR (
            b.scope = 'faction'
            AND EXISTS (
              SELECT 1 FROM characters c
              WHERE c.faction_id = b.scope_id
                AND c.user_id = auth.uid()
                AND c.status = 'active'
            )
          )
        )
    )
  );

CREATE POLICY "Authors and mods can update threads"
  ON board_threads FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid() OR is_moderator())
  WITH CHECK (author_id = auth.uid() OR is_moderator());

CREATE POLICY "Mods can delete threads"
  ON board_threads FOR DELETE
  TO authenticated
  USING (is_moderator());

-- RLS: BOARD_POSTS

ALTER TABLE board_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read posts in accessible threads"
  ON board_posts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM board_threads bt
      JOIN boards b ON b.id = bt.board_id
      WHERE bt.id = board_posts.thread_id
        AND (
          b.scope IN ('public', 'rp')
          OR (
            b.scope = 'faction'
            AND EXISTS (
              SELECT 1 FROM characters c
              WHERE c.faction_id = b.scope_id
                AND c.user_id = auth.uid()
                AND c.status = 'active'
            )
          )
          OR (b.scope = 'staff' AND is_moderator())
          OR (b.scope = 'admin' AND is_admin())
          OR (b.scope = 'chronicle' AND is_admin())
        )
    )
  );

CREATE POLICY "Users can create posts"
  ON board_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM board_threads bt
      JOIN boards b ON b.id = bt.board_id
      WHERE bt.id = board_posts.thread_id
        AND bt.is_locked = false
        AND (
          b.scope IN ('public', 'rp')
          OR (
            b.scope = 'faction'
            AND EXISTS (
              SELECT 1 FROM characters c
              WHERE c.faction_id = b.scope_id
                AND c.user_id = auth.uid()
                AND c.status = 'active'
            )
          )
        )
    )
  );

CREATE POLICY "Authors and mods can update posts"
  ON board_posts FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid() OR is_moderator())
  WITH CHECK (author_id = auth.uid() OR is_moderator());

CREATE POLICY "Mods can delete posts"
  ON board_posts FOR DELETE
  TO authenticated
  USING (is_moderator());

-- RLS: OOC_POSTS

ALTER TABLE ooc_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read ooc posts in accessible threads"
  ON ooc_posts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM board_threads bt
      JOIN boards b ON b.id = bt.board_id
      WHERE bt.id = ooc_posts.thread_id
        AND (
          b.scope IN ('public', 'rp')
          OR (
            b.scope = 'faction'
            AND EXISTS (
              SELECT 1 FROM characters c
              WHERE c.faction_id = b.scope_id
                AND c.user_id = auth.uid()
                AND c.status = 'active'
            )
          )
          OR (b.scope = 'staff' AND is_moderator())
          OR (b.scope = 'admin' AND is_admin())
        )
    )
  );

CREATE POLICY "Users can create ooc posts"
  ON ooc_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM board_threads bt
      WHERE bt.id = ooc_posts.thread_id
        AND bt.is_locked = false
    )
  );

CREATE POLICY "Authors and mods can delete ooc posts"
  ON ooc_posts FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() OR is_moderator());
