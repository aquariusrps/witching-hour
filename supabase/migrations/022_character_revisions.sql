-- 1. Update characters.status CHECK to include 'needs_revision'
-- Postgres requires drop + recreate to modify a CHECK constraint.
ALTER TABLE characters
  DROP CONSTRAINT IF EXISTS characters_status_check;

ALTER TABLE characters
  ADD CONSTRAINT characters_status_check
  CHECK (status IN (
    'pending', 'needs_revision', 'active', 'suspended'
  ));

-- 2. character_revisions table
-- Stores each round of reviewer feedback in the approval loop.
-- Written by admin server actions (service role bypasses RLS).
CREATE TABLE character_revisions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id  uuid NOT NULL
                REFERENCES characters(id) ON DELETE CASCADE,
  reviewer_id   uuid
                REFERENCES auth.users(id) ON DELETE SET NULL,
  feedback      text,
  status_before text NOT NULL,
  status_after  text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_character_revisions_character_id
  ON character_revisions(character_id);

ALTER TABLE character_revisions ENABLE ROW LEVEL SECURITY;

-- Users can read revision history for their own characters
-- to see feedback from reviewers.
CREATE POLICY "Users can read own character revisions"
  ON character_revisions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM characters c
      WHERE c.id = character_revisions.character_id
        AND c.user_id = auth.uid()
    )
  );

-- Admins manage all revision records.
CREATE POLICY "Admins manage character revisions"
  ON character_revisions FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
