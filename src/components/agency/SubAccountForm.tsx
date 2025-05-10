import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { logActivity } from '../../lib/supabase/activityLog';
import { adminApi } from '../../lib/supabase/admin';
import { sendEmailViaSupabase, getSubAccountCreationEmailTemplate, getSubAccountCreationEmailText } from '../../lib/email';
import SubAccountFormHeader from './subaccount/SubAccountFormHeader';
import SubAccountFormBasicInfo from './subaccount/SubAccountFormBasicInfo';
import SubAccountFormPermissions from './subaccount/SubAccountFormPermissions';
import SubAccountFormPasswordReset from './subaccount/SubAccountFormPasswordReset';
import SubAccountFormFooter from './subaccount/SubAccountFormFooter';

interface SubAccount {
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
  created_at: string;
  updated_at: string;
}

interface SubAccountFormProps {
  subAccount?: SubAccount;
  onClose: () => void;
  onSuccess: () => void;
}

// 初期フォームデータ
const initialFormData = {
  email: '',
  contact_name: '',
  phone: '',
  role: 'staff' as 'admin' | 'staff' | 'accounting' | 'readonly',
  status: 'active' as 'active' | 'inactive' | 'pending',
  permissions: {
    customers: { view: true, create: true, edit: true, delete: false },
    campaigns: { view: true, create: true, edit: true, delete: false },
    reports: { view: true },
    billing: { 
      view: false,
      view_all_customers: false 
    },
    view_all_campaigns: false
  }
};

