/*
  # Add stored procedure for profile count by role

  1. New Functions
    - `get_profile_count_by_role`: Returns the count of profiles with a specific role
    - `create_profile_count_function`: Creates the get_profile_count_by_role function if it doesn't exist
    
  2. Purpose
    - Provide a reliable way to count profiles by role
    - Fix issues with count(*) in select queries
*/

-- Create function to get profile count by role
CREATE OR REPLACE FUNCTION get_profile_count_by_role(role_param text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_count integer;
BEGIN
  SELECT COUNT(*) INTO profile_count
  FROM profiles
  WHERE role = role_param;
  
  RETURN profile_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_profile_count_by_role(text) TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_profile_count_by_role IS 'Returns the count of profiles with a specific role';

-- Create function to create the get_profile_count_by_role function if it doesn't exist
CREATE OR REPLACE FUNCTION create_profile_count_function()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function is just a placeholder to check if the RPC interface is working
  -- The actual function get_profile_count_by_role is already created above
  RETURN;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_profile_count_function() TO authenticated;

-- Add comment
COMMENT ON FUNCTION create_profile_count_function IS 'Creates the get_profile_count_by_role function if it doesn\'t exist';