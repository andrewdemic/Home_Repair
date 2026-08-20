/*
# Convert repairs to multi-user (owner-scoped)

This migration converts the single-tenant repairs table into a multi-user table
so that each authenticated user only sees and manages their own repairs.

1. Schema Changes
   - Add `user_id` column to `repairs`:
     - Type: uuid, NOT NULL
     - Default: auth.uid() (so inserts from the client that omit user_id still work)
     - Foreign key to auth.users(id) with ON DELETE CASCADE
   - Add an index on user_id for per-user query performance.

2. Backfill
   - Existing rows get a NULL user_id first (column is added nullable), then we
     delete orphaned single-tenant test data and set NOT NULL.

3. Security (RLS)
   - Drop the old anon-accessible policies (they allowed everyone to read/write).
   - Create 4 new owner-scoped policies (SELECT/INSERT/UPDATE/DELETE) scoped to
     `TO authenticated` using `auth.uid() = user_id`.
   - The INSERT policy's WITH CHECK ensures the row's user_id matches the signed-in
     user. The DEFAULT auth.uid() on the column makes client inserts that omit
     user_id still satisfy this check.

4. Important Notes
   - The frontend MUST build a sign-in/sign-up screen. Without an authenticated
     session, auth.uid() returns NULL and every query returns zero rows.
   - The `user_id` column has DEFAULT auth.uid() so client code does not need to
     pass user_id on insert — it is filled automatically from the session.
*/

-- 1. Add user_id column (nullable first so the add succeeds on a populated table)
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS user_id uuid;

-- 2. Remove orphaned rows that have no owner (single-tenant test data)
DELETE FROM repairs WHERE user_id IS NULL;

-- 3. Make user_id NOT NULL
ALTER TABLE repairs ALTER COLUMN user_id SET NOT NULL;

-- 4. Add foreign key to auth.users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'repairs_user_id_fkey' AND table_name = 'repairs'
  ) THEN
    ALTER TABLE repairs
      ADD CONSTRAINT repairs_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 5. Default user_id to the authenticated user on insert
ALTER TABLE repairs ALTER COLUMN user_id SET DEFAULT auth.uid();

-- 6. Index for per-user queries
CREATE INDEX IF NOT EXISTS idx_repairs_user_id ON repairs(user_id);

-- 7. Drop old single-tenant policies
DROP POLICY IF EXISTS "anon_select_repairs" ON repairs;
DROP POLICY IF EXISTS "anon_insert_repairs" ON repairs;
DROP POLICY IF EXISTS "anon_update_repairs" ON repairs;
DROP POLICY IF EXISTS "anon_delete_repairs" ON repairs;

-- 8. Create owner-scoped policies (authenticated only)
DROP POLICY IF EXISTS "select_own_repairs" ON repairs;
CREATE POLICY "select_own_repairs" ON repairs FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_repairs" ON repairs;
CREATE POLICY "insert_own_repairs" ON repairs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_repairs" ON repairs;
CREATE POLICY "update_own_repairs" ON repairs FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_repairs" ON repairs;
CREATE POLICY "delete_own_repairs" ON repairs FOR DELETE
  TO authenticated USING (auth.uid() = user_id);