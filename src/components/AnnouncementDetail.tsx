import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Bell, Calendar, ArrowLeft, Globe, Users } from 'lucide-react';

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

const AnnouncementDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      if (!id) {
        setError('お知らせIDが指定されていません');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // 認証状態の確認
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
        
        // ユーザーロールの取得
        if (session?.user) {
          try {
            const { data: role } = await supabase
              .rpc('get_user_role', { user_id: session.user.id });
              
            if (role) {
              setUserRole(role);
            }
          } catch (roleError) {
            console.error('Error fetching user role:', roleError);
          }
        }
        
        // お知らせの取得
        const { data, error: fetchError } = await supabase
          .from('announcements')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        
        if (fetchError) throw fetchError;
        
        if (!data) {
          setError('お知らせが見つかりませんでした');
          setIsLoading(false);
          return;
        }
        
        // アクセス権限のチェック
        if (!data.published) {
          setError('このお知らせは公開されていません');
          setIsLoading(false);
          return;
        }
        
        // 非認証ユーザーの場合は公開設定のみチェック
        if (!session) {
          if (!data.public_access) {
            setError('このお知らせを閲覧するにはログインが必要です');
            setIsLoading(false);
            return;
          }
        } else if (userRole) {
          // 認証ユーザーの場合は公開設定またはロールに基づいてアクセス権限をチェック
          const hasAccess = 
            data.public_access || 
            data.all_roles_access || 
            (data.allowed_roles && data.allowed_roles.includes(userRole));
          
          if (!hasAccess) {
            setError('このお知らせを閲覧する権限がありません');
            setIsLoading(false);
            return;
          }
        }
        
        // すべてのチェックをパスしたらお知らせを設定
        setAnnouncement(data);
      } catch (err) {
        console.error('Error fetching announcement:', err);
        setError('お知らせの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnnouncement();
  }, [id, userRole]);

  // 日付フォーマット
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // HTMLの安全な表示
  const createMarkup = (html: string) => {
    return { __html: html };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <Bell className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-center text-gray-900 mb-2">
            エラーが発生しました
          </h1>
          <p className="text-center text-gray-600 mb-6">
            {error}
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-center text-gray-900 mb-2">
            お知らせが見つかりません
          </h1>
          <p className="text-center text-gray-600 mb-6">
            お探しのお知らせは存在しないか、削除された可能性があります。
          </p>
          <div className="flex justify-center">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              ホームに戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            戻る
          </button>
        </div>
        
        <div className="bg-white shadow overflow-hidden rounded-lg">
          {/* ヘッダー */}
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center">
              <Bell className="h-6 w-6 text-indigo-500 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">{announcement.title}</h1>
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 text-gray-400 mr-1" />
              <span>{formatDate(announcement.published_at || announcement.created_at)}</span>
              
              {/* アクセス権限バッジ */}
              <div className="ml-4 flex space-x-2">
                {announcement.public_access && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Globe className="h-3 w-3 mr-1" />
                    一般公開
                  </span>
                )}
                
                {announcement.all_roles_access ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <Users className="h-3 w-3 mr-1" />
                    全ロール
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    <Users className="h-3 w-3 mr-1" />
                    {announcement.allowed_roles.join(', ')}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* 本文 */}
          <div className="px-6 py-5">
            {announcement.image_url && (
              <div className="mb-6">
                <img
                  src={announcement.image_url}
                  alt={announcement.title}
                  className="w-full h-auto max-h-96 object-cover rounded-lg"
                />
              </div>
            )}
            
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={createMarkup(announcement.content)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementDetail;