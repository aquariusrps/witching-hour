-- Migration 026a: thread reply_count + reply count triggers + max_thread_title_length seed
-- updated_at already has default now() on board_threads — no fix needed (Step 2b skipped)

-- 2a. Add reply_count
ALTER TABLE board_threads
  ADD COLUMN reply_count integer NOT NULL DEFAULT 0;

-- 2c. Reply count triggers (additive — trg_board_posts_update_thread remains untouched)

CREATE OR REPLACE FUNCTION trg_fn_thread_reply_count_inc()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  UPDATE board_threads
  SET reply_count = reply_count + 1
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_thread_reply_count_inc
AFTER INSERT ON board_posts
FOR EACH ROW EXECUTE FUNCTION trg_fn_thread_reply_count_inc();

CREATE OR REPLACE FUNCTION trg_fn_thread_reply_count_dec()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  UPDATE board_threads
  SET reply_count = GREATEST(reply_count - 1, 0)
  WHERE id = OLD.thread_id;
  RETURN OLD;
END;
$$;

CREATE TRIGGER trg_thread_reply_count_dec
AFTER DELETE ON board_posts
FOR EACH ROW EXECUTE FUNCTION trg_fn_thread_reply_count_dec();

-- 2d. Seed max_thread_title_length (no row exists)
INSERT INTO site_settings (key, value)
VALUES ('max_thread_title_length', '200')
ON CONFLICT (key) DO NOTHING;
