import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Settings, LogOut, Users } from 'lucide-react';
import { Profile } from '../../lib/supabase';

interface HeaderProps {
  profile: Profile | null;
  userType: 'agency' | 'client' | 'admin' | 'referral_agent';
  isMobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
  onProfileClick: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({
  profile,
  userType,
  isMobileMenuOpen,
  onMobileMenuToggle,
  onProfileClick,
  onLogout
}) => {
  // ユーザータイプに応じたテキストを取得
  const getUserTypeText = (type: string) => {
    switch (type) {
      case 'agency':
        return '代理店';
      case 'client':
        return 'クライアント';
      case 'admin':
        return '管理者';
      case 'referral_agent':
        return '取次代理店';
      default:
        return '';
    }
  };

  // ダッシュボードへのリンク先を取得
  const getDashboardLink = (type: string) => {
    switch (type) {
      case 'agency':
        return '/agency/dashboard';
      case 'client':
        return '/client/dashboard';
      case 'admin':
        return '/admin/dashboard';
      case 'referral_agent':
        return '/referral-dashboard';
      default:
        return '/';
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to={getDashboardLink(userType)} className="flex items-center space-x-3 group">
            <img src="https://recruithp.jp/src/hraim_favicon.webp" alt="HRaim" className="h-8 w-8 transition-transform group-hover:scale-110" />
            <div className="transition-colors group-hover:text-indigo-600">
              <h1 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600">
                {profile?.company_name || 'ダッシュボード'}
              </h1>
              <p className="text-sm text-gray-500 group-hover:text-indigo-400">
                {getUserTypeText(userType)}アカウント
              </p>
            </div>
          </Link>
          
          {/* モバイルメニューボタン */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={onMobileMenuToggle}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* デスクトップメニュー */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {userType === 'agency' && (
              <Link
                to="/agency/subaccounts"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Users className="h-4 w-4 mr-2" />
                サブアカウント管理
              </Link>
            )}
            <button
              onClick={onProfileClick}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              type="button"
            >
              <Settings className="h-4 w-4 mr-2" />
              プロフィール設定
            </button>
            <button
              onClick={onLogout}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              type="button"
            >
              <LogOut className="h-4 w-4 mr-2" />
              ログアウト
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;