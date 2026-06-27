-- Migration 018: forums engagement — post_enchantments, post_reports, thread_reads, RLS

CREATE TABLE post_enchantments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid NOT NULL REFERENCES board_posts(id)
             ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES auth.users(id)
             ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);

CREATE INDEX idx_post_enchantments_post_id
  ON post_enchantments(post_id);

CREATE TABLE post_reports (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     uuid NOT NULL REFERENCES board_posts(id)
              ON DELETE CASCADE,
  reported_by uuid NOT NULL REFERENCES auth.users(id)
              ON DELETE CASCADE,
  reason      text NOT NULL,
  details     text,
  status      text NOT NULL DEFAULT 'new'
              CHECK (status IN ('new', 'reviewed', 'actioned')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_post_reports_post_id
  ON post_reports(post_id);
CREATE INDEX idx_post_reports_status
  ON post_reports(status);

-- thread_reads powers the My Threads tracker.
-- UPSERT pattern (ON CONFLICT DO UPDATE) used at application
-- layer — the UNIQUE constraint enables this.
CREATE TABLE thread_reads (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id)
               ON DELETE CASCADE,
  thread_id    uuid NOT NULL REFERENCES board_threads(id)
               ON DELETE CASCADE,
  last_read_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, thread_id)
);

CREATE INDEX idx_thread_reads_user_id
  ON thread_reads(user_id);
CREATE INDEX idx_thread_reads_thread_id
  ON thread_reads(thread_id);

ALTER TABLE post_enchantments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reports      ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_reads      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read enchantments"
  ON post_enchantments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can add enchantments"
  ON post_enchantments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove their own enchantments"
  ON post_enchantments FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() OR is_moderator());

CREATE POLICY "Users can file post reports"
  ON post_reports FOR INSERT
  TO authenticated
  WITH CHECK (reported_by = auth.uid());

CREATE POLICY "Mods can read and action post reports"
  ON post_reports FOR ALL
  TO authenticated
  USING (is_moderator())
  WITH CHECK (is_moderator());

CREATE POLICY "Users can read their own thread reads"
  ON thread_reads FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own thread reads"
  ON thread_reads FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own thread reads"
  ON thread_reads FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
