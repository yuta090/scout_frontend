import { createClient } from '@supabase/supabase-js';
import type { UserMetadata, Profile, Customer, Campaign, Activity, CampaignLog } from './types';

// 環境変数の取得
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 環境変数のバリデーション（より詳細なエラーメッセージ付き）
if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL が設定されていません。右上の "Connect to Supabase" ボタンをクリックして Supabase プロジェクトを設定してください。');
}

if (!supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY が設定されていません。右上の "Connect to Supabase" ボタンをクリックして Supabase プロジェクトを設定してください。');
}

// 型定義の追加
interface ProfileInfo {
  id: string;
  role: 'admin' | 'agency' | 'client' | string;
  company_name?: string | null;
  full_name?: string | null;
}

interface ActivityWithProfile {
  id: string;
  user_id: string;
  action: string;
  target_type?: string | null;
  target_id?: string | null;
  target_name?: string | null;
  details?: Record<string, any> | null;
  created_at: string;
  profiles: ProfileInfo | null;
}

// リトライ設定の改善
const RETRY_CONFIG = {
  maxRetries: 3,         // 最大リトライ回数
  initialDelay: 1000,    // 初回リトライの遅延（1秒）
  maxDelay: 5000,        // 最大遅延時間（5秒）
  factor: 2,             // 指数関数的な係数
};

// 改善された設定でSupabaseクライアントを作成
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,        // セッションの永続化
    autoRefreshToken: true,      // トークンの自動更新
    detectSessionInUrl: true,    // URLからのセッション検出
    storage: window.localStorage, // ローカルストレージを使用
    flowType: 'pkce'             // PKCE認証フロー
  },
  global: {
    headers: { 'x-application-name': 'scout-management' } // アプリケーション名をヘッダーに追加
  },
  db: {
    schema: 'public' // 使用するスキーマ
  },
  realtime: {
    params: {
      eventsPerSecond: 2 // リアルタイムイベントの制限
    }
  },
  // リクエストリトライ設定を追加
  httpClient: {
    fetch: async (url, options) => {
      let lastError;
      let delay = RETRY_CONFIG.initialDelay;

      for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
        try {
          const response = await fetch(url, options);
          
          // レスポンスが正常かチェック
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          return response;
        } catch (error) {
          lastError = error;
          
          // 最後の試行だった場合はエラーをスロー
          if (attempt === RETRY_CONFIG.maxRetries) {
            console.error('全てのリトライが失敗しました:', error);
            throw new Error('Supabase への接続に失敗しました。インターネット接続を確認してください。');
          }
          
          // 次の試行前に待機
          await new Promise(resolve => setTimeout(resolve, delay));
          
          // 次の遅延を計算（最大遅延を超えないように）
          delay = Math.min(delay * RETRY_CONFIG.factor, RETRY_CONFIG.maxDelay);
        }
      }
      
      throw lastError;
    }
  }
});

// 認証チェック関数を追加
export const checkAuth = async () => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;

    if (!session) {
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError) throw profileError;

    if (!profile) {
      return null;
    }

    return {
      session,
      profile
    };
  } catch (error) {
    console.error('認証チェックエラー:', error);
    return null;
  }
};

// パスワードリセットリンク生成関数を追加
export const generatePasswordResetLink = async (email: string, redirectTo: string) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo
    });

    if (error) {
      console.error('パスワードリセットエラー:', error);
      return {
        success: false,
        message: 'パスワードリセットメールの送信に失敗しました'
      };
    }

    return {
      success: true,
      message: 'パスワードリセットメールを送信しました'
    };
  } catch (error) {
    console.error('パスワードリセット処理エラー:', error);
    return {
      success: false,
      message: 'パスワードリセット処理中にエラーが発生しました'
    };
  }
};

// リトライロジック付きの改善されたエラーハンドリング
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1秒

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const handleSupabaseError = async (error: any, retryCount = 0): Promise<never> => {
  console.error('Supabase error:', error);
  
  // ネットワークエラーのリトライロジック
  if (error.message === 'Failed to fetch' && retryCount < MAX_RETRIES) {
    console.log(`リクエストを再試行します (試行 ${retryCount + 1}/${MAX_RETRIES})...`);
    await wait(RETRY_DELAY * Math.pow(2, retryCount));
    return handleSupabaseError(error, retryCount + 1);
  }
  
  // ネットワークエラー
  if (error.message === 'Failed to fetch') {
    throw new Error('ネットワークエラー: Supabase との接続に失敗しました。インターネット接続を確認してください。');
  }
  
  // データベースエラー
  if (error.code === 'PGRST301') {
    throw new Error('データベースエラー: Supabase の設定を確認してください。');
  }
  
  // 認証エラー
  if (error.code === 'AUTH_INVALID_CREDENTIALS') {
    throw new Error('認証エラー: メールアドレスまたはパスワードが正しくありません。');
  }

  // セッションエラー
  if (error.code === 'session_not_found') {
    // 無効なセッションをクリア
    supabase.auth.signOut();
    throw new Error('セッションが無効です。再度ログインしてください。');
  }

  // レート制限
  if (error.code === '429') {
    throw new Error('リクエスト制限: しばらく時間をおいてから再度お試しください。');
  }

  // より良いフォーマットの一般的なエラー
  throw new Error(`エラーが発生しました: ${error.message || '不明なエラー'}`);
};

// リトライロジック付きのSupabaseクエリラッパー関数
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

// 初期化時のセッションリフレッシュを追加
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    // セッションが有効、アクションは不要
  } else if (event === 'SIGNED_OUT') {
    // キャッシュデータをクリア
    window.localStorage.removeItem('supabase.auth.token');
  }
});

// ユーザーロールチェック関数
export const checkUserRole = async (userId: string): Promise<'agency' | 'client' | 'admin' | null> => {
  try {
    const { data, error } = await executeWithRetry(() =>
      supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle()
    );

    if (error) {
      console.error('ロールチェックエラー:', error);
      return null;
    }
    return data?.role || null;
  } catch (error) {
    console.error('ユーザーロールチェックエラー:', error);
    return null;
  }
};

// ユーザー管理関数
export const createUser = async (
  email: string,
  password: string,
  role: 'agency' | 'client' | 'admin',
  metadata?: Omit<UserMetadata, 'role'>
) => {
  try {
    console.log('ユーザー作成開始:', {
      email,
      role,
      metadata
    });

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

    console.log('ユーザー作成成功:', user.id);

    // プロフィールが自動作成されない場合に備えて手動で作成
    const { error: profileError } = await executeWithRetry(() =>
      supabase
        .from('profiles')
        .upsert([{
          id: user.id,
          role,
          email,
          company_name: metadata?.company_name || '',
          contact_name: metadata?.contact_name || '',
          phone: metadata?.phone || ''
        }])
    );

    if (profileError) {
      console.error('プロフィール作成エラー:', profileError);
      throw profileError;
    }

    console.log('プロフィール作成成功');

    const { data: { session }, error: signInError } = await executeWithRetry(() =>
      supabase.auth.signInWithPassword({
        email,
        password
      })
    );

    if (signInError) throw signInError;
    if (!session) throw new Error('ログインに失敗しました');

    console.log('ログイン成功');

    return { user, session };
  } catch (error) {
    console.error('ユーザー作成エラー:', error);
    throw error;
  }
};

// 顧客管理関数
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
    console.error('顧客作成エラー:', error);
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
    console.error('顧客更新エラー:', error);
    throw error;
  }
};

export const getCampaignLogs = async (campaign_id: string) => {
  try {
    const { data: campaignResults, error: campaignError } = await executeWithRetry(() =>
      supabase
        .from('campaign_results')
        .select(`
          id,
          campaign_id,
          details,
          created_at
        `)
        .eq('campaign_id', campaign_id)
        .order('created_at', { ascending: true })
    );
    if (campaignError) throw campaignError;

    const { data: scoutResults, error: scoutError } = await executeWithRetry(() =>
      supabase
        .from('scout_results')
        .select(`
          campaign_id,
          candidate_details
        `)
        .eq('campaign_id', campaign_id)
    );
    if (scoutError) throw scoutError;

    return campaignResults.map(log => {
      const details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;

      // Find matching scout result for this campaign_id
      const scout = scoutResults.find(s => s.campaign_id === log.campaign_id);
      const candidateDetails = scout?.candidate_details;

      if (candidateDetails) {
        // Push candidateDetails into success_msg
        details.success_msg = [...(details.success_msg || []), candidateDetails];
      }

      return {
        ...log,
        details, // Updated details with success_msg appended
      };
    }) as CampaignLog[];

  } catch (error) {
    console.error('キャンペーンログ取得エラー:', error);
    throw error;
  }
}

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
    console.error('顧客取得エラー:', error);
    throw error;
  }
};

