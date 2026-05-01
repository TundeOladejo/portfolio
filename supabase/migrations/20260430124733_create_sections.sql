-- Migration: create sections table
-- Creates the sections table with a FK to case_studies (ON DELETE CASCADE) and RLS policies.

CREATE TABLE IF NOT EXISTS sections (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  case_study_id  uuid        NOT NULL
                             REFERENCES case_studies(id) ON DELETE CASCADE,
  type           text        NOT NULL
                             CHECK (type IN ('text', 'image', 'video')),
  content        text,
  media_url      text,
  "order"        integer     NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

-- Policy: anyone can read sections
CREATE POLICY "sections_select_all"
  ON sections
  FOR SELECT
  USING (true);

-- Policy: only authenticated users can insert
CREATE POLICY "sections_insert_authenticated"
  ON sections
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: only authenticated users can update
CREATE POLICY "sections_update_authenticated"
  ON sections
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: only authenticated users can delete
CREATE POLICY "sections_delete_authenticated"
  ON sections
  FOR DELETE
  TO authenticated
  USING (true);
