/*
  # Optimize customer queries with additional indexes

  1. Changes
    - Add indexes for commonly used search columns
    - Add composite indexes for frequently combined filters
    - Add indexes for sorting columns

  2. Security
    - No changes to RLS policies
*/

-- Add indexes for search columns
CREATE INDEX IF NOT EXISTS idx_customers_company_name ON customers(company_name);
CREATE INDEX IF NOT EXISTS idx_customers_contact_name ON customers(contact_name);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_customers_agency_status ON customers(agency_id, status);
CREATE INDEX IF NOT EXISTS idx_customers_agency_company ON customers(agency_id, company_name);

-- Add indexes for auth status columns
CREATE INDEX IF NOT EXISTS idx_customers_airwork_auth ON customers(airwork_auth_status);
CREATE INDEX IF NOT EXISTS idx_customers_engage_auth ON customers(engage_auth_status);

-- Add index for timestamp columns
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customers_updated_at ON customers(updated_at DESC);

-- Add partial indexes for active customers
CREATE INDEX IF NOT EXISTS idx_customers_active ON customers(agency_id, company_name) 
WHERE status = 'active';

-- Add indexes for related tables
CREATE INDEX IF NOT EXISTS idx_campaigns_customer_created ON campaigns(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scout_results_customer_created ON scout_results(customer_id, created_at DESC);

-- Add function for customer search
CREATE OR REPLACE FUNCTION search_customers(
  p_agency_id uuid,
  p_search_term text,
  p_status text DEFAULT NULL,
  p_page integer DEFAULT 1,
  p_page_size integer DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  company_name text,
  contact_name text,
  email text,
  phone text,
  status text,
  airwork_auth_status text,
  engage_auth_status text,
  campaign_count bigint,
  scout_count bigint,
  created_at timestamptz,
  updated_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  WITH filtered_customers AS (
    SELECT
      c.*,
      COUNT(DISTINCT cm.id) as campaign_count,
      COUNT(DISTINCT sr.id) as scout_count
    FROM customers c
    LEFT JOIN campaigns cm ON cm.customer_id = c.id
    LEFT JOIN scout_results sr ON sr.customer_id = c.id
    WHERE
      c.agency_id = p_agency_id
      AND (
        p_status IS NULL
        OR c.status = p_status
      )
      AND (
        p_search_term IS NULL
        OR c.company_name ILIKE '%' || p_search_term || '%'
        OR c.contact_name ILIKE '%' || p_search_term || '%'
        OR c.email ILIKE '%' || p_search_term || '%'
      )
    GROUP BY c.id
  )
  SELECT
    fc.id,
    fc.company_name,
    fc.contact_name,
    fc.email,
    fc.phone,
    fc.status,
    fc.airwork_auth_status,
    fc.engage_auth_status,
    fc.campaign_count,
    fc.scout_count,
    fc.created_at,
    fc.updated_at
  FROM filtered_customers fc
  ORDER BY fc.company_name ASC
  LIMIT p_page_size
  OFFSET (p_page - 1) * p_page_size;
END;
$$ LANGUAGE plpgsql;

-- Add function for customer stats
CREATE OR REPLACE FUNCTION get_customer_stats(
  p_agency_id uuid
)
RETURNS TABLE (
  total_customers bigint,
  active_customers bigint,
  pending_customers bigint,
  inactive_customers bigint,
  airwork_authenticated bigint,
  engage_authenticated bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_customers,
    COUNT(*) FILTER (WHERE status = 'active') as active_customers,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_customers,
    COUNT(*) FILTER (WHERE status = 'inactive') as inactive_customers,
    COUNT(*) FILTER (WHERE airwork_auth_status = 'authenticated') as airwork_authenticated,
    COUNT(*) FILTER (WHERE engage_auth_status = 'authenticated') as engage_authenticated
  FROM customers
  WHERE agency_id = p_agency_id;
END;
$$ LANGUAGE plpgsql;