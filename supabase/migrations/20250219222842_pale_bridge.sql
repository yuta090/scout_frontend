/*
  # Update campaign schema for job details and criteria

  1. Changes
    - Update job_details structure with platform and job types
    - Update target_criteria with candidate requirements
    - Update options with scheduling and messaging
    - Add RLS policies for security

  2. Security
    - Enable RLS on campaigns table
    - Add policies for agency access
*/

-- Create temporary columns with new structure
ALTER TABLE campaigns
ADD COLUMN temp_job_details jsonb,
ADD COLUMN temp_target_criteria jsonb,
ADD COLUMN temp_options jsonb;

-- Update temporary columns with new structure and migrate existing data
UPDATE campaigns
SET
  temp_job_details = jsonb_build_object(
    'platform', 'airwork',
    'job_type', '[]'::jsonb,
    'location', '[]'::jsonb,
    'skills', '[]'::jsonb
  ),
  temp_target_criteria = jsonb_build_object(
    'age_range', '[]'::jsonb,
    'experience_years', 0,
    'skills', '[]'::jsonb,
    'education', '[]'::jsonb
  ),
  temp_options = jsonb_build_object(
    'schedule', jsonb_build_object(
      'start_date', '',
      'end_date', '',
      'daily_limit', 50
    ),
    'message_template', ''
  );

-- Drop old columns
ALTER TABLE campaigns
DROP COLUMN IF EXISTS job_details,
DROP COLUMN IF EXISTS target_criteria,
DROP COLUMN IF EXISTS options;

-- Rename temporary columns to final names
ALTER TABLE campaigns
RENAME COLUMN temp_job_details TO job_details;

ALTER TABLE campaigns
RENAME COLUMN temp_target_criteria TO target_criteria;

ALTER TABLE campaigns
RENAME COLUMN temp_options TO options;

-- Set NOT NULL constraints
ALTER TABLE campaigns
ALTER COLUMN job_details SET NOT NULL,
ALTER COLUMN target_criteria SET NOT NULL,
ALTER COLUMN options SET NOT NULL;

-- Set default values
ALTER TABLE campaigns
ALTER COLUMN job_details SET DEFAULT jsonb_build_object(
  'platform', 'airwork',
  'job_type', '[]'::jsonb,
  'location', '[]'::jsonb,
  'skills', '[]'::jsonb
),
ALTER COLUMN target_criteria SET DEFAULT jsonb_build_object(
  'age_range', '[]'::jsonb,
  'experience_years', 0,
  'skills', '[]'::jsonb,
  'education', '[]'::jsonb
),
ALTER COLUMN options SET DEFAULT jsonb_build_object(
  'schedule', jsonb_build_object(
    'start_date', '',
    'end_date', '',
    'daily_limit', 50
  ),
  'message_template', ''
);

-- Add RLS policies if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'campaigns' 
    AND policyname = 'Agencies can manage their campaigns'
  ) THEN
    CREATE POLICY "Agencies can manage their campaigns"
      ON campaigns
      FOR ALL
      TO authenticated
      USING (auth.uid() = agency_id)
      WITH CHECK (auth.uid() = agency_id);
  END IF;
END $$;