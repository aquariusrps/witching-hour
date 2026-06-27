CREATE TABLE character_relationships (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id         uuid NOT NULL
                       REFERENCES characters(id) ON DELETE CASCADE,
  related_character_id uuid NOT NULL
                       REFERENCES characters(id) ON DELETE CASCADE,
  relationship_type    text NOT NULL
                       CHECK (relationship_type IN (
                         'ally', 'rival', 'family',
                         'mentor', 'apprentice', 'other'
                       )),
  relationship_label   text,
  is_mutual            boolean NOT NULL DEFAULT false,
  created_by           uuid NOT NULL
                       REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at           timestamptz NOT NULL DEFAULT now(),
  UNIQUE (character_id, related_character_id)
);

CREATE INDEX idx_char_relationships_character_id
  ON character_relationships(character_id);
CREATE INDEX idx_char_relationships_related_id
  ON character_relationships(related_character_id);

ALTER TABLE character_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read relationships of active characters"
  ON character_relationships FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM characters c
      WHERE c.id = character_id
        AND (c.status = 'active' OR c.user_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Users can manage their own character relationships"
  ON character_relationships FOR ALL
  TO authenticated
  USING (created_by = auth.uid() OR is_admin())
  WITH CHECK (created_by = auth.uid() OR is_admin());