const SubAccountForm: React.FC<SubAccountFormProps> = ({ 
  subAccount, 
  onClose, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [sendingResetLink, setSendingResetLink] = useState(false);
  const [resetLinkSent, setResetLinkSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // 編集時のデータ読み込み
  useEffect(() => {
    if (subAccount) {
      const billingPermissions = {
        view: subAccount.permissions.billing.view || false,
        view_all_customers: subAccount.permissions.billing.view_all_customers || false
      };

      setFormData({
        email: subAccount.email,
        contact_name: subAccount.contact_name || '',
        phone: subAccount.phone || '',
        role: subAccount.role,
        status: subAccount.status,
        permissions: {
          ...subAccount.permissions,
          billing: billingPermissions
        }
      });
    }
  }, [subAccount]);

  // ロールに応じた権限の自動設定
  useEffect(() => {
    if (formData.role === 'admin') {
      setFormData(prev => ({
        ...prev,
        permissions: {
          customers: { view: true, create: true, edit: true, delete: true },
          campaigns: { view: true, create: true, edit: true, delete: true },
          reports: { view: true },
          billing: { 
            view: true,
            view_all_customers: true 
          },
          view_all_campaigns: true
        }
      }));
    } else if (formData.role === 'accounting') {
      setFormData(prev => ({
        ...prev,
        permissions: {
          customers: { view: true, create: false, edit: false, delete: false },
          campaigns: { view: true, create: false, edit: false, delete: false },
          reports: { view: true },
          billing: { 
            view: true,
            view_all_customers: true 
          },
          view_all_campaigns: true
        }
      }));
    } else if (formData.role === 'readonly') {
      setFormData(prev => ({
        ...prev,
        permissions: {
          customers: { view: true, create: false, edit: false, delete: false },
          campaigns: { view: true, create: false, edit: false, delete: false },
          reports: { view: true },
          billing: { 
            view: false,
            view_all_customers: false 
          },
          view_all_campaigns: false
        }
      }));
    }
  }, [formData.role]);

  // メールアドレスの重複チェックを行う関数
  const checkEmailExists = async (email: string, currentId?: string): Promise<boolean> => {
    if (!email) return false;

    try {
      console.log(`メールアドレス重複チェック開始: ${email}, 現在のID: ${currentId || 'なし'}`);
      
      // サブアカウントテーブルでの重複チェック
      const { data, error } = await supabase
        .from('agency_subaccounts')
        .select('id')
        .eq('email', email.toLowerCase());

      if (error) {
        console.error('メールアドレス重複チェックエラー (agency_subaccounts):', error);
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
        throw new Error(`認証テーブルの重複チェックエラー: ${authError}`);
      }

      console.log(`auth.usersテーブルでの重複: ${exists ? 'あり' : 'なし'}`);

      // どちらかのテーブルで重複が見つかった場合はtrueを返す
      const result = existsInSubaccounts || exists;
      console.log(`最終的な重複チェック結果: ${result ? '重複あり' : '重複なし'}`);
      
      return result;
    } catch (error) {
      console.error('メールアドレス重複チェックエラー:', error);
      throw error;
    }
  };

  // フォーム送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    // フォームデータのバリデーション
    if (!formData.email || typeof formData.email !== 'string' || formData.email.trim() === '') {
      setError('メールアドレスは必須です');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    setSendingEmail(false);
    setDebugInfo(null);

    try {
      console.log('フォーム送信開始:', {
        email: formData.email,
        role: formData.role,
        isEditing: !!subAccount
      });

      // メールアドレスの重複チェック
      console.log('メールアドレス重複チェック開始');
      const emailExists = await checkEmailExists(formData.email, subAccount?.id);
      console.log('メールアドレス重複チェック結果:', emailExists);
      
      if (emailExists) {
        console.error('メールアドレス重複エラー:', formData.email);
        setDebugInfo({
          error: 'email_exists',
          email: formData.email,
          checkTime: new Date().toISOString()
        });
        throw new Error('このメールアドレスは既に使用されています');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('認証エラー');
      }

      // 代理店情報を取得
      const { data: agencyProfile } = await supabase
        .from('profiles')
        .select('company_name')
        .eq('id', user.id)
        .single();

      const companyName = agencyProfile?.company_name || '代理店';

      if (subAccount) {
        // 既存のサブアカウントを更新
        const { error: updateError } = await supabase
          .from('agency_subaccounts')
          .update({
            email: formData.email.toLowerCase(),
            contact_name: formData.contact_name,
            phone: formData.phone,
            role: formData.role,
            permissions: formData.permissions,
            status: formData.status
          })
          .eq('id', subAccount.id);

        if (updateError) throw updateError;

        await logActivity(user.id, 'subaccount_updated', {
          message: `サブアカウント「${formData.email}」を更新しました`,
          subaccount_id: subAccount.id
        });
      } else {
        // 新規サブアカウントを作成
        setSendingEmail(true);
        
        // ランダムなパスワードを生成
        const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

        console.log('新規サブアカウント作成開始:', {
          email: formData.email,
          role: formData.role
        });

        // 先に認証システムでユーザーを作成
        const { data: { user: newUser }, error: signUpError } = await supabase.auth.admin.createUser({
          email: formData.email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            role: 'agency_subaccount',
            agency_id: user.id,
            agency_role: formData.role
          }
        });

        if (signUpError) {
          console.error('Error creating user:', signUpError);
          setDebugInfo({ type: 'signUpError', error: signUpError });
          throw signUpError;
        }
        
        if (!newUser) {
          console.error('User creation returned null');
          throw new Error('ユーザー作成に失敗しました');
        }
        
        console.log('New user created:', newUser);

        // プロフィールが自動作成されない場合に備えて手動で作成
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .upsert([{
            id: newUser.id,
            role: 'agency_subaccount',
            email: formData.email,
            company_name: companyName,
            contact_name: formData.contact_name,
            phone: formData.phone,
            parent_id: user.id
          }])
          .select();

        if (profileError) {
          console.error('Error creating profile:', profileError);
          throw profileError;
        }
        
        console.log('New profile created:', newProfile);

        // パスワードリセットリンクを生成
        const resetResult = await adminApi.resetPassword(
          formData.email,
          `${window.location.origin}/reset-password`
        );

        let actionLink = null;
        if (resetResult.success && resetResult.data) {
          actionLink = resetResult.data.action_link;
          console.log('パスワードリセットリンク生成成功:', actionLink);
        } else {
          console.error('パスワードリセットリンク生成エラー:', resetResult.error);
        }

        // メール送信処理
        const baseUrl = window.location.origin;
        
        const emailHtml = getSubAccountCreationEmailTemplate({
          companyName: formData.company_name,
          email: formData.email,
          role: 'agency',
          baseUrl,
          actionLink
        });

        const emailText = getSubAccountCreationEmailText({
          companyName: formData.company_name,
          email: formData.email,
          role: 'agency',
          baseUrl,
          actionLink
        });

        try {
          const emailResult = await sendEmailViaSupabase({
            to: formData.email,
            subject: '[スカウトツール] アカウントが作成されました',
            html: emailHtml,
            text: emailText,
            from: 'スカウトツール <support@hraim.com>'
          });
          
          if (!emailResult.success) {
            console.error('メール送信エラー:', emailResult.error);
            // メール送信に失敗しても、ユーザー作成自体は成功とする
          }
        } catch (emailError) {
          console.error('メール送信エラー:', emailError);
          // メール送信に失敗しても、ユーザー作成自体は成功とする
        }

        // アクティビティログを記録
        await logActivity(user.id, 'agency_created', {
          message: `新規代理店「${formData.company_name}」を登録しました`,
          agency_id: newUser.id
        });
      }

      onSuccess();
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err instanceof Error ? err.message : '保存に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <SubAccountFormHeader 
          title={subAccount ? 'サブアカウント情報の編集' : '新規サブアカウント登録'}
          onClose={onClose}
        />

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-600 rounded-md flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              {successMessage}
            </div>
          )}

          <SubAccountFormBasicInfo 
            formData={formData}
            setFormData={setFormData}
            isLoading={isLoading}
          />

          {subAccount && (
            <SubAccountFormPasswordReset 
              email={formData.email}
              onResetPassword={() => {}}
              sendingResetLink={false}
              resetLinkSent={false}
            />
          )}

          {formData.role === 'staff' && (
            <SubAccountFormPermissions 
              formData={formData}
              setFormData={setFormData}
            />
          )}

          <SubAccountFormFooter 
            onCancel={onClose}
            isLoading={isLoading}
            isEditing={!!subAccount}
          />
          
          {debugInfo && (
            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2">デバッグ情報:</h4>
              <pre className="text-xs overflow-auto max-h-40 bg-gray-100 p-2 rounded">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default SubAccountForm;
