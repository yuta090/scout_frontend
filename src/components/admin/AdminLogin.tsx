import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // 初期化時にセッションをチェック
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('初期セッションチェック:', session ? 'セッションあり' : 'セッションなし');
        
        if (session) {
          // プロフィールの取得
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          console.log('初期プロフィールチェック:', profile, profileError);
          
          if (!profileError && profile?.role === 'admin') {
            console.log('管理者セッション検出、ダッシュボードへリダイレクト');
            navigate('/admin/dashboard');
          }
        }
      } catch (err) {
        console.error('初期セッションチェックエラー:', err);
      }
    };
    
    checkSession();
  }, [navigate]);

  // 管理者ログイン処理
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    setDebugInfo(null);

    try {
      console.log('ログイン試行:', email);
      
      // Supabaseでログイン
      const { data: { session, user }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('ログインエラー:', signInError);
        setDebugInfo({ type: 'signInError', error: signInError });
        throw signInError;
      }
      
      if (!session || !user) {
        console.error('セッションまたはユーザーの取得に失敗');
        setDebugInfo({ type: 'noSession', session, user });
        throw new Error('セッションの取得に失敗しました');
      }

      console.log('ログイン成功、ユーザー情報:', {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata
      });

      // 管理者権限の確認
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('プロフィール取得エラー:', profileError);
        setDebugInfo({ type: 'profileError', error: profileError });
        throw profileError;
      }

      console.log('ユーザープロフィール:', profile);

      // 管理者権限がない場合はエラー
      if (profile.role !== 'admin') {
        console.error('管理者権限なし:', profile.role);
        setDebugInfo({ type: 'notAdmin', role: profile.role });
        await supabase.auth.signOut();
        throw new Error(`管理者権限がありません（現在のロール: ${profile.role}）`);
      }

      // 管理者ダッシュボードへリダイレクト
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : '認証に失敗しました');
      
      // エラーの詳細をログに出力
      if (err instanceof Error) {
        console.error('エラー詳細:', {
          name: err.name,
          message: err.message,
          stack: err.stack
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-100 p-3 rounded-full">
            <Shield className="w-8 h-8 text-indigo-600" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          管理者ログイン
        </h2>
        <p className="text-center text-gray-600 mb-6">
          管理者専用のポータルです
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="admin@example.com"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              パスワード
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-12"
                placeholder="••••••••"
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? '処理中...' : 'ログイン'}
          </button>

          <div className="text-center">
            <a
              href="/"
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              ユーザーログインに戻る
            </a>
          </div>
        </form>

        {debugInfo && (
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-2">デバッグ情報:</h3>
            <pre className="text-xs overflow-auto max-h-40 bg-gray-100 p-2 rounded">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;