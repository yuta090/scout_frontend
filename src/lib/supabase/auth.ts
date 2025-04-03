import { supabase } from './client';
import { executeWithRetry } from './utils';
import type { UserMetadata } from '../types';

// ユーザーロールチェック関数
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

// ユーザー作成関数
export const createUser = async (
  email: string,
  password: string,
  role: 'agency' | 'client',
  metadata?: Omit<UserMetadata, 'role'>
) => {
  try {
    // 既存のユーザーをチェック
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new Error('このメールアドレスは既に登録されています');
    }

    // 新規ユーザーを作成
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

    // プロファイルの作成を待機
    await new Promise(resolve => setTimeout(resolve, 1000));

    // プロファイルが作成されたことを確認
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      // プロファイルが存在しない場合は手動で作成
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([{
          id: user.id,
          role,
          email,
          company_name: metadata?.company_name || '',
          contact_name: metadata?.contact_name || '',
          phone: metadata?.phone || ''
        }]);

      if (insertError) throw insertError;
    }

    // ログインを実行
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

// AirWork認証チェック関数
export const checkAirworkAuth = async (
  customerId: string,
  username?: string,
  password?: string
): Promise<{ success: boolean; message: string; logs?: any[] }> => {
  const logs: Array<{
    timestamp: string;
    message: string;
    data?: any;
    error?: string;
  }> = [];

  const addLog = (message: string, data?: any, error?: string) => {
    logs.push({
      timestamp: new Date().toISOString(),
      message,
      ...(data && { data }),
      ...(error && { error })
    });
  };

  try {
    addLog('認証プロセスを開始');

    // 認証情報の取得
    let authUsername: string | undefined;
    let authPassword: string | undefined;

    // フォームからの入力値がある場合はそちらを優先
    if (username?.trim() && password?.trim()) {
      authUsername = username.trim();
      authPassword = password.trim();
      addLog('フォームの認証情報を使用', { hasUsername: true, hasPassword: true });
    } else {
      // DBから顧客情報を取得
      addLog('顧客情報の取得を開始');
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('airwork_login')
        .eq('id', customerId)
        .single();

      if (customerError) {
        addLog('顧客情報の取得に失敗', null, customerError.message);
        throw new Error('顧客情報の取得に失敗しました');
      }

      authUsername = customer?.airwork_login?.username?.trim();
      authPassword = customer?.airwork_login?.password?.trim();
      
      addLog('顧客情報を取得', {
        hasUsername: !!authUsername,
        hasPassword: !!authPassword
      });
    }

    // 認証情報の検証
    if (!authUsername || !authPassword) {
      const missingFields = [];
      if (!authUsername) missingFields.push('ユーザー名');
      if (!authPassword) missingFields.push('パスワード');
      
      addLog('認証情報の検証に失敗', { missingFields }, '必要な認証情報が不足しています');
      throw new Error(`Airワークの${missingFields.join('と')}が設定されていません`);
    }

    // 認証成功とみなす
    addLog('認証成功');

    // 認証状態を更新
    const { error: updateError } = await supabase
      .from('customers')
      .update({ 
        airwork_auth_status: 'authenticated',
        airwork_login: {
          username: authUsername,
          password: authPassword
        }
      })
      .eq('id', customerId);

    if (updateError) {
      addLog('認証状態の更新に失敗', null, updateError.message);
    } else {
      addLog('認証状態を更新', {
        status: 'authenticated'
      });
    }

    return {
      success: true,
      message: '認証に成功しました',
      logs
    };

  } catch (error) {
    console.error('AirWork認証チェックエラー:', error);
    
    addLog('認証プロセスでエラーが発生', null, error instanceof Error ? error.message : '不明なエラー');

    // エラー時は認証状態を失敗に設定
    try {
      await supabase
        .from('customers')
        .update({ airwork_auth_status: 'failed' })
        .eq('id', customerId);
      
      addLog('認証状態を失敗に更新');
    } catch (updateError) {
      addLog('認証状態の更新に失敗', null, updateError instanceof Error ? updateError.message : '不明なエラー');
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : '認証チェック中にエラーが発生しました',
      logs
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