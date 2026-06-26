-- Migration 005: waitlist_signups
-- Stores pre-launch waitlist entries. All reads/writes via service role only.
-- RLS enabled with no user-facing policies — admin client bypasses RLS.

CREATE TABLE waitlist_signups (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text        NOT NULL,
  name       text        NOT NULL,
  canon      text        NOT NULL CHECK (canon IN (
               'charmed', 'buffy', 'angel', 'secret_circle',
               'the_craft', 'witches_of_east_end', 'practical_magic'
             )),
  resend_id  text,
  created_at timestamptz DEFAULT now(),

  UNIQUE (email)
);

CREATE INDEX idx_waitlist_email   ON waitlist_signups(email);
CREATE INDEX idx_waitlist_canon   ON waitlist_signups(canon);
CREATE INDEX idx_waitlist_created ON waitlist_signups(created_at);

ALTER TABLE waitlist_signups ENABLE ROW LEVEL SECURITY;
-- No user-facing RLS policies: all access via service role (getAdminClient())
