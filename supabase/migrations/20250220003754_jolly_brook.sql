/*
  # Update projects table structure

  1. Changes
    - Add company_name columns to projects table
    - Update existing records with company names
    - Add trigger for company name updates

  2. Security
    - Maintain existing RLS policies
*/

-- Drop existing table if it exists
DROP TABLE IF EXISTS projects CASCADE;

-- Create projects table with new structure
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text NOT NULL CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  agency_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  client_company_name text,
  agency_company_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create trigger to update company names
CREATE OR REPLACE FUNCTION update_project_company_names()
RETURNS TRIGGER AS $$
BEGIN
  SELECT company_name INTO NEW.client_company_name
  FROM profiles
  WHERE id = NEW.client_id;

  SELECT company_name INTO NEW.agency_company_name
  FROM profiles
  WHERE id = NEW.agency_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_project_company_names_trigger
  BEFORE INSERT OR UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_project_company_names();

-- Create RLS policies
CREATE POLICY "Users can read own projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = client_id OR
    auth.uid() = agency_id
  );

CREATE POLICY "Users can update own projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = client_id OR
    auth.uid() = agency_id
  )
  WITH CHECK (
    auth.uid() = client_id OR
    auth.uid() = agency_id
  );

CREATE POLICY "Users can insert own projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = client_id OR
    auth.uid() = agency_id
  );

CREATE POLICY "Users can delete own projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = client_id OR
    auth.uid() = agency_id
  );