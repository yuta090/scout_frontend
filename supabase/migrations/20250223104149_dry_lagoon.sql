/*
  # Fix scout_results relationships

  1. Changes
    - Add customer_id to scout_results table
    - Add foreign key constraint to link scout_results with customers
    - Update RLS policies for scout_results

  2. Security
    - Enable RLS on scout_results table
    - Add policy for agencies to view scout results
*/

-- Add customer_id to scout_results
ALTER TABLE scout_results
ADD COLUMN customer_id uuid REFERENCES customers(id) ON DELETE CASCADE;

-- Update scout_results to set customer_id based on campaign's customer_id
UPDATE scout_results
SET customer_id = campaigns.customer_id
FROM campaigns
WHERE scout_results.campaign_id = campaigns.id;

-- Make customer_id NOT NULL after setting values
ALTER TABLE scout_results
ALTER COLUMN customer_id SET NOT NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_scout_results_customer_id ON scout_results(customer_id);

-- Update RLS policies
DROP POLICY IF EXISTS "Agencies can view scout results" ON scout_results;

CREATE POLICY "Agencies can view scout results"
  ON scout_results
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = scout_results.customer_id
      AND customers.agency_id = auth.uid()
    )
  );