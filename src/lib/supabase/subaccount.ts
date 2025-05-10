import { supabase } from './client';
import { adminApi } from './admin';
import { sendEmailViaSupabase, getSubAccountCreationEmailTemplate, getSubAccountCreationEmailText } from '../email';

// サブアカウントの型定義
export interface SubAccount {
  id: string;
  agency_id: string;
  email: string;
  contact_name?: string;
  phone?: string;
  role: 'admin' | 'staff' | 'accounting' | 'readonly';
  permissions: {
    customers: { view: boolean; create: boolean; edit: boolean; delete: boolean };
    campaigns: { view: boolean; create: boolean; edit: boolean; delete: boolean };
    reports: { view: boolean };
    billing: { 
      view: boolean;
      view_all_customers: boolean; 
    };
    view_all_campaigns: boolean;
  };
  status: 'active' | 'inactive' | 'pending';
  created_at?: string;
  updated_at?: string;
}

// フォームデータの型定義
export interface SubAccountFormData {
  email: string;
  contact_name: string;
  phone: string;
  role: 'admin' | 'staff' | 'accounting' | 'readonly';
  status: 'active' | 'inactive' | 'pending';
  permissions: {
    customers: { view: boolean; create: boolean; edit: boolean; delete: boolean };
    campaigns: { view: boolean; create: boolean; edit: boolean; delete: boolean };
    reports: { view: boolean };
    billing: { 
      view: boolean;
      view_all_customers: boolean; 
    };
    view_all_campaigns: boolean;
  };
}

// メール送信のリトライ処理を行う関数
export async function sendEmailWithRetry(emailData: { to: string; subject: string; html: string; text?: string; from?: string }, maxRetries = 3) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      // from パラメータを追加
      const completeEmailData = {
        ...emailData,
        from: emailData.from || 'スカウトツール <noreply@example.com>'
      };
      
      console.log('メール送信試行:', {
        to: completeEmailData.to,
        subject: completeEmailData.subject,
        fromProvided: !!completeEmailData.from
      });
      
      const result = await sendEmailViaSupabase(completeEmailData);
      if (result.success) {
        return { success: true, data: result.data };
      }
      throw new Error(result.error || 'メール送信に失敗しました');
    } catch (error) {
      attempt++;
      console.error(`メール送信エラー (試行 ${attempt}/${maxRetries}):`, error);
      if (attempt === maxRetries) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'メール送信に失敗しました'
        };
      }
      // 指数バックオフで待機時間を増やす
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  return { success: false, error: '最大リトライ回数を超過しました' };
}

// メールアドレスの重複チェックを行う関数
export async function checkEmailExists(email: string, currentId?: string): Promise<boolean> {
  if (!email) return false;

  try {
    console.log(`メールアドレス重複チェック開始: ${email}, 現在のID: ${currentId || 'なし'}`);
    
    // サブアカウントテーブルでの重複チェック
    const { data, error } = await supabase
      .from('agency_subaccounts')
      .select('id')
      .eq('email', email.toLowerCase());

    if (error) {
      console.error('メールアドレス重複チェックエラー:', error);
      throw error;
    }

    console.log(`agency_subaccountsテーブルの結果:`, data);
    
    // 編集時は現在のサブアカウントを除外
    const existsInSubaccounts = currentId 
      ? data?.some(account => account.id !== currentId)
      : data && data.length > 0;
    
    console.log(`agency_subaccountsテーブルでの重複: ${existsInSubaccounts ? 'あり' : 'なし'}`);

    // auth.usersテーブルでの重複チェック
    const { success, exists, error: authError } = await adminApi.checkUserExists(email.toLowerCase());

    if (!success) {
      console.error('認証テーブルの重複チェックエラー:', authError);
      throw new Error('メールアドレスの確認中にエラーが発生しました');
    }

    console.log(`auth.usersテーブルでの重複: ${exists ? 'あり' : 'なし'}`);

    // どちらかのテーブルで重複が見つかった場合はtrueを返す
    return (data && data.length > 0) || exists;
  } catch (error) {
    console.error('メールアドレス重複チェックエラー:', error);
    throw error;
  }
}

