/*
  # Update search criteria in campaigns table

  1. Changes
    - Add search_criteria column if it doesn't exist
    - Set default value with all search criteria fields
    - Update existing records with default search criteria

  2. Structure
    - search_criteria (jsonb)
      - keywords (array)
      - jobExperience (array)
      - desiredJobs (array)
      - experience (object)
        - min (number)
        - max (number)
      - education (array)
      - graduationYear (object)
        - min (string)
        - max (string)
      - workExperience (object)
        - min (string)
        - max (string)
      - skills (array)
      - experiences (array)
      - certifications (array)
      - englishLevel (string)
      - companyCount (string)
      - managementCount (string)
      - employmentStatus (string|null)
      - companies (array)
      - recentOnly (boolean)
      - exclude (boolean)
      - otherLanguages (array)
      - includeAllLanguages (boolean)
      - freeWordOr (string)
      - freeWordAnd (string)
*/

-- Add search_criteria column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'campaigns'
    AND column_name = 'search_criteria'
  ) THEN
    ALTER TABLE campaigns
    ADD COLUMN search_criteria jsonb NOT NULL DEFAULT jsonb_build_object(
      'keywords', '[]'::jsonb,
      'jobExperience', '[]'::jsonb,
      'desiredJobs', '[]'::jsonb,
      'experience', jsonb_build_object(
        'min', 0,
        'max', 0
      ),
      'education', '[]'::jsonb,
      'graduationYear', jsonb_build_object(
        'min', '',
        'max', ''
      ),
      'workExperience', jsonb_build_object(
        'min', '',
        'max', ''
      ),
      'skills', '[]'::jsonb,
      'experiences', '[]'::jsonb,
      'certifications', '[]'::jsonb,
      'englishLevel', '1',
      'companyCount', '6',
      'managementCount', '1',
      'employmentStatus', null,
      'companies', '[]'::jsonb,
      'recentOnly', false,
      'exclude', false,
      'otherLanguages', '[]'::jsonb,
      'includeAllLanguages', false,
      'freeWordOr', '',
      'freeWordAnd', ''
    );
  END IF;
END $$;

-- Update existing campaigns with default search criteria if search_criteria is NULL
UPDATE campaigns
SET search_criteria = jsonb_build_object(
  'keywords', '[]'::jsonb,
  'jobExperience', '[]'::jsonb,
  'desiredJobs', '[]'::jsonb,
  'experience', jsonb_build_object(
    'min', 0,
    'max', 0
  ),
  'education', '[]'::jsonb,
  'graduationYear', jsonb_build_object(
    'min', '',
    'max', ''
  ),
  'workExperience', jsonb_build_object(
    'min', '',
    'max', ''
  ),
  'skills', '[]'::jsonb,
  'experiences', '[]'::jsonb,
  'certifications', '[]'::jsonb,
  'englishLevel', '1',
  'companyCount', '6',
  'managementCount', '1',
  'employmentStatus', null,
  'companies', '[]'::jsonb,
  'recentOnly', false,
  'exclude', false,
  'otherLanguages', '[]'::jsonb,
  'includeAllLanguages', false,
  'freeWordOr', '',
  'freeWordAnd', ''
)
WHERE search_criteria IS NULL;