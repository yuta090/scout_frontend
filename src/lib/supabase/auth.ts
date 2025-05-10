import { supabase } from './client';
import { executeWithRetry } from './utils';
import type { UserMetadata } from '../types';

// ユーザーロールチェック関数
export const checkUserRole = async (userId: string): Promise<'agency' | 'client' | 'admin' | 'referral_agent' | null> => {
  try {
    console.log('ユーザーロールチェック開始:', userId);
    
    const { data, error } = await executeWithRetry(() =>
      supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()
    );

    if (error) {
      console.error('ロールチェックエラー:', error);
      throw error;
    }
    
    console.log('ロールチェック結果:', data?.role);
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
  role: 'agency' | 'client' | 'admin' | 'referral_agent',
  metadata?: Omit<UserMetadata, 'role'>
) => {
  try {
    console.log('ユーザー作成開始:', {
      email,
      role,
      metadata: {
        company_name: metadata?.company_name,
        contact_name: metadata?.contact_name,
        phone: metadata?.phone,
        agency_type: metadata?.agency_type
      }
    });

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
            company_name: metadata?.company_name,
            contact_name: metadata?.contact_name,
            phone: metadata?.phone,
            agency_type: metadata?.agency_type
          }
        }
      })
    );

    if (signUpError) throw signUpError;
    if (!user) throw new Error('ユーザー作成に失敗しました');

    console.log('ユーザー作成成功:', user.id);

    // プロファイルの作成を待機
    await new Promise(resolve => setTimeout(resolve, 1000));

    // プロファイルが作成されたことを確認
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.log('プロファイルが見つからないため手動で作成します');
      
      // プロファイルが存在しない場合は手動で作成
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([{
          id: user.id,
          role,
          email,
          company_name: metadata?.company_name || '',
          contact_name: metadata?.contact_name || '',
          phone: metadata?.phone || '',
          agency_type: metadata?.agency_type || null
        }]);

      if (insertError) {
        console.error('プロファイル手動作成エラー:', insertError);
        throw insertError;
      }
      
      console.log('プロファイル手動作成成功');
    } else {
      console.log('既存のプロファイルを確認:', profile);
      
      // プロファイルが存在するが、contact_nameやphoneが設定されていない場合は更新
      if ((!profile.contact_name && metadata?.contact_name) || 
          (!profile.phone && metadata?.phone) ||
          (!profile.agency_type && metadata?.agency_type)) {
        
        console.log('プロファイルを更新します');
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            contact_name: metadata?.contact_name || profile.contact_name,
            phone: metadata?.phone || profile.phone,
            agency_type: metadata?.agency_type || profile.agency_type
          })
          .eq('id', user.id);
          
        if (updateError) {
          console.error('プロファイル更新エラー:', updateError);
          throw updateError;
        }
        
        console.log('プロファイル更新成功');
      }
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

    console.log('ログイン成功');

    return { user, session };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// AirWork認証チェック関数
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
    console.log('Engage認証チェック開始');
    
    // Supabase Edge Functionを呼び出す
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase設定が見つかりません');
    }
    
    const response = await fetch(`${supabaseUrl}/functions/v1/check-engage-auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey
      },
      body: JSON.stringify({ customerId })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`認証サーバーエラー: ${errorText}`);
    }
    
    const result = await response.json();
    
    // 認証結果を顧客データに反映
    if (customerId) {
      await supabase
        .from('customers')
        .update({ engage_auth_status: result.success ? 'authenticated' : 'failed' })
        .eq('id', customerId);
    }
    
    return {
      success: result.success,
      message: result.message || (result.success ? '認証に成功しました' : '認証に失敗しました')
    };
  } catch (error) {
    console.error('Engage認証チェックエラー:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '認証チェック中にエラーが発生しました'
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

// パスワードリセットリンク生成関数
export const generatePasswordResetLink = async (email: string, redirectUrl?: string): Promise<{ success: boolean; message: string; link?: string }> => {
  try {
    console.log('パスワードリセットリンク生成開始:', email);
    
    // Supabase Edge Functionを呼び出す
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase設定が見つかりません');
    }
    
    const response = await fetch(`${supabaseUrl}/functions/v1/password-reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey
      },
      body: JSON.stringify({ 
        email,
        redirectUrl: redirectUrl || `${window.location.origin}/reset-password`
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '認証サーバーエラー');
    }
    
    const result = await response.json();
    
    return {
      success: result.success,
      message: result.message || 'パスワードリセットリンクを送信しました',
      link: result.data?.action_link
    };
  } catch (error) {
    console.error('パスワードリセットリンク生成エラー:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'パスワードリセットリンク生成中にエラーが発生しました'
    };
  }
};