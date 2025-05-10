import { supabase } from './client';

// Supabase Edge Functionを使用してAdmin API操作を実行する
export const adminApi = {
  /**
   * 新しいユーザーを作成する (New implementation from user)
   * @param userData ユーザーデータ（メールアドレス、パスワードなど）
   * @returns 作成結果
   */
  createUser: async (userData: any) => {
    try {
      console.log('ユーザー作成リクエスト:', {
        email: userData.email,
        role: userData.role, // Note: This role seems different from agency_role used before
        agency_id: userData.agency_id
      });

      // Supabase Edge Functionを呼び出す
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase設定が見つかりません');
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('認証セッションが見つかりません');
      }
      
      // --- Note: Calling a different Edge Function endpoint --- 
      const response = await fetch(`${supabaseUrl}/functions/v1/create-subaccount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseAnonKey
        },
        body: JSON.stringify(userData) // Sending full userData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('サーバーからのエラーレスポンス:', errorData);
        // --- Note: Different error handling --- 
        throw new Error(errorData.error || '認証サーバーエラー');
      }
      
      const result = await response.json();
      console.log('サーバーからの成功レスポンス:', result);
      
      // --- Note: Different return structure --- 
      return {
        success: result.success,
        message: result.message || 'ユーザーを作成しました',
        data: result.data,
        error: null
      };
    } catch (error) {
      console.error('ユーザー作成エラー:', error);
      // --- Note: Different error return structure --- 
      return {
        success: false,
        message: error instanceof Error ? error.message : 'ユーザー作成中にエラーが発生しました',
        data: null,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },
  
  /**
   * ユーザーが存在するかチェックする
   * @param email ユーザーのメールアドレス
   * @returns ユーザーが存在するかどうか
   */
  checkUserExists: async (email: string) => {
    try {
      // メールアドレスのバリデーション
      if (!email || typeof email !== 'string' || email.trim() === '') {
        return { success: false, error: 'メールアドレスは必須です', exists: false };
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        return { success: false, error: 'Supabase設定が見つかりません', exists: false };
      }
      
      // 認証トークンを取得
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return { success: false, error: '認証セッションが見つかりません', exists: false };
      }

      // Edge Functionを呼び出す (original endpoint)
      const response = await fetch(`${supabaseUrl}/functions/v1/admin-api`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseAnonKey
        },
        body: JSON.stringify({
          action: 'checkUserExists',
          data: {
            email
          }
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: errorText };
        }
        
        return { success: false, error: errorData.error || 'ユーザー確認に失敗しました', exists: false };
      }
      
      const result = await response.json();
      return { success: true, exists: result.exists };
    } catch (error) {
      console.error('Admin API checkUserExists エラー:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '不明なエラーが発生しました',
        exists: false
      };
    }
  },
  
  /**
   * パスワードリセットリンクを生成する
   * @param email ユーザーのメールアドレス
   * @param redirectTo リダイレクト先URL
   * @returns パスワードリセットリンク
   */
  resetPassword: async (email: string, redirectTo?: string) => {
    try {
      // メールアドレスのバリデーション
      if (!email || typeof email !== 'string' || email.trim() === '') {
        return { success: false, error: 'メールアドレスは必須です' };
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        return { success: false, error: 'Supabase設定が見つかりません' };
      }
      
      // 認証トークンを取得
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return { success: false, error: '認証セッションが見つかりません' };
      }
      
      // Edge Functionを呼び出す (original endpoint)
      const response = await fetch(`${supabaseUrl}/functions/v1/admin-api`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseAnonKey
        },
        body: JSON.stringify({
          action: 'resetPassword',
          data: {
            email,
            redirectTo: redirectTo || `${window.location.origin}/reset-password`
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: errorText };
        }

        return { success: false, error: errorData.error || 'パスワードリセットリンク生成に失敗しました' };
      }

      const result = await response.json();
      
      // パスワードリセットリンクの情報をログに出力（デバッグ用）
      if (result.success && result.data?.properties?.action_link) {
        console.log('パスワードリセットリンク生成成功:', {
          actionLink: result.data.properties.action_link,
          properties: result.data.properties
        });
      } else {
        console.warn('パスワードリセットリンク生成は成功したが、リンク情報がありません:', result);
      }
      
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Admin API resetPassword エラー:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '不明なエラーが発生しました'
      };
    }
  },
  
  /**
   * ユーザーを削除する (Corrected for delete-subaccount function)
   * @param agencyId 削除操作を行うユーザーのID
   * @param userId 削除対象のサブアカウントのユーザーID
   * @returns 削除結果
   */
  deleteUser: async (agencyId: string, userId: string) => {
    try {
      if (!agencyId || !userId) {
        return { success: false, error: 'Agency ID and User ID are required' };
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        return { success: false, error: 'Supabase設定が見つかりません' };
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return { success: false, error: '認証セッションが見つかりません' };
      }

      // Call the correct Edge Function endpoint: delete-subaccount
      const response = await fetch(`${supabaseUrl}/functions/v1/delete-subaccount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseAnonKey
        },
        // Send both agency_id and user_id
        body: JSON.stringify({
          agency_id: agencyId,
          user_id: userId
        })
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: await response.text() };
        }
        console.error('Delete Subaccount Error Response:', errorData);
        return { success: false, error: errorData?.error || 'サブアカウントの削除に失敗しました' };
      }

      const result = await response.json();
      return { success: result.success, message: result.message }; // Return success/message from function

    } catch (error) {
      console.error('Admin API deleteUser エラー:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '不明なエラーが発生しました' 
      };
    }
  },

  /**
   * ユーザー情報を更新する
   * @param userId ユーザーID
   * @param userData 更新するデータ
   * @returns 更新結果
   */
  updateUser: async (userId: string, userData: any) => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        return { success: false, error: 'Supabase設定が見つかりません' };
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return { success: false, error: '認証セッションが見つかりません' };
      }

      // Edge Functionを呼び出す (original endpoint)
      const response = await fetch(`${supabaseUrl}/functions/v1/admin-api`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseAnonKey
        },
        body: JSON.stringify({
          action: 'updateUser',
          data: {
            userId,
            userData
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: errorText };
        }
        return { success: false, error: errorData.error || 'ユーザー更新に失敗しました' };
      }

      const result = await response.json();
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Admin API updateUser エラー:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '不明なエラーが発生しました' 
      };
    }
  }
};