/*
  # Add Engage login credentials to customers table

  1. Changes
    - Add engage_login column to customers table to store Engage credentials
    - Update existing customers with empty engage_login object

  2. Security
    - No changes to RLS policies needed
*/

-- Add engage_login column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'customers'
    AND column_name = 'engage_login'
  ) THEN
    ALTER TABLE customers
    ADD COLUMN engage_login jsonb NOT NULL DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Update existing customers with empty engage_login if null
UPDATE customers
SET engage_login = '{}'::jsonb
WHERE engage_login IS NULL;

-- Add comment to explain the column
COMMENT ON COLUMN customers.engage_login IS 'Engage login credentials (username and password)';