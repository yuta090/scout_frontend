import React, { useState, useEffect } from 'react';
import { X, Building2, User, Mail, Phone, Key } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { logActivity } from '../../lib/supabase';
import { adminApi } from '../../lib/supabase/admin';
import { sendEmailViaSupabase, getSubAccountCreationEmailTemplate, getSubAccountCreationEmailText } from '../../lib/email';

interface AdminAgencyFormProps {
  agency?: any;
  onClose: () => void;
  onSuccess: () => void;
}

const AdminAgencyForm: React.FC<AdminAgencyFormProps> = ({ agency, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    company_name: '',
    contact_name: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (agency) {
      setFormData({
        email: agency.email || '',
        password: '', // 既存ユーザーの場合はパスワードフィールドは空
        company_name: agency.company_name || '',
        contact_name: agency.contact_name || '',
        phone: agency.phone || ''
      });
    }
  }, [agency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // 管理者のIDを取得
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('認証エラー');

      if (agency) {
        // 既存代理店の更新
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            company_name: formData.company_name,
            contact_name: formData.contact_name,
            phone: formData.phone
          })
          .eq('id', agency.id);

        if (updateError) throw updateError;

        // パスワードが入力されている場合は更新
        if (formData.password) {
          const { error: passwordError } = await supabase.auth.admin.updateUserById(
            agency.id,
            { password: formData.password }
          );
          if (passwordError) throw passwordError;
        }

        // アクティビティログを記録
        await logActivity(user.id, 'agency_updated', {
          message: `代理店「${formData.company_name}」を更新しました`,
          agency_id: agency.id
        });
      } else {
        // 新規代理店の作成
        console.log('Creating new agency with data:', {
          email: formData.email,
          password: '********', // パスワードは表示しない
          metadata: {
            role: 'agency',
            company_name: formData.company_name,
            contact_name: formData.contact_name,
            phone: formData.phone
          }
        });

        const { data: { user: newUser }, error: signUpError } = await supabase.auth.admin.createUser({
          email: formData.email,
          password: formData.password,
          email_confirm: true,
          user_metadata: {
            role: 'agency',
            company_name: formData.company_name,
            contact_name: formData.contact_name,
            phone: formData.phone
          }
        });

        if (signUpError) {
          console.error('Error creating user:', signUpError);
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
            role: 'agency',
            email: formData.email,
            company_name: formData.company_name,
            contact_name: formData.contact_name,
            phone: formData.phone
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
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {agency ? '代理店情報の編集' : '新規代理店登録'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス {!agency && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="example@company.com"
                  required={!agency}
                  disabled={!!agency} // 既存ユーザーの場合はメールアドレスを変更不可
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                パスワード {!agency && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={agency ? "変更する場合のみ入力" : "パスワード"}
                  required={!agency}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {agency && (
                <p className="mt-1 text-xs text-gray-500">
                  パスワードを変更しない場合は空のままにしてください
                </p>
              )}
            </div>

            <div>
              <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
                会社名 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="株式会社〇〇"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="contact_name" className="block text-sm font-medium text-gray-700 mb-1">
                担当者名
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="contact_name"
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="山田 太郎"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                電話番号
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="03-1234-5678"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '保存中...' : (agency ? '更新' : '登録')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAgencyForm;