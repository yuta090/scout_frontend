import { createClient } from '@supabase/supabase-js';
import type { UserMetadata, Profile, Customer, Campaign, Activity } from './types';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please click the "Connect to Supabase" button in the top right to set up your Supabase project.');
}

// Create Supabase client with retry logic and better configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    flowType: 'pkce'
  },
  global: {
    headers: { 'x-application-name': 'scout-management' }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
});

// Improved error handling with retry logic
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const handleSupabaseError = async (error: any, retryCount = 0): Promise<never> => {
  console.error('Supabase error:', error);
  
  // Network errors with retry logic
  if (error.message === 'Failed to fetch' && retryCount < MAX_RETRIES) {
    await wait(RETRY_DELAY * Math.pow(2, retryCount));
    return handleSupabaseError(error, retryCount + 1);
  }
  
  // Network errors
  if (error.message === 'Failed to fetch') {
    throw new Error('ネットワークエラー: Supabaseとの接続に失敗しました。インターネット接続を確認してください。');
  }
  
  // Database errors
  if (error.code === 'PGRST301') {
    throw new Error('データベースエラー: Supabaseの設定を確認してください。');
  }
  
  // Authentication errors
  if (error.code === 'AUTH_INVALID_CREDENTIALS') {
    throw new Error('認証エラー: メールアドレスまたはパスワードが正しくありません。');
  }

  // Session errors
  if (error.code === 'session_not_found') {
    // Clear the invalid session
    supabase.auth.signOut();
    throw new Error('セッションが無効です。再度ログインしてください。');
  }

  // Rate limiting
  if (error.code === '429') {
    throw new Error('リクエスト制限: しばらく時間をおいてから再度お試しください。');
  }

  // Generic error with better formatting
  throw new Error(`エラーが発生しました: ${error.message || '不明なエラー'}`);
};

// Wrapper function for Supabase queries with retry logic
export const executeWithRetry = async <T>(
  operation: () => Promise<T>,
  retryCount = 0
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof Error && error.message === 'Failed to fetch' && retryCount < MAX_RETRIES) {
      await wait(RETRY_DELAY * Math.pow(2, retryCount));
      return executeWithRetry(operation, retryCount + 1);
    }
    throw error;
  }
};

// Add session refresh on initialization
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    // Session is valid, no action needed
  } else if (event === 'SIGNED_OUT') {
    // Clear any cached data
    window.localStorage.removeItem('supabase.auth.token');
  }
});

// User role check function
export const checkUserRole = async (userId: string): Promise<'agency' | 'client' | null> => {
  try {
    const { data, error } = await executeWithRetry(() =>
      supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()
    );

    if (error) throw error;
    return data?.role || null;
  } catch (error) {
    console.error('Error checking user role:', error);
    return null;
  }
};

// User management functions
export const createUser = async (
  email: string,
  password: string,
  role: 'agency' | 'client',
  metadata?: Omit<UserMetadata, 'role'>
) => {
  try {
    const { data: { user }, error: signUpError } = await executeWithRetry(() =>
      supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            ...metadata
          }
        }
      })
    );

    if (signUpError) throw signUpError;
    if (!user) throw new Error('ユーザー作成に失敗しました');

    const { error: profileError } = await executeWithRetry(() =>
      supabase
        .from('profiles')
        .insert([{
          id: user.id,
          role,
          email,
          company_name: metadata?.company_name || '',
          contact_name: metadata?.contact_name || '',
          phone: metadata?.phone || ''
        }])
    );

    if (profileError) throw profileError;

    const { data: { session }, error: signInError } = await executeWithRetry(() =>
      supabase.auth.signInWithPassword({
        email,
        password
      })
    );

    if (signInError) throw signInError;
    if (!session) throw new Error('ログインに失敗しました');

    return { user, session };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

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

// Get the base URL for Netlify Functions
const getFunctionBaseUrl = () => {
  // For local development
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:8888';
  }
  // For production
  return window.location.origin;
};

