import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, X, LogOut, LayoutDashboard, Users, Building2, 
  FileText, Settings, ChevronDown, ChevronUp, Shield 
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // コンポーネントがマウントされたときにデバッグ情報を出力
  React.useEffect(() => {
    console.log('AdminLayout: コンポーネントがマウントされました');
    
    // React Query クライアントが利用可能かチェック
    try {
      const reactQueryAvailable = !!window.__REACT_QUERY_GLOBAL__;
      console.log('AdminLayout: React Query クライアントの状態:', {
        available: reactQueryAvailable,
        globalObject: !!window.__REACT_QUERY_GLOBAL__,
      });
    } catch (err) {
      console.error('AdminLayout: React Query クライアントのチェックに失敗:', err);
    }
  }, []);

  const handleLogout = async () => {
    try {
      console.log('AdminLayout: ログアウト処理を開始します');
      await supabase.auth.signOut();
      console.log('AdminLayout: ログアウト成功、ログイン画面へリダイレクト');
      navigate('/admin/login');
    } catch (error) {
      console.error('AdminLayout: ログアウトに失敗しました:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <img src="https://recruithp.jp/src/hraim_favicon.webp" alt="HRaim" className="h-8 w-8" />
              <div>
                <h1 className="text-xl font-semibold text-white">
                  管理者ポータル
                </h1>
                <p className="text-xs text-blue-100">
                  マスター管理画面
                </p>
              </div>
            </div>
            
            {/* モバイルメニューボタン */}
            <div className="md:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-blue-100 hover:text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
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
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-md hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-600 focus:ring-white"
                type="button"
              >
                <LogOut className="h-4 w-4 mr-2" />
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* サイドバー (デスクトップ) */}
        <div className="hidden md:block md:w-64 bg-white shadow-md">
          <AdminSidebar />
        </div>

        {/* モバイルメニュー */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)}></div>
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="sr-only">メニューを閉じる</span>
                  <X className="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <AdminSidebar />
              </div>
              <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 text-base font-medium text-blue-600 hover:text-blue-800"
                  type="button"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  ログアウト
                </button>
              </div>
            </div>
            <div className="flex-shrink-0 w-14"></div>
          </div>
        )}

        {/* メインコンテンツ */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;