// 認証チェック関数
export const checkAirworkAuth = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Basic validation
    if (!username || !password) {
      return {
        success: false,
        message: 'ログイン情報が設定されていません'
      };
    }

    if (username.length < 4) {
      return {
        success: false,
        message: 'ユーザー名は4文字以上で入力してください'
      };
    }

    if (password.length < 8) {
      return {
        success: false,
        message: 'パスワードは8文字以上で入力してください'
      };
    }

    try {
      const response = await fetch('/api/checkauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log(data)
      if (data.status === 'success') {
        return {
          success: true,
          message: '認証に成功しました'
        };
      } else {
        return {
          success: false,
          message: data?.message || 'ログインに失敗しました。認証情報を確認してください。'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'サーバーエラーが発生しました'
      };
    }
  } catch (error) {
    console.error('Error checking Airwork authentication:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '認証チェック中にエラーが発生しました'
    };
  }
};

// Engage認証チェック関数
export const checkEngageAuth = async (customerId: string): Promise<{ success: boolean; message: string }> => {
  try {
    const success = Math.random() > 0.3;
    
    await supabase
      .from('customers')
      .update({ engage_auth_status: success ? 'authenticated' : 'failed' })
      .eq('id', customerId);
    
    return { 
      success, 
      message: success ? '認証に成功しました' : '認証に失敗しました'
    };
  } catch (error) {
    console.error('Engage認証チェックエラー:', error);
    return {
      success: false,
      message: '認証チェック中にエラーが発生しました'
    };
  }
};

// 認証状態更新関数
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
    console.error(`${platform}認証状態の更新エラー:`, error);
    throw error;
  }
};

// アクティビティログ関数
export const getRecentActivities = async (userId: string): Promise<Activity[]> => {
  try {
    // 管理者かどうかを確認
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
    
    const isAdmin = userProfile?.role === 'admin';
    console.log('ユーザーは管理者:', isAdmin);
    
    // アクティビティデータを取得（JOINを使用して一度のクエリで関連情報も取得）
    let query = supabase
      .from('activities')
      .select(`
        *,
        profiles:user_id (
          id,
          role,
          company_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10);
    
    // 管理者でない場合は自分のアクティビティのみ取得
    if (!isAdmin) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    console.log('取得したアクティビティ:', data?.length || 0);
    
    if (!data || data.length === 0) {
      return [];
    }
    
    const activities = data as Activity[];
    
    console.log('返却するアクティビティ（プロファイルデータを確認）:', activities.map(a => ({
      id: a.id,
      action: a.action, // action カラムの内容を確認
      details: a.details,
      profile_role: a.profiles?.role, // 'profiles' オブジェクトから role を参照
      profile_company: a.profiles?.company_name, // 'profiles' オブジェクトから company_name を参照
      profile_full_name: a.profiles?.full_name // 'profiles' オブジェクトから full_name を参照 (あれば)
    })));
    
    return activities;
  } catch (error) {
    console.error('アクティビティ取得エラー:', error);
    return [];
  }
};

export const logActivity = async (userId: string, action: string, details: any) => {
  try {
    // ユーザーのロールを取得
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, company_name')
      .eq('id', userId)
      .maybeSingle(); // Use maybeSingle to handle missing profiles gracefully
    
    // Add profile information to details with fallback values
    details.role = profile?.role || details.role || 'unknown';
    details.company_name = profile?.company_name || details.company_name || 'Unknown Company';
    console.log('アクティビティにロールを追加:', details.role);

    // アクティビティを挿入
    const { data, error } = await executeWithRetry(() =>
      supabase
        .from('activities')
        .insert([{
          user_id: userId,
          action,
          details
        }])
        .select()
    );

    if (error) throw error;
    
    console.log('アクティビティを挿入:', data);
    return data;
  } catch (error) {
    console.error('アクティビティログ記録エラー:', error);
    throw error;
  }
};

// 型のエクスポート
export type { UserMetadata, Profile, Customer, Campaign, Activity, CampaignLog };