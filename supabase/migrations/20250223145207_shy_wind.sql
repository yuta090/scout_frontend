-- Add search_criteria to campaigns table

ALTER TABLE campaigns ADD COLUMN search_criteria jsonb NOT NULL DEFAULT jsonb_build_object( 'keywords', '[]'::jsonb, 'jobExperience', '[]'::jsonb, 'desiredJobs', '[]'::jsonb, 'experience', jsonb_build_object( 'min', 0, 'max', 0 ), 'education', '[]'::jsonb, 'graduationYear', jsonb_build_object( 'min', '', 'max', '' ), 'workExperience', jsonb_build_object( 'min', '', 'max', '' ), 'skills', '[]'::jsonb, 'experiences', '[]'::jsonb, 'certifications', '[]'::jsonb, 'englishLevel', '1', 'companyCount', '6', 'managementCount', '1', 'employmentStatus', null, 'companies', '[]'::jsonb, 'recentOnly', false, 'exclude', false, 'otherLanguages', '[]'::jsonb, 'includeAllLanguages', false, 'freeWordOr', '', 'freeWordAnd', '');

-- Update existing campaigns with default search criteria

UPDATE campaigns
SET search_criteria = jsonb_build_object( 'keywords', '[]'::jsonb, 'jobExperience', '[]'::jsonb, 'desiredJobs', '[]'::jsonb, 'experience', jsonb_build_object( 'min', 0, 'max', 0 ), 'education', '[]'::jsonb, 'graduationYear', jsonb_build_object( 'min', '', 'max', '' ), 'workExperience', jsonb_build_object( 'min', '', 'max', '' ), 'skills', '[]'::jsonb, 'experiences', '[]'::jsonb, 'certifications', '[]'::jsonb, 'englishLevel', '1', 'companyCount', '6', 'managementCount', '1', 'employmentStatus', null, 'companies', '[]'::jsonb, 'recentOnly', false, 'exclude', false, 'otherLanguages', '[]'::jsonb, 'includeAllLanguages', false, 'freeWordOr', '', 'freeWordAnd', '')
WHERE search_criteria IS NULL;

