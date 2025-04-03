/*
  # Schema update for scout automation system

  1. New Tables
    - `profiles`: User profiles with role-based access
    - `customers`: Customer management
    - `campaigns`: Campaign management with structured JSON data
    - `scout_results`: Scout activity tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Implement role-based access control

  3. Changes
    - Add indexes for performance optimization
    - Set up triggers for updated_at timestamps
    - Configure default JSON structures for campaign settings
*/

-- Ensure profiles table exists and has correct structure
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('agency', 'client')),
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ensure customers table exists and has correct structure
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  contact_name text,
  email text,
  phone text,
  airwork_login jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ensure campaigns table exists and has correct structure
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  agency_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  job_details jsonb NOT NULL DEFAULT jsonb_build_object(
    'platform', 'airwork',
    'job_type', '[]'::jsonb,
    'location', '[]'::jsonb,
    'skills', '[]'::jsonb
  ),
  target_criteria jsonb NOT NULL DEFAULT jsonb_build_object(
    'age_range', '[]'::jsonb,
    'experience_years', 0,
    'skills', '[]'::jsonb,
    'education', '[]'::jsonb
  ),
  quantity integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'in_progress', 'completed', 'cancelled')),
  options jsonb NOT NULL DEFAULT jsonb_build_object(
    'schedule', jsonb_build_object(
      'start_date', '',
      'end_date', '',
      'daily_limit', 50
    ),
    'message_template', ''
  ),
  automation_settings jsonb NOT NULL DEFAULT jsonb_build_object(
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
  ),
  total_amount integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ensure scout_results table exists and has correct structure
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

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE scout_results ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
  DROP POLICY IF EXISTS "Agency can manage their customers" ON customers;
  DROP POLICY IF EXISTS "Agencies can manage their campaigns" ON campaigns;
  DROP POLICY IF EXISTS "Agencies can view scout results" ON scout_results;
  
  -- Create new policies
  CREATE POLICY "Users can read own profile"
    ON profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

  CREATE POLICY "Users can update own profile"
    ON profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

  CREATE POLICY "Agency can manage their customers"
    ON customers
    FOR ALL
    TO authenticated
    USING (auth.uid() = agency_id)
    WITH CHECK (auth.uid() = agency_id);

  CREATE POLICY "Agencies can manage their campaigns"
    ON campaigns
    FOR ALL
    TO authenticated
    USING (auth.uid() = agency_id)
    WITH CHECK (auth.uid() = agency_id);

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
END $$;

-- Create or replace indexes for better performance
DROP INDEX IF EXISTS idx_customers_agency_id;
DROP INDEX IF EXISTS idx_campaigns_agency_id;
DROP INDEX IF EXISTS idx_campaigns_customer_id;
DROP INDEX IF EXISTS idx_scout_results_campaign_id;
DROP INDEX IF EXISTS idx_scout_results_status;
DROP INDEX IF EXISTS idx_scout_results_candidate_id;

CREATE INDEX idx_customers_agency_id ON customers(agency_id);
CREATE INDEX idx_campaigns_agency_id ON campaigns(agency_id);
CREATE INDEX idx_campaigns_customer_id ON campaigns(customer_id);
CREATE INDEX idx_scout_results_campaign_id ON scout_results(campaign_id);
CREATE INDEX idx_scout_results_status ON scout_results(status);
CREATE INDEX idx_scout_results_candidate_id ON scout_results(candidate_id);

-- Create or replace function to handle updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create or replace triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
DROP TRIGGER IF EXISTS update_scout_results_updated_at ON scout_results;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scout_results_updated_at
  BEFORE UPDATE ON scout_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();