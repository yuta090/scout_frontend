/*
  # Update campaign schema for scout automation

  1. Changes
    - Add automation_settings to campaigns table
    - Add scout_results table for tracking individual scout results
    - Update campaign_results structure

  2. Security
    - Enable RLS on new tables
    - Add policies for agency access
*/

-- Add automation_settings to campaigns
ALTER TABLE campaigns
ADD COLUMN automation_settings jsonb NOT NULL DEFAULT jsonb_build_object(
  'browser_type', 'chrome',
  'retry_count', 3,
  'delay_between_scouts', 5,
  'working_hours', jsonb_build_object(
    'start', '09:00',
    'end', '18:00'
  ),
  'error_handling', jsonb_build_object(
    'max_errors', 10,
    'pause_on_error', true
  )
);

-- Create scout_results table
CREATE TABLE IF NOT EXISTS scout_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  candidate_id text NOT NULL,
  candidate_name text,
  candidate_profile jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL CHECK (status IN ('pending', 'sent', 'error', 'clicked', 'applied')),
  error_details text,
  sent_at timestamptz,
  clicked_at timestamptz,
  applied_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Update campaign_results structure
ALTER TABLE campaign_results
ADD COLUMN IF NOT EXISTS automation_logs jsonb[] DEFAULT ARRAY[]::jsonb[],
ADD COLUMN IF NOT EXISTS error_details jsonb DEFAULT '{}'::jsonb;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_scout_results_campaign_id ON scout_results(campaign_id);
CREATE INDEX IF NOT EXISTS idx_scout_results_status ON scout_results(status);
CREATE INDEX IF NOT EXISTS idx_scout_results_candidate_id ON scout_results(candidate_id);

-- Enable RLS
ALTER TABLE scout_results ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Agencies can view scout results"
  ON scout_results
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = scout_results.campaign_id
      AND campaigns.agency_id = auth.uid()
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_scout_results_updated_at
  BEFORE UPDATE ON scout_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();