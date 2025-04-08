import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, Lock } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    
    if (!accessToken) {
      navigate('/', { replace: true });
      return;
    }

    // Set the access token in the Supabase client
    supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: '',
    });
  }, [navigate]);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'パスワードは8文字以上である必要があります';
    }
    if (!/[A-Z]/.test(password)) {
      return '大文字を含める必要があります';
    }
    if (!/[a-z]/.test(password)) {
      return '小文字を含める必要があります';
    }
    if (!/[0-9]/.test(password)) {
      return '数字を含める必要があります';
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return '特殊文字(!@#$%^&*)を含める必要があります';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    // パスワードの検証
    const validationError = validatePassword(newPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      setSuccess(true);
      // 3秒後にログインページにリダイレクト
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 3000);
    } catch (err) {
      console.error('Password update error:', err);
      setError('パスワードの更新に失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-100 p-3 rounded-full">
            <Lock className="w-8 h-8 text-indigo-600" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          新しいパスワードの設定
        </h2>
        <p className="text-center text-gray-600 mb-6">
          安全なパスワードを設定してください
        </p>

        {success ? (
          <div className="text-center">
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md">
              パスワードが正常に更新されました。
              ログイン画面に移動します...
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                  新しいパスワード
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-12"
                    required
                    minLength={8}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                  パスワードの確認
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                    minLength={8}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-blue-800 mb-2">パスワード要件:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 8文字以上</li>
                <li>• 大文字を含む</li>
                <li>• 小文字を含む</li>
                <li>• 数字を含む</li>
                <li>• 特殊文字(!@#$%^&*)を含む</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? '処理中...' : 'パスワードを更新'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;