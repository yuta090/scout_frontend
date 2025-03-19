-- Create index for better performance if it doesn't exist
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