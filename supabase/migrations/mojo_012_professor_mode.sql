-- MOJO-FIX-045-A: Professor Mode schema
-- Adds thread_mode/first_poster/class_name to mojo_threads and
-- creates mojo_grade_submissions. No RLS (mojo_ tables use
-- application-layer admin-only access per MOJO_BRIEF §4).

ALTER TABLE mojo_threads
  ADD COLUMN thread_mode text NOT NULL DEFAULT 'student'
    CHECK (thread_mode IN ('student', 'professor')),
  ADD COLUMN first_poster text NULL,
  ADD COLUMN class_name text NULL;

CREATE TABLE mojo_grade_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES mojo_threads(id)
    ON DELETE CASCADE,
  student_name text NOT NULL,
  student_first_posted_at timestamptz NULL,
  grade_points integer NULL CHECK (grade_points BETWEEN 1 AND 5),
  bonus_points integer NOT NULL DEFAULT 0
    CHECK (bonus_points BETWEEN 0 AND 3),
  graded_at timestamptz NULL,
  grade_text text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (thread_id, student_name)
);

CREATE INDEX idx_mojo_grade_submissions_thread_id
  ON mojo_grade_submissions(thread_id);

CREATE INDEX idx_mojo_grade_submissions_graded_at
  ON mojo_grade_submissions(graded_at)
  WHERE graded_at IS NULL;
