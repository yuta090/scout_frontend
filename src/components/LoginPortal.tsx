import React, { useState, useEffect } from 'react';
import { DivideIcon as LucideIcon, Eye, EyeOff, ArrowLeft, Building2, User, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase, createUser, checkUserRole } from '../lib/supabase';

interface LoginPortalProps {
  type: 'agency' | 'client';
  title: string;
  description: string;
  icon: LucideIcon;
}

interface RegistrationData {
  email: string;
  password: string;
  company_name: string;
  contact_name: string;
  phone: string;
}

const LoginPortal: React.FC<LoginPortalProps> = ({ type, title, description, icon: Icon }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegistrationData>({
    email: '',
    password: '',
    company_name: '',
    contact_name: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const userRole = await checkUserRole(session.user.id);
          if (userRole === type) {
            navigate(`/${type}/dashboard`, { replace: true });
          }
        }
      } catch (err) {
        console.error('Session check error:', err);
      }
    };
    checkSession();
  }, [navigate, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        if (type === 'agency' && (!formData.company_name.trim() || !formData.contact_name.trim() || !formData.phone.trim())) {
          throw new Error('会社名、担当者名、電話番号は必須項目です');
        }

        const { session } = await createUser(
          formData.email,
          formData.password,
          type,
          {
            company_name: formData.company_name,
            contact_name: formData.contact_name,
            phone: formData.phone
          }
        );

        if (session) {
          navigate(`/${type}/dashboard`, { replace: true });
        }
      } else {
        const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) {
          if (signInError.message === 'Invalid login credentials') {
            throw new Error('メールアドレスまたはパスワードが正しくありません');
          }
          throw signInError;
        }

        if (session?.user) {
          const userRole = await checkUserRole(session.user.id);
          
          if (!userRole) {
            throw new Error('ユーザープロフィールが見つかりません');
          }

          if (userRole !== type) {
            await supabase.auth.signOut();
            throw new Error('アクセス権限がありません。正しいポータルからログインしてください。');
          }

          navigate(`/${type}/dashboard`, { replace: true });
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
      const message = err instanceof Error ? err.message : '認証エラーが発生しました';
      
      if (message.includes('Email not confirmed')) {
        setError('メールアドレスの確認が必要です。メールをご確認ください。');
      } else if (message.includes('Invalid login credentials')) {
        setError('メールアドレスまたはパスワードが正しくありません。');
      } else if (message.includes('User already registered')) {
        setError('このメールアドレスは既に登録されています。ログインしてください。');
        setIsSignUp(false);
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      setError('パスワードリセットにはメールアドレスの入力が必要です。');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        formData.email,
        {
          redirectTo: `${window.location.origin}/reset-password`
        }
      );

      if (resetError) throw resetError;
      setError('パスワードリセットのメールを送信しました。メールに記載されたリンクから新しいパスワードを設定してください。');
    } catch (err) {
      console.error('Password reset error:', err);
      setError('パスワードリセットに失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-8 transition-all duration-300 hover:shadow-2xl">
      <div className="flex items-center justify-center mb-6">
        <div className="bg-indigo-100 p-3 rounded-full">
          <Icon className="w-8 h-8 text-indigo-600" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
        {isResetMode ? 'パスワードリセット' : title}
      </h2>
      <p className="text-center text-gray-600 mb-6">
        {isResetMode ? 'パスワードリセット用のメールを送信します' : description}
      </p>

      {error && (
        <div className={`mb-4 p-3 rounded-md text-sm ${
          error.includes('送信しました') || error.includes('作成されました')
            ? 'bg-green-50 border border-green-200 text-green-600'
            : 'bg-red-50 border border-red-200 text-red-600'
        }`}>
          {error}
        </div>
      )}

      <form onSubmit={isResetMode ? handlePasswordReset : handleSubmit} className="space-y-4">
        <div>
          <label htmlFor={`${type}-email`} className="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス
          </label>
          <input
            id={`${type}-email`}
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="example@company.com"
            disabled={isLoading}
          />
        </div>

        {!isResetMode && (
          <div>
            <label htmlFor={`${type}-password`} className="block text-sm font-medium text-gray-700 mb-1">
              パスワード
            </label>
            <div className="relative">
              <input
                id={`${type}-password`}
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-12"
                placeholder="••••••••"
                minLength={6}
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
        )}

        {isSignUp && type === 'agency' && (
          <div className="space-y-4 border-t border-gray-200 pt-4">
            <div>
              <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 mb-1">
                会社名 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="company-name"
                  type="text"
                  required
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="株式会社〇〇"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1">
                担当者名 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="山田 太郎"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                電話番号 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="03-1234-5678"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isLoading ? '処理中...' : (isResetMode ? 'パスワードリセット用メールを送信' : (isSignUp ? '新規登録' : 'ログイン'))}
        </button>

        <div className="text-center space-y-2">
          {isResetMode ? (
            <button
              type="button"
              onClick={() => {
                setIsResetMode(false);
                setError(null);
              }}
              className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              ログイン画面に戻る
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setFormData({
                    email: '',
                    password: '',
                    company_name: '',
                    contact_name: '',
                    phone: ''
                  });
                }}
                className="text-sm text-indigo-600 hover:text-indigo-800"
                disabled={isLoading}
              >
                {isSignUp ? 'アカウントをお持ちの方はこちら' : '新規登録はこちら'}
              </button>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={() => {
                    setIsResetMode(true);
                    setError(null);
                    setFormData({
                      email: '',
                      password: '',
                      company_name: '',
                      contact_name: '',
                      phone: ''
                    });
                  }}
                  className="block w-full text-sm text-indigo-600 hover:text-indigo-800"
                  disabled={isLoading}
                >
                  パスワードをお忘れの方はこちら
                </button>
              )}
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginPortal;