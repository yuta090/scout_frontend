import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from 'react-query';
import { supabase } from '../../lib/supabase';
import { Bell, Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

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

const RecentAnnouncement: React.FC = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // ユーザー情報の取得
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('RecentAnnouncement: ユーザー認証状態を確認中...');
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
        
        if (session?.user) {
          try {
            // get_user_role RPCを使用してロールを取得
            console.log('RecentAnnouncement: ユーザーロールを取得中...');
            const { data: role } = await supabase
              .rpc('get_user_role', { user_id: session.user.id });
              
            if (role) {
              console.log('RecentAnnouncement: ユーザーロール取得成功:', role);
              setUserRole(role);
            } else {
              console.log('RecentAnnouncement: ユーザーロールが取得できませんでした');
            }
          } catch (error) {
            console.error('RecentAnnouncement: ユーザーロール取得エラー:', error);
          }
        } else {
          console.log('RecentAnnouncement: 認証セッションなし');
        }
      } catch (error) {
        console.error('RecentAnnouncement: 認証チェックエラー:', error);
      }
    };
    
    checkAuth();
  }, []);

  // お知らせデータの取得 - React Queryを使用
  const { 
    data: announcements = [], 
    isLoading, 
    error,
    isFetching
  } = useQuery(
    ['recentAnnouncements', isAuthenticated, userRole],
    async () => {
      try {
        console.log('RecentAnnouncement: お知らせデータを取得中...', { isAuthenticated, userRole });
        
        if (isAuthenticated && userRole) {
          // 認証済みユーザーの場合はRPC関数を使用
          console.log('RecentAnnouncement: 認証済みユーザー用のお知らせを取得');
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            console.log('RecentAnnouncement: ユーザー情報が取得できませんでした');
            return [];
          }
          
          console.log('RecentAnnouncement: RPC関数を呼び出し中...');
          const { data, error } = await supabase
            .rpc('get_recent_announcements', {
              p_user_id: user.id,
              p_limit: 10
            });
          
          if (error) {
            console.error('RecentAnnouncement: RPC関数呼び出しエラー:', error);
            throw error;
          }
          
          console.log('RecentAnnouncement: RPC関数呼び出し成功:', data?.length || 0);
          return data || [];
        } else {
          // 未認証ユーザーの場合は公開お知らせのみ取得
          console.log('RecentAnnouncement: 未認証ユーザー用の公開お知らせを取得');
          const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .eq('published', true)
            .eq('public_access', true)
            .order('published_at', { ascending: false })
            .limit(10);
          
          if (error) {
            console.error('RecentAnnouncement: 公開お知らせ取得エラー:', error);
            throw error;
          }
          
          console.log('RecentAnnouncement: 公開お知らせ取得成功:', data?.length || 0);
          return data || [];
        }
      } catch (err) {
        console.error('RecentAnnouncement: お知らせ取得エラー:', err);
        throw err;
      }
    },
    {
      enabled: true, // 認証状態に関わらず取得を有効化
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000, // 1分間はデータを新鮮と見なす
      retry: 3, // エラー時に3回リトライ
      retryDelay: 1000, // リトライ間隔は1秒
      onError: (err) => {
        console.error('RecentAnnouncement: お知らせ取得エラー:', err);
      }
    }
  );

  // 相対時間フォーマット - メモ化
  const formatRelativeTime = useMemo(() => {
    return (dateString: string) => {
      try {
        return formatDistanceToNow(new Date(dateString), {
          addSuffix: true,
          locale: ja
        });
      } catch (e) {
        console.error('RecentAnnouncement: 日付フォーマットエラー:', e);
        return '日付不明';
      }
    };
  }, []);

  // 本文の抜粋を取得 - メモ化
  const getExcerpt = useMemo(() => {
    return (content: string, maxLength: number = 100) => {
      // HTMLタグを除去
      const textContent = content.replace(/<[^>]*>/g, '');
      if (textContent.length <= maxLength) return textContent;
      return textContent.substring(0, maxLength) + '...';
    };
  }, []);

  // ヘッダー部分（常に表示）
  const AnnouncementHeader = () => (
    <div className="px-4 py-3 border-b border-gray-200">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-medium text-gray-900 flex items-center">
          <Bell className="h-4 w-4 text-indigo-500 mr-1" />
          お知らせ
        </h2>
        <Link to="/announcements" className="text-xs text-indigo-600 hover:text-indigo-800">
          全てを見る
        </Link>
      </div>
    </div>
  );

  // コンテンツ部分
  const renderContent = () => {
    if (isLoading || isFetching) {
      console.log('RecentAnnouncement: ローディング中...');
      return (
        <div className="p-3 animate-pulse">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-12 w-12 bg-gray-200 rounded"></div>
            <div className="ml-3 flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      console.error('RecentAnnouncement: エラー表示:', error);
      return (
        <div className="p-3 text-center text-red-500">
          <p className="text-xs">お知らせの取得に失敗しました</p>
        </div>
      );
    }

    if (!announcements || announcements.length === 0) {
      console.log('RecentAnnouncement: お知らせなし');
      return (
        <div className="p-3 text-center text-gray-500">
          <p className="text-xs">お知らせはありません</p>
        </div>
      );
    }

    console.log('RecentAnnouncement: お知らせ表示:', announcements.length);
    return (
      <ul className="divide-y divide-gray-200">
        {announcements.map((announcement) => (
          <li key={announcement.id} className="p-3 hover:bg-gray-50">
            <Link to={`/announcements/${announcement.id}`} className="block">
              <div className="flex justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{announcement.title}</h3>
                  <div className="mt-1 flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                    <span>{formatRelativeTime(announcement.published_at || announcement.created_at)}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-600 line-clamp-2">{getExcerpt(announcement.content, 60)}</p>
                </div>
                <div className="ml-4 flex-shrink-0 self-center">
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    );
  };

  console.log('RecentAnnouncement: レンダリング', { 
    isAuthenticated, 
    userRole, 
    hasAnnouncements: announcements?.length > 0,
    isLoading,
    isFetching,
    hasError: !!error
  });

  return (
    <div className="bg-white shadow rounded-lg">
      <AnnouncementHeader />
      {renderContent()}
    </div>
  );
};

export default React.memo(RecentAnnouncement);