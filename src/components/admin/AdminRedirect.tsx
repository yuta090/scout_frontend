import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const AdminRedirect: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        console.log('管理者リダイレクト処理開始');
        
        // セッションの取得
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log('セッションなし、ログイン画面へリダイレクト');
          navigate('/admin/login');
          return;
        }

        console.log('セッション取得成功、ユーザーID:', session.user.id);

        // プロフィールの取得
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('プロフィール取得エラー:', profileError);
          setError('プロフィールの取得に失敗しました');
          navigate('/admin/login');
          return;
        }

        console.log('ユーザーロール:', profile?.role);

        if (profile?.role === 'admin') {
          // 管理者の場合はダッシュボードへリダイレクト
          navigate('/admin/dashboard');
        } else {
          // 管理者でない場合は管理者ログインページへリダイレクト
          console.log('管理者権限なし、ログイン画面へリダイレクト');
          navigate('/admin/login');
        }
      } catch (error) {
        console.error('Admin check error:', error);
        setError('認証エラーが発生しました');
        navigate('/admin/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  // この部分は実際には実行されないはずだが、コンポーネントの戻り値として必要
  return null;
};

export default AdminRedirect;