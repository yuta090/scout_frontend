import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../../lib/supabase';
import { 
  Search, Plus, Edit, Trash2, Eye, 
  Bell, Calendar, CheckCircle, XCircle, Globe, Users
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import AdminAnnouncementForm from './AdminAnnouncementForm';
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

const AdminAnnouncementList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // お知らせデータの取得
  const { data: announcements = [], isLoading } = useQuery(
    ['adminAnnouncements', searchTerm],
    async () => {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching announcements:', error);
          setError(`お知らせデータの取得に失敗しました: ${error.message}`);
          throw error;
        }
        
        // 検索フィルタリング
        if (searchTerm) {
          return data?.filter(announcement => 
            announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
          ) || [];
        }
        
        return data || [];
      } catch (err) {
        console.error('Error in query execution:', err);
        setError(`クエリ実行エラー: ${err instanceof Error ? err.message : String(err)}`);
        return [];
      }
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      staleTime: 60000 // 1分間はデータを新鮮と見なす
    }
  );

  // お知らせ削除のミューテーション
  const deleteAnnouncementMutation = useMutation(
    async (announcementId: string) => {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', announcementId);
      
      if (error) throw error;
      return announcementId;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['adminAnnouncements']);
      }
    }
  );

  // お知らせの削除処理
  const handleDeleteAnnouncement = async (announcement: Announcement) => {
    if (!window.confirm(`「${announcement.title}」を削除してもよろしいですか？この操作は元に戻せません。`)) {
      return;
    }
    
    try {
      await deleteAnnouncementMutation.mutateAsync(announcement.id);
    } catch (error) {
      console.error('お知らせの削除に失敗しました:', error);
      alert('お知らせの削除に失敗しました');
    }
  };

  // お知らせの編集処理
  const handleEditAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsFormOpen(true);
  };

  // お知らせの追加処理
  const handleAddAnnouncement = () => {
    setSelectedAnnouncement(null);
    setIsFormOpen(true);
  };

  // 日付フォーマット
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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

  // 公開状態のバッジ
  const getPublishedBadge = (announcement: Announcement) => {
    if (announcement.published) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          公開中
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <XCircle className="h-3 w-3 mr-1" />
          下書き
        </span>
      );
    }
  };

  // アクセス権限のバッジ
  const getAccessBadges = (announcement: Announcement) => {
    const badges = [];
    
    if (announcement.public_access) {
      badges.push(
        <span key="public" className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
          <Globe className="h-3 w-3 mr-1" />
          一般公開
        </span>
      );
    }
    
    if (announcement.all_roles_access) {
      badges.push(
        <span key="all-roles" className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mr-2">
          <Users className="h-3 w-3 mr-1" />
          全ロール
        </span>
      );
    } else if (announcement.allowed_roles && announcement.allowed_roles.length > 0) {
      // ロール名を日本語に変換
      const roleMap: Record<string, string> = {
        'agency': '代理店',
        'client': 'クライアント',
        'admin': '管理者',
        'referral_agent': '取次代理店'
      };
      
      const roleLabels = announcement.allowed_roles
        .map(role => roleMap[role] || role)
        .join('、');
      
      badges.push(
        <span key="specific-roles" className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
          <Users className="h-3 w-3 mr-1" />
          {roleLabels}
        </span>
      );
    }
    
    return badges;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">お知らせ管理</h1>
          
          <button
            onClick={handleAddAnnouncement}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            新規お知らせ作成
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* お知らせ数の表示 */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-center">
            <Bell className="h-5 w-5 text-blue-500 mr-2" />
            <span className="text-blue-700 font-medium">現在のお知らせ数: {announcements.length}</span>
          </div>
        </div>

        {/* 検索フィールド */}
        <div className="max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="タイトルや内容で検索..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        {/* お知らせリスト */}
        <div className="bg-white shadow overflow-hidden rounded-lg">
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : announcements.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      タイトル
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      公開設定
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      作成日
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {announcements.map((announcement) => (
                    <tr key={announcement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <Bell className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{announcement.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {announcement.content.replace(/<[^>]*>/g, '').substring(0, 50)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPublishedBadge(announcement)}
                        {announcement.published_at && (
                          <div className="text-xs text-gray-500 mt-1">
                            公開日: {formatDate(announcement.published_at)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {getAccessBadges(announcement)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                          <span>{formatRelativeTime(announcement.created_at)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => window.open(`/announcements/${announcement.id}`, '_blank')}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          <Eye className="h-5 w-5" />
                          <span className="sr-only">閲覧</span>
                        </button>
                        <button
                          onClick={() => handleEditAnnouncement(announcement)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          <Edit className="h-5 w-5" />
                          <span className="sr-only">編集</span>
                        </button>
                        <button
                          onClick={() => handleDeleteAnnouncement(announcement)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                          <span className="sr-only">削除</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <Bell className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">お知らせがありません</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? '検索条件に一致するお知らせが見つかりませんでした' : '新しいお知らせを作成してください'}
              </p>
              <div className="mt-6">
                <button
                  onClick={handleAddAnnouncement}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  新規お知らせ作成
                </button>
              </div>
            </div>
          )}
        </div>

        {/* お知らせフォームモーダル */}
        {isFormOpen && (
          <AdminAnnouncementForm
            announcement={selectedAnnouncement}
            onClose={() => {
              setIsFormOpen(false);
              setSelectedAnnouncement(null);
            }}
            onSuccess={() => {
              setIsFormOpen(false);
              setSelectedAnnouncement(null);
              queryClient.invalidateQueries(['adminAnnouncements']);
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAnnouncementList;