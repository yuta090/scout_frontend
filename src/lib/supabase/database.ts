import { supabase } from './client';
import { executeWithRetry } from './utils';
import type { Customer, Campaign, Activity } from '../types';

// Customer management functions
export const createCustomer = async (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const { data, error } = await executeWithRetry(() =>
      supabase
        .from('customers')
        .insert([customer])
        .select()
        .single()
    );

    if (error) throw error;
    return data as Customer;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

export const updateCustomer = async (id: string, updates: Partial<Customer>) => {
  try {
    const { data, error } = await executeWithRetry(() =>
      supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
    );

    if (error) throw error;
    return data as Customer;
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
};

export const getCustomers = async (agencyId: string) => {
  try {
    const { data, error } = await executeWithRetry(() =>
      supabase
        .from('customers')
        .select(`
          *,
          campaigns (count),
          scout_results (count)
        `)
        .eq('agency_id', agencyId)
        .order('company_name', { ascending: true })
    );

    if (error) throw error;

    return data.map(customer => ({
      ...customer,
      _count: {
        campaigns: customer.campaigns.count,
        scouts: customer.scout_results.count
      }
    })) as Customer[];
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

// Activity log functions
export const getRecentActivities = async (userId: string) => {
  try {
    const { data, error } = await executeWithRetry(() =>
      supabase
        .from('activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)
    );

    if (error) throw error;
    return data as Activity[];
  } catch (error) {
    console.error('Error fetching activities:', error);
    throw error;
  }
};

export const logActivity = async (userId: string, action: string, details: any) => {
  try {
    const { error } = await executeWithRetry(() =>
      supabase
        .from('activities')
        .insert([{
          user_id: userId,
          action,
          details
        }])
    );

    if (error) throw error;
  } catch (error) {
    console.error('Error logging activity:', error);
    throw error;
  }
};