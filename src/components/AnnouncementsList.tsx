import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { supabase } from '../lib/supabase';
import { Bell, Calendar, ChevronRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import DashboardLayout from './DashboardLayout';

interface Announcement {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  published: boolean;
  public_access: boolean;
  all_roles_access: boolean;
  allowed_roles: string[];
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

const AnnouncementsList: React.FC = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');

  // ユーザー情報の取得
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
        
        if (session?.user) {
          try {
            // get_user_role RPCを使用してロールを取得
            const { data: role } = await supabase
              .rpc('get_user_role', { user_id: session.user.id });
              
            if (role) {
              setUserRole(role);
            }
          } catch (error) {
            console.error('Error fetching user role:', error);
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      }
    };
    
    checkAuth();
  }, []);

  // お知らせデータの取得
  const { data: announcements = [], isLoading, isError } = useQuery(
    ['announcements', isAuthenticated, userRole, searchTerm],
    async () => {
      try {
        let query = supabase
          .from('announcements')
          .select('*')
          .eq('published', true)
          .order('published_at', { ascending: false });
        
        if (searchTerm) {
          query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
        }
        
        // 認証状態とロールに基づいてフィルタリング
        if (!isAuthenticated) {
          // 非認証ユーザーは公開お知らせのみ表示
          query = query.eq('public_access', true);
        } else if (userRole) {
          // 認証ユーザーは公開お知らせまたは自分のロールに合致するお知らせを表示
          query = query.or(`public_access.eq.true,all_roles_access.eq.true,allowed_roles.cs.{${userRole}}`);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching announcements:', error);
        throw error;
      }
    },
    {
      enabled: true, // 認証状態に関わらず取得を有効化
      refetchOnWindowFocus: false,
      staleTime: 60000, // 1分間はデータを新鮮と見なす
      retry: 3, // エラー時に3回リトライ
      retryDelay: 1000 // リトライ間隔は1秒
    }
  );

  // 相対時間フォーマット
  const formatRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ja
      });
    } catch (e) {
      return '日付不明';
    }
  };

  // 本文の抜粋を取得
  const getExcerpt = (content: string, maxLength: number = 100) => {
    // HTMLタグを除去
    const textContent = content.replace(/<[^>]*>/g, '');
    if (textContent.length <= maxLength) return textContent;
    return textContent.substring(0, maxLength) + '...';
  };

  // 現在のユーザータイプを取得
  const getUserType = () => {
    if (userRole === 'admin') return 'admin';
    if (userRole === 'agency') return 'agency';
    if (userRole === 'client') return 'client';
    if (userRole === 'referral_agent') return 'referral_agent';
    return 'agency'; // デフォルト
  };

  // スケルトンローディングコンポーネント
  const SkeletonLoading = () => (
    <div className="p-6 animate-pulse space-y-6">
      <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            {i % 2 === 0 && (
              <div className="h-16 w-16 bg-gray-200 rounded"></div>
            )}
            <div className="flex-1">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <DashboardLayout userType={getUserType()}>
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Bell className="h-6 w-6 text-indigo-500 mr-2" />
                お知らせ一覧
              </h1>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="タイトルや内容で検索..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <SkeletonLoading />
          ) : announcements.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {announcements.map((announcement) => (
                <li key={announcement.id} className="p-4 hover:bg-gray-50">
                  <Link to={`/announcements/${announcement.id}`} className="block">
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{announcement.title}</h3>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                          <span>{formatRelativeTime(announcement.published_at || announcement.created_at)}</span>
                        </div>
                        {announcement.image_url && (
                          <div className="mt-2 flex">
                            <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded overflow-hidden">
                              <img 
                                src={announcement.image_url} 
                                alt={announcement.title} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="ml-4 flex-1">
                              <p className="text-sm text-gray-600">{getExcerpt(announcement.content)}</p>
                            </div>
                          </div>
                        )}
                        {!announcement.image_url && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">{getExcerpt(announcement.content)}</p>
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-shrink-0 self-center">
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <Bell className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">お知らせはありません</h3>
              {searchTerm && (
                <p className="mt-1 text-sm">検索条件に一致するお知らせが見つかりませんでした</p>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnnouncementsList;