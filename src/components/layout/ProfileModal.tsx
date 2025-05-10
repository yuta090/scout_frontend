import React, { useState, useEffect } from 'react';
import { X, Lock, ArrowRight } from 'lucide-react';
import { supabase, type Profile } from '../../lib/supabase';

interface ProfileModalProps { 
  isOpen: boolean; 
  onClose: () => void; 
  profile: Profile | null;
  onProfileUpdate: (updatedProfile: Partial<Profile>) => Promise<void>;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ 
  isOpen, 
  onClose, 
  profile, 
  onProfileUpdate 
}) => {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    phone: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isResetPasswordLoading, setIsResetPasswordLoading] = useState(false);

  // プロフィールが変更されたときにフォームデータを更新
  useEffect(() => {
    if (profile) {
      setFormData({
        companyName: profile.company_name || '',
        contactName: profile.contact_name || '',
        phone: profile.phone || ''
      });
    }
  }, [profile]);

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setFormData({
        companyName: profile.company_name || '',
        contactName: profile.contact_name || '',
        phone: profile.phone || ''
      });
    }
  };

  const handleSubmit = async () => {
    if (!profile || !formData.companyName.trim()) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await onProfileUpdate({
        company_name: formData.companyName.trim(),
        contact_name: formData.contactName.trim(),
        phone: formData.phone.trim()
      });
      setIsEditing(false);
      setSuccessMessage('プロフィールを更新しました');
      
      // 3秒後に成功メッセージを消す
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('プロフィールの更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!profile?.email) return;
    
    setIsResetPasswordLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) throw error;
      
      setSuccessMessage('パスワードリセット用のメールを送信しました。メールをご確認ください。');
      
      // 5秒後に成功メッセージを消す
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      console.error('Error sending password reset:', err);
      setError('パスワードリセットメールの送信に失敗しました');
    } finally {
      setIsResetPasswordLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            プロフィール設定
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            type="button"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-600 rounded-md text-sm">
              {successMessage}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス
            </label>
            <input
              type="email"
              id="email"
              value={profile?.email || ''}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
          </div>

          <div>
            <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 mb-1">
              会社名
            </label>
            {isEditing ? (
              <input
                type="text"
                id="company-name"
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="会社名を入力"
              />
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-gray-900">
                  {profile?.company_name || '未設定'}
                </span>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  type="button"
                >
                  編集
                </button>
              </div>
            )}
          </div>

          {isEditing && (
            <>
              <div>
                <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1">
                  担当者名
                </label>
                <input
                  type="text"
                  id="contact-name"
                  value={formData.contactName}
                  onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="担当者名を入力"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  電話番号
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="電話番号を入力"
                />
              </div>
            </>
          )}
          
          {/* パスワードリセットセクション */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Lock className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-700">パスワード</span>
              </div>
              <button
                onClick={handleResetPassword}
                disabled={isResetPasswordLoading}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 border border-transparent rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                type="button"
              >
                {isResetPasswordLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    送信中...
                  </span>
                ) : (
                  <>
                    パスワードを変更
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </>
                )}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              パスワードを変更するには、登録メールアドレスにリセットリンクを送信します
            </p>
          </div>
        </div>

        {isEditing && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-4">
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              type="button"
            >
              キャンセル
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !formData.companyName.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
              type="button"
            >
              {isLoading ? '更新中...' : '更新'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;