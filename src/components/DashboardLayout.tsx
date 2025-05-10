import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, type Profile, checkAuth } from '../lib/supabase';
import Header from './layout/Header';
import MobileMenu from './layout/MobileMenu';
import MainContent from './layout/MainContent';
import ProfileModal from './layout/ProfileModal';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userType: 'agency' | 'client' | 'admin' | 'referral_agent';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, userType }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);

  // プロフィール取得関数をuseCallbackでメモ化
  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!navigator.onLine) {
        throw new Error('インターネット接続がありません。接続を確認してください。');
      }

      const authResult = await checkAuth();
      if (!authResult) {
        console.log('ユーザーが見つかりません、ログイン画面へリダイレクト');
        navigate('/');
        return;
      }

      const { profile: profileData } = authResult;
      
      if (!profileData) {
        throw new Error('プロフィールが見つかりません。アカウントの設定を確認してください。');
      }

      // ユーザータイプが一致するか確認（adminの場合は例外）
      if (userType !== 'admin' && profileData.role !== userType) {
        console.warn(`User role (${profileData.role}) doesn't match expected type (${userType})`);
        navigate('/');
        return;
      }

      setProfile(profileData);
    } catch (err) {
      console.error('Error fetching profile:', err);
      const errorMessage = err instanceof Error ? err.message : 'プロフィール情報の取得に失敗しました';
      setError(errorMessage);
      
      if (!isRetrying) {
        setIsRetrying(true);
        // 5秒後に再試行
        setTimeout(() => {
          setIsRetrying(false);
          fetchProfile();
        }, 5000);
      } else {
        navigate('/');
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate, userType, isRetrying]);

  // 初回マウント時にプロフィールを取得
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // オフライン/オンライン検知
  useEffect(() => {
    const handleOnline = () => {
      setError(null);
      fetchProfile();
    };

    const handleOffline = () => {
      setError('インターネット接続がありません。接続を確認してください。');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchProfile]);

  // ログアウト処理
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('ログアウトに失敗しました:', error);
    }
  };

  // プロフィール更新処理
  const handleProfileUpdate = async (updatedProfile: Partial<Profile>) => {
    if (!profile) return;

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updatedProfile)
        .eq('id', profile.id);

      if (updateError) throw updateError;

      // プロフィールを再取得して最新の状態を反映
      await fetchProfile();
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('プロフィールの更新に失敗しました');
    }
  };

  // エラー表示
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-xl font-bold text-center text-gray-900 mb-4">
            エラーが発生しました
          </h1>
          <p className="text-center text-gray-600 mb-6">
            {error}
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              ログイン画面に戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ローディング表示
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <Header 
        profile={profile}
        userType={userType}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onProfileClick={() => setIsProfileModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* モバイルメニュー */}
      <MobileMenu 
        isOpen={isMobileMenuOpen}
        userType={userType}
        onProfileClick={() => setIsProfileModalOpen(true)}
        onLogout={handleLogout}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* メインコンテンツ */}
      <MainContent>
        {children}
      </MainContent>

      {/* プロフィール設定モーダル */}
      <ProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  );
};

export default DashboardLayout;