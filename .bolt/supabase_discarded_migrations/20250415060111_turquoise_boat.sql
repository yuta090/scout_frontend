/*
  # Add admin role and system settings

  1. Changes
    - Update role check constraint to include 'admin' role
    - Add system_settings table for admin configuration
    - Create function to get customer data with counts

  2. Security
    - Add RLS policies for admin access to system settings
*/

-- Update role check constraint to include 'admin' role
DO $$ 
BEGIN
  -- Check if constraint exists before dropping
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_role_check'
  ) THEN
    ALTER TABLE profiles
    DROP CONSTRAINT profiles_role_check;
  END IF;
END $$;

ALTER TABLE profiles
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('agency', 'client', 'admin'));

-- Create system_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS system_settings (
  id integer PRIMARY KEY,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on system_settings
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Drop policy if it exists before creating
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Only admins can access system settings'
    AND tablename = 'system_settings'
  ) THEN
    DROP POLICY "Only admins can access system settings" ON system_settings;
  END IF;
END $$;

-- Create policy for admin access to system_settings
CREATE POLICY "Only admins can access system settings"
  ON system_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create trigger for updated_at if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_system_settings_updated_at'
  ) THEN
    CREATE TRIGGER update_system_settings_updated_at
      BEFORE UPDATE ON system_settings
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Insert default settings
INSERT INTO system_settings (id, settings)
VALUES (1, '{
  "systemName": "HRaim",
  "maxCampaignsPerAgency": 100,
  "maxCustomersPerAgency": 50,
  "defaultDailyScoutLimit": 500,
  "maintenanceMode": false,
  "maintenanceMessage": "システムメンテナンス中です。しばらくお待ちください。",
  "apiKeys": {
    "airworkApiKey": "",
    "engageApiKey": ""
  }
}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE ON system_settings TO authenticated;

-- Create or replace function to get customer data with counts
CREATE OR REPLACE FUNCTION get_customer_data_with_counts(p_agency_id uuid)
RETURNS TABLE (
  id uuid,
  agency_id uuid,
  company_name text,
  contact_name text,
  email text,
  phone text,
  airwork_login jsonb,
  engage_login jsonb,
  airwork_auth_status text,
  engage_auth_status text,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  campaign_count bigint,
  scout_count bigint
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.agency_id,
    c.company_name,
    c.contact_name,
    c.email,
    c.phone,
    c.airwork_login,
    c.engage_login,
    c.airwork_auth_status,
    c.engage_auth_status,
    c.status,
    c.created_at,
    c.updated_at,
    COUNT(DISTINCT cm.id) AS campaign_count,
    COUNT(DISTINCT sr.id) AS scout_count
  FROM 
    customers c
    LEFT JOIN campaigns cm ON c.id = cm.customer_id
    LEFT JOIN scout_results sr ON c.id = sr.customer_id
  WHERE 
    c.agency_id = p_agency_id
  GROUP BY 
    c.id
  ORDER BY 
    c.company_name ASC;
END;
$$;

-- Drop function if it exists before granting permissions
DO $$ 
BEGIN
  EXECUTE 'REVOKE ALL ON FUNCTION get_customer_data_with_counts(uuid) FROM PUBLIC, authenticated';
  EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_customer_data_with_counts(uuid) TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_customer_data_with_counts IS 'Retrieves customer data with accurate campaign and scout counts for a specific agency';

-- Ensure indexes exist for better performance
CREATE INDEX IF NOT EXISTS idx_campaigns_customer_id ON campaigns(customer_id);
CREATE INDEX IF NOT EXISTS idx_scout_results_customer_id ON scout_results(customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_agency_id ON customers(agency_id);