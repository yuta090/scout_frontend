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
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    console.log('ResetPassword: コンポーネントがマウントされました');
    console.log('現在のURL:', window.location.href);
    
    // URLからアクセストークンを取得（複数のパターンをチェック）
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    
    // 可能性のあるすべてのパラメータ名をチェック
    let token = searchParams.get('access_token') || 
               hashParams.get('access_token') || 
               searchParams.get('token') || 
               hashParams.get('token') ||
               searchParams.get('t') ||
               hashParams.get('t') ||
               searchParams.get('type') === 'recovery_code' && searchParams.get('code') ||
               hashParams.get('type') === 'recovery_code' && hashParams.get('code');
               
    // #access_token=xxx 形式に対応
    if (!token && window.location.hash && window.location.hash.includes('access_token=')) {
      const rawHash = window.location.hash.substring(1); // #を除去
      const tokenMatch = rawHash.match(/access_token=([^&]*)/);
      if (tokenMatch && tokenMatch[1]) {
        token = tokenMatch[1];
        console.log('ハッシュから直接トークンを抽出しました');
      }
    }
    
    // type=recovery 形式の場合はSupabaseのJSライブラリからトークンを取得
    if (!token && (searchParams.get('type') === 'recovery' || hashParams.get('type') === 'recovery')) {
      console.log('recovery typeのURLを検出、Supabaseからトークンを取得します');
      
      // Supabaseの自動処理を利用
      supabase.auth.onAuthStateChange((event, session) => {
        console.log('認証状態変更イベント:', event);
        if (event === 'PASSWORD_RECOVERY' && session) {
          console.log('パスワードリカバリーセッションを検出');
          setAccessToken(session.access_token);
        }
      });
    }
    
    console.log('検出されたパラメータ:', {
      search: Object.fromEntries(searchParams.entries()),
      hash: Object.fromEntries(hashParams.entries()),
      rawHash: window.location.hash
    });
    
    if (token) {
      console.log('ResetPassword: アクセストークンを取得しました (長さ:', token.length, ')');
      setAccessToken(token);
      
      // Supabaseクライアントにセッションを設定
      supabase.auth.setSession({
        access_token: token,
        refresh_token: '',
      }).then(({ data, error }) => {
        if (error) {
          console.error('ResetPassword: セッション設定エラー:', error);
          setError('セッションの設定に失敗しました。パスワードリセットリンクが無効または期限切れの可能性があります。');
          setDebugInfo({ type: 'session_error', error });
        } else {
          console.log('ResetPassword: セッション設定成功:', data);
          setDebugInfo({ type: 'session_success', session: data.session ? true : false });
        }
      });
    } else {
      console.error('ResetPassword: アクセストークンが見つかりません');
      setError('パスワードリセットリンクが無効です。メールに記載されたリンクを正しくクリックしてください。');
      setDebugInfo({ 
        type: 'no_token', 
        search: window.location.search,
        hash: window.location.hash,
        url: window.location.href
      });
    }

    // コンポーネントのクリーンアップ
    return () => {
      setAccessToken(null);
      setError(null);
      setDebugInfo(null);
    };
  }, []);

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
      console.log('ResetPassword: パスワード更新を開始します');
      
      if (!accessToken) {
        throw new Error('アクセストークンがありません。再度パスワードリセットリンクを取得してください。');
      }

      // セッションの状態を確認
      const { data: { session } } = await supabase.auth.getSession();
      console.log('ResetPassword: 現在のセッション状態:', session ? '有効' : '無効');

      if (!session) {
        console.log('ResetPassword: セッションがないため、再設定します');
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: '',
        });

        if (sessionError) {
          throw new Error('セッションの再設定に失敗しました。パスワードリセットリンクが期限切れの可能性があります。');
        }
      }

      // パスワードの更新
      console.log('ResetPassword: パスワード更新APIを呼び出します');
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        console.error('ResetPassword: パスワード更新エラー:', updateError);
        setDebugInfo({ type: 'update_error', error: updateError });
        throw updateError;
      }

      console.log('ResetPassword: パスワード更新に成功しました');
      setDebugInfo({ type: 'update_success' });
      setSuccess(true);
      
      // 3秒後にログインページにリダイレクト
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 3000);
    } catch (err) {
      console.error('ResetPassword: パスワード更新エラー:', err);
      setError(err instanceof Error ? err.message : 'パスワードの更新に失敗しました。もう一度お試しください。');
      setDebugInfo({ 
        type: 'error', 
        error: err instanceof Error ? { 
          message: err.message, 
          name: err.name, 
          stack: err.stack 
        } : String(err) 
      });
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

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center">
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md">
              パスワードが正常に更新されました。
              ログイン画面に移動します...
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
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
                    disabled={isLoading || !accessToken}
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
                    disabled={isLoading || !accessToken}
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

            {/* 開発環境でのみデバッグ情報を表示 */}
            {process.env.NODE_ENV === 'development' && debugInfo && (
              <div className="mt-4 border border-gray-300 rounded-md p-4 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-700 mb-2">デバッグ情報:</h4>
                <pre className="text-xs overflow-auto max-h-48 bg-gray-100 p-2 rounded">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
                <div className="mt-2 text-xs text-gray-500">
                  <p>URLパラメータ: {window.location.search}</p>
                  <p>URLハッシュ: {window.location.hash}</p>
                  <p>リンクが正しくない場合は、パスワードリセットメールを再度リクエストしてください。</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                isLoading || !accessToken
                  ? 'bg-indigo-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
              disabled={isLoading || !accessToken}
            >
              {isLoading ? 'パスワード更新中...' : 'パスワードを更新する'}
            </button>

            {!accessToken && (
              <div className="text-center mt-4">
                <a 
                  href="/" 
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  ログイン画面に戻る
                </a>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;