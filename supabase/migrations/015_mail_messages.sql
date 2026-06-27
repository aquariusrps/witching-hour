CREATE TABLE mail_messages (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id                uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject                  text NOT NULL,
  body                     text NOT NULL,
  read_at                  timestamptz,
  deleted_by_sender        boolean NOT NULL DEFAULT false,
  deleted_by_recipient     boolean NOT NULL DEFAULT false,
  is_system_message        boolean NOT NULL DEFAULT false,
  is_welcome               boolean NOT NULL DEFAULT false,
  system_message_audience  text CHECK (
                             system_message_audience IN (
                               'all', 'faction', 'individual'
                             )
                           ),
  audience_id              uuid,
  created_at               timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_mail_messages_recipient_id
  ON mail_messages(recipient_id);
CREATE INDEX idx_mail_messages_sender_id
  ON mail_messages(sender_id);
CREATE INDEX idx_mail_messages_recipient_unread
  ON mail_messages(recipient_id, read_at)
  WHERE read_at IS NULL AND deleted_by_recipient = false;

-- REPLICA IDENTITY FULL must come before publication.
-- Required for UPDATE events (marking read) to fire
-- through Realtime. Without this, read receipts silently
-- fail. Confirmed WM failure mode.
ALTER TABLE mail_messages REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE mail_messages;

ALTER TABLE mail_messages ENABLE ROW LEVEL SECURITY;

-- Users can read messages where they are the recipient
-- (and have not soft-deleted) or the sender (and have
-- not soft-deleted).
CREATE POLICY "Users can read their own messages"
  ON mail_messages FOR SELECT
  TO authenticated
  USING (
    (recipient_id = auth.uid() AND deleted_by_recipient = false)
    OR
    (sender_id = auth.uid() AND deleted_by_sender = false)
  );

-- Regular users can send messages as themselves.
-- sender_id must match auth.uid().
CREATE POLICY "Users can send messages as themselves"
  ON mail_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND is_system_message = false
    AND is_welcome = false
  );

-- Admins can insert system messages and Council Notices
-- where sender_id is NULL.
CREATE POLICY "Admins can insert system messages"
  ON mail_messages FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Users can soft-delete and mark-read their own messages.
-- They cannot modify any other fields.
CREATE POLICY "Users can update their own messages"
  ON mail_messages FOR UPDATE
  TO authenticated
  USING (
    recipient_id = auth.uid()
    OR sender_id = auth.uid()
  )
  WITH CHECK (
    recipient_id = auth.uid()
    OR sender_id = auth.uid()
  );
