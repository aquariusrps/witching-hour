-- 1. Add essence and last_offering_at to users
ALTER TABLE users
  ADD COLUMN essence         integer NOT NULL DEFAULT 0,
  ADD COLUMN last_offering_at timestamptz;

-- 2. Essence log table
-- Audit trail for every Essence credit and debit.
-- All writes go through admin client (bypasses RLS by design — see R8).
CREATE TABLE essence_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount      integer NOT NULL,
  reason      text NOT NULL,
  awarded_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_essence_log_user_id ON essence_log(user_id);

ALTER TABLE essence_log ENABLE ROW LEVEL SECURITY;

-- Users can read their own essence log.
CREATE POLICY "Users can read own essence log"
  ON essence_log FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- Only admin client writes (service role bypasses RLS).
-- Admin policy covers staff-facing reads in the admin panel.
CREATE POLICY "Admins manage essence log"
  ON essence_log FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- 3. Postgres function: increment_user_essence
-- Atomically increments users.essence by p_amount.
-- Returns the new essence balance.
-- Used by grantEssence server action via supabase.rpc().
-- SECURITY DEFINER so it bypasses RLS — called only
-- from admin server actions.
CREATE OR REPLACE FUNCTION increment_user_essence(
  p_user_id uuid,
  p_amount  integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_essence integer;
BEGIN
  UPDATE users
  SET essence = essence + p_amount
  WHERE id = p_user_id
  RETURNING essence INTO v_new_essence;

  IF v_new_essence IS NULL THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;

  RETURN v_new_essence;
END;
$$;

-- 4. Postgres function: award_character_xp
-- Atomically increments characters.xp by p_amount.
-- Returns the new xp total.
-- Used by awardXp server action via supabase.rpc().
-- SECURITY DEFINER so it bypasses RLS.
CREATE OR REPLACE FUNCTION award_character_xp(
  p_character_id uuid,
  p_amount       integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_xp integer;
BEGIN
  UPDATE characters
  SET xp = xp + p_amount
  WHERE id = p_character_id
  RETURNING xp INTO v_new_xp;

  IF v_new_xp IS NULL THEN
    RAISE EXCEPTION 'Character not found: %', p_character_id;
  END IF;

  RETURN v_new_xp;
END;
$$;
