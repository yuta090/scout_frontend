import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
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

const AnnouncementList: React.FC = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ユーザー情報の取得
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      if (session?.user) {
        // get_user_role RPCを使用してロールを取得
        const { data: role } = await supabase
          .rpc('get_user_role', { user_id: session.user.id });
          
        if (role) {
          setUserRole(role);
        }
      }
    };
    
    checkAuth();
  }, []);

  // お知らせデータの取得
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setIsLoading(true);
        
        if (isAuthenticated && userRole) {
          // 認証済みユーザーの場合はRPC関数を使用
          const { data, error } = await supabase
            .rpc('get_recent_announcements', {
              p_user_id: (await supabase.auth.getUser()).data.user?.id,
              p_limit: 10
            });
          
          if (error) {
            console.error('Error fetching announcements via RPC:', error);
            throw error;
          }
          
          setAnnouncements(data || []);
        } else {
          // 未認証ユーザーの場合は公開お知らせのみ取得
          const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .eq('published', true)
            .eq('public_access', true)
            .order('published_at', { ascending: false })
            .limit(10);
          
          if (error) {
            console.error('Error fetching public announcements:', error);
            throw error;
          }
          
          setAnnouncements(data || []);
        }
      } catch (err) {
        console.error('Error fetching announcements:', err);
        setError('お知らせの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnnouncements();
  }, [isAuthenticated, userRole]);

  // 相対時間フォーマット - メモ化
  const formatRelativeTime = useMemo(() => {
    return (dateString: string) => {
      try {
        return formatDistanceToNow(new Date(dateString), {
          addSuffix: true,
          locale: ja
        });
      } catch (e) {
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

  return (
    <div className="bg-white shadow rounded-lg">
      <AnnouncementHeader />
      
      {isLoading ? (
        <div className="p-3 animate-pulse">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-12 w-12 bg-gray-200 rounded"></div>
            <div className="ml-3 flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ) : announcements.length > 0 ? (
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
      ) : (
        <div className="p-3 text-center text-gray-500">
          <p className="text-xs">お知らせはありません</p>
        </div>
      )}
    </div>
  );
};

export default React.memo(AnnouncementList);