// サブアカウントを作成する関数
export async function createSubAccount(formData: SubAccountFormData): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // 入力値のバリデーション
    if (!formData.email || typeof formData.email !== 'string' || formData.email.trim() === '') {
      throw new Error('メールアドレスは必須です');
    }

    if (!formData.role || typeof formData.role !== 'string' || formData.role.trim() === '') {
      throw new Error('ロールは必須です');
    }

    if (!formData.permissions || typeof formData.permissions !== 'object') {
      throw new Error('権限設定は必須です');
    }

    // メールアドレスの重複チェック
    const emailExists = await checkEmailExists(formData.email);
    if (emailExists) {
      return { success: false, error: 'このメールアドレスは既に使用されています' };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: '認証エラー' };
    }

    // 代理店情報を取得
    const { data: agencyProfile } = await supabase
      .from('profiles')
      .select('company_name')
      .eq('id', user.id)
      .single();

    const companyName = agencyProfile?.company_name || '代理店';

    // ランダムなパスワードを生成
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

    try {
      // 先に認証システムでユーザーを作成
      const result = await adminApi.createUser({
        email: formData.email.toLowerCase(),
        password: tempPassword,
        role: 'agency_subaccount',
        agency_id: user.id,
        agency_role: formData.role
      });

      if (!result.success) {
        console.error('ユーザー作成エラー:', result.error);
        throw new Error(result.error || 'ユーザー作成に失敗しました');
      }

      // 認証ユーザー作成成功後、サブアカウントテーブルにデータを挿入
      const { data: newSubAccount, error: createError } = await supabase
        .from('agency_subaccounts')
        .insert([{
          agency_id: user.id,
          email: formData.email.toLowerCase(),
          contact_name: formData.contact_name,
          phone: formData.phone,
          role: formData.role,
          permissions: formData.permissions,
          status: formData.status
        }])
        .select();

      if (createError) {
        return { success: false, error: createError.message };
      }

      await logActivity(user.id, 'subaccount_created', {
        message: `新規サブアカウント「${formData.email}」を登録しました`,
        subaccount_id: newSubAccount?.[0]?.id
      });

      // パスワードリセットリンクを生成
      const resetResult = await adminApi.resetPassword(
        formData.email.toLowerCase(),
        `${window.location.origin}/reset-password`
      );

      if (!resetResult.success) {
        console.error('パスワードリセットリンク生成エラー:', resetResult.error);
        // パスワードリセットリンクの生成に失敗しても、ユーザー作成自体は成功とする
      }

      // Supabaseが生成したリカバリーリンクを取得
      const recoveryLink = resetResult.success && resetResult.data?.properties?.action_link;
      console.log('リカバリーリンク:', recoveryLink);
      
      // メール送信処理
      const baseUrl = window.location.origin;
      
      const emailHtml = getSubAccountCreationEmailTemplate({
        companyName: formData.company_name,
        email: formData.email,
        role: 'agency',
        baseUrl,
        actionLink: recoveryLink
      });

      const emailText = getSubAccountCreationEmailText({
        companyName: formData.company_name,
        email: formData.email,
        role: 'agency',
        baseUrl,
        actionLink: recoveryLink
      });

      try {
        const emailResult = await sendEmailWithRetry({
          to: formData.email.toLowerCase(),
          subject: '[スカウトツール] サブアカウントが作成されました',
          html: emailHtml,
          text: emailText,
          from: 'スカウトツール <noreply@example.com>'
        });
          
        if (!emailResult.success) {
          console.error('メール送信エラー:', emailResult.error);
          // メール送信に失敗しても、ユーザー作成自体は成功とする
        }
      } catch (emailError) {
        console.error('メール送信エラー:', emailError);
        // メール送信に失敗しても、ユーザー作成自体は成功とする
      }

      return { 
        success: true, 
        data: { 
          subAccount: newSubAccount?.[0],
          user: result.data,
          emailSent: true
        }
      };
    } catch (error) {
      console.error('サブアカウント作成エラー:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '不明なエラーが発生しました' 
      };
    }
  } catch (error) {
    console.error('サブアカウント作成エラー:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '不明なエラーが発生しました' 
    };
  }
}

// サブアカウントを更新する関数
export async function updateSubAccount(id: string, formData: SubAccountFormData): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // 入力値のバリデーション
    if (!formData.email || typeof formData.email !== 'string' || formData.email.trim() === '') {
      return { success: false, error: 'メールアドレスは必須です' };
    }

    if (!formData.role || typeof formData.role !== 'string' || formData.role.trim() === '') {
      return { success: false, error: 'ロールは必須です' };
    }

    if (!formData.permissions || typeof formData.permissions !== 'object') {
      return { success: false, error: '権限設定は必須です' };
    }

    // メールアドレスの重複チェック
    const emailExists = await checkEmailExists(formData.email, id);
    if (emailExists) {
      return { success: false, error: 'このメールアドレスは既に使用されています' };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: '認証エラー' };
    }

    // サブアカウントを更新
    const { error: updateError } = await supabase
      .from('agency_subaccounts')
      .update({
        email: formData.email,
        contact_name: formData.contact_name,
        phone: formData.phone,
        role: formData.role,
        permissions: formData.permissions,
        status: formData.status
      })
      .eq('id', id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    await logActivity(user.id, 'subaccount_updated', {
      message: `サブアカウント「${formData.email}」を更新しました`,
      subaccount_id: id
    });

    return { success: true };
  } catch (error) {
    console.error('サブアカウント更新エラー:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '不明なエラーが発生しました' 
    };
  }
}

// パスワードリセットリンクを送信する関数
export async function sendPasswordResetLink(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    // メールアドレスのバリデーション
    if (!email || typeof email !== 'string' || email.trim() === '') {
      return { success: false, error: 'メールアドレスは必須です' };
    }

    // Edge Functionを使用してパスワードリセットリンクを生成
    const resetResult = await adminApi.resetPassword(
      email,
      `${window.location.origin}/reset-password`
    );

    if (!resetResult.success) {
      return { success: false, error: resetResult.error || 'パスワードリセットリンクの送信に失敗しました' };
    }

    return { success: true };
  } catch (error) {
    console.error('パスワードリセットエラー:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'パスワードリセットリンクの送信に失敗しました' 
    };
  }
}
