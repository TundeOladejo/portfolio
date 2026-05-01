-- Migration: create case_studies table
-- Creates the core case_studies table with all required columns, constraints, and RLS policies.

CREATE TABLE IF NOT EXISTS case_studies (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title          text        NOT NULL,
  description    text        NOT NULL,
  cover_image_url text       NOT NULL,
  slug           text        NOT NULL UNIQUE,
  status         text        NOT NULL DEFAULT 'draft'
                             CHECK (status IN ('draft', 'published')),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;

-- Policy: anyone can read published (and all) case studies
CREATE POLICY "case_studies_select_all"
  ON case_studies
  FOR SELECT
  USING (true);

-- Policy: only authenticated users can insert
CREATE POLICY "case_studies_insert_authenticated"
  ON case_studies
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: only authenticated users can update
CREATE POLICY "case_studies_update_authenticated"
  ON case_studies
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: only authenticated users can delete
CREATE POLICY "case_studies_delete_authenticated"
  ON case_studies
  FOR DELETE
  TO authenticated
  USING (true);
