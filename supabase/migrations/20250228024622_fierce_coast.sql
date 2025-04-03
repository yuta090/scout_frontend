/*
  # Add authentication status columns for AirWork and Engage

  1. New Columns
    - `airwork_auth_status` (text) - Authentication status for AirWork
    - `engage_auth_status` (text) - Authentication status for Engage

  2. Security
    - Maintain existing RLS policies
*/ -- Add authentication status columns to customers table

ALTER TABLE customers ADD COLUMN airwork_auth_status text NOT NULL DEFAULT 'pending' CHECK (airwork_auth_status IN ('pending',
                                                                                                                    'authenticated',
                                                                                                                    'failed')), ADD COLUMN engage_auth_status text NOT NULL DEFAULT 'pending' CHECK (engage_auth_status IN ('pending',
                                                                                                                                                                                                                            'authenticated',
                                                                                                                                                                                                                            'failed'));

-- Update existing customers with default status

UPDATE customers
SET airwork_auth_status = 'pending',
    engage_auth_status = 'pending';

-- Add comment to explain the columns
COMMENT ON COLUMN customers.airwork_auth_status IS 'Authentication status for AirWork: pending, authenticated, or failed';

COMMENT ON COLUMN customers.engage_auth_status IS 'Authentication status for Engage: pending, authenticated, or failed';

