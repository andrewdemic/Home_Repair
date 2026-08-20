/*
# Create repairs table (single-tenant, no auth)

1. New Tables
- `repairs`
  - `id` (uuid, primary key)
  - `title` (text, not null) — short name of the repair
  - `description` (text) — longer notes about the repair
  - `room` (text) — which room/area of the home
  - `status` (text) — one of: todo, in_progress, done (default todo)
  - `priority` (text) — one of: low, medium, high, urgent (default medium)
  - `category` (text) — e.g. plumbing, electrical, hvac, cosmetic, structural, other
  - `cost` (numeric) — estimated or actual cost
  - `contractor` (text) — who is doing the work
  - `due_date` (date) — when it needs to be done
  - `completed_at` (timestamptz) — when it was finished
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on `repairs`.
- Allow anon + authenticated CRUD because the data is intentionally shared/public (single-tenant app, no sign-in).

3. Indexes
- Index on status for filtering
- Index on priority for filtering
- Index on created_at for sorting
*/

CREATE TABLE IF NOT EXISTS repairs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  room text DEFAULT '',
  status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','in_progress','done')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  category text DEFAULT 'other',
  cost numeric(10,2) DEFAULT 0,
  contractor text DEFAULT '',
  due_date date,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE repairs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_repairs" ON repairs;
CREATE POLICY "anon_select_repairs" ON repairs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_repairs" ON repairs;
CREATE POLICY "anon_insert_repairs" ON repairs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_repairs" ON repairs;
CREATE POLICY "anon_update_repairs" ON repairs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_repairs" ON repairs;
CREATE POLICY "anon_delete_repairs" ON repairs FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_repairs_status ON repairs(status);
CREATE INDEX IF NOT EXISTS idx_repairs_priority ON repairs(priority);
CREATE INDEX IF NOT EXISTS idx_repairs_created_at ON repairs(created_at DESC);

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS repairs_updated_at ON repairs;
CREATE TRIGGER repairs_updated_at BEFORE UPDATE ON repairs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();