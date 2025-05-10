import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface ReferralProtectedRouteProps {
  children: React.ReactNode;
}

const ReferralProtectedRoute: React.FC<ReferralProtectedRouteProps> = ({ children }) => {
  const [isReferralAgent, setIsReferralAgent] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkReferralAgentStatus = async () => {
      try {
        console.log('取次代理店権限チェック開始');
        
        // セッションの取得
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log('セッションなし、ログイン画面へリダイレクト');
          setIsReferralAgent(false);
          setIsLoading(false);
          return;
        }

        console.log('セッション取得成功、ユーザーID:', session.user.id);

        // プロフィールの取得
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('プロフィール取得エラー:', error);
          setError('プロフィールの取得に失敗しました');
          setIsReferralAgent(false);
        } else {
          console.log('ユーザーロール:', profile?.role);
          setIsReferralAgent(profile?.role === 'referral_agent');
        }
      } catch (error) {
        console.error('Referral agent check error:', error);
        setError('認証エラーが発生しました');
        setIsReferralAgent(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkReferralAgentStatus();
  }, []);

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

  if (!isReferralAgent) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ReferralProtectedRoute;