// Engage認証の許可されたユーザーとパスワードのリスト
const validEngageCredentials = [
  { username: 'hraim@tomataku.jp', password: 'password123' },
  { username: 't.oouchi@yokohamamusen.co.jp', password: 'yk7537623' }
];

// Authentication check functions
export const checkAirworkAuth = async (customerId: string) => {
  try {
    // Get customer credentials
    const { data: customer, error: customerError } = await executeWithRetry(() =>
      supabase
        .from('customers')
        .select('airwork_login')
        .eq('id', customerId)
        .single()
    );

    if (customerError) {
      throw new Error('顧客情報の取得に失敗しました');
    }
    
    if (!customer.airwork_login.username || !customer.airwork_login.password) {
      await updateAuthStatus(customerId, 'airwork', 'failed');
      return { success: false, message: 'ログイン情報が設定されていません' };
    }

    try {
      // Call Netlify Function for AirWork auth check
      const response = await fetch(`${getFunctionBaseUrl()}/.netlify/functions/check-airwork-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: customer.airwork_login.username,
          password: customer.airwork_login.password
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const status = result.success ? 'authenticated' : 'failed';
      
      await updateAuthStatus(customerId, 'airwork', status);

      return { 
        success: result.success, 
        message: result.message || (result.success ? '認証に成功しました' : '認証に失敗しました')
      };
    } catch (error) {
      console.error('Error checking AirWork authentication:', error);
      await updateAuthStatus(customerId, 'airwork', 'failed');
      throw error;
    }
  } catch (error) {
    console.error('Error checking AirWork authentication:', error);
    await updateAuthStatus(customerId, 'airwork', 'failed');
    throw error;
  }
};

export const checkEngageAuth = async (customerId: string) => {
  try {
    // Get customer data
    const { data: customer, error } = await supabase
      .from('customers')
      .select('engage_login')
      .eq('id', customerId)
      .single();

    if (error) {
      throw error;
    }

    if (!customer.engage_login || !customer.engage_login.username || !customer.engage_login.password) {
      throw new Error('Engage login credentials not found');
    }

    // Update status to pending
    await updateAuthStatus(customerId, 'engage', 'pending');

    try {
      // 重要な変更: check-airwork-auth関数を使用
      // forceSimpleAuthフラグを追加してEngage認証情報用に使用
      // serviceTypeを明示的に指定
      console.log('Engageの認証をcheck-airwork-auth関数で実行...');
      const response = await fetch(`${getFunctionBaseUrl()}/.netlify/functions/check-airwork-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: customer.engage_login.username,
          password: customer.engage_login.password,
          forceSimpleAuth: true, // 簡易認証モードを強制
          serviceType: 'engage'  // サービスタイプを明示的に指定
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const status = result.success ? 'authenticated' : 'failed';
      
      await updateAuthStatus(customerId, 'engage', status);

      return { 
        success: result.success, 
        message: result.message || (result.success ? '認証に成功しました' : '認証に失敗しました')
      };
    } catch (error) {
      console.error('Error checking Engage authentication:', error);
      await updateAuthStatus(customerId, 'engage', 'failed');
      throw error;
    }
  } catch (error) {
    console.error('Error checking Engage authentication:', error);
    await updateAuthStatus(customerId, 'engage', 'failed');
    throw error;
  }
};

export const updateAuthStatus = async (
  customerId: string, 
  platform: 'airwork' | 'engage', 
  status: 'pending' | 'authenticated' | 'failed'
) => {
  try {
    const updateData = platform === 'airwork' 
      ? { airwork_auth_status: status }
      : { engage_auth_status: status };
      
    const { data, error } = await supabase
      .from('customers')
      .update(updateData)
      .eq('id', customerId)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error updating ${platform} auth status:`, error);
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

// Re-export types
export type { UserMetadata, Profile, Customer, Campaign, Activity };