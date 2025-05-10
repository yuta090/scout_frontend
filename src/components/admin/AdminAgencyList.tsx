import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../../lib/supabase';
import { 
  Search, Plus, Edit, Trash2, CheckCircle, 
  XCircle, Building2, Mail, Phone, Calendar 
} from 'lucide-react';
import AdminAgencyForm from './AdminAgencyForm';
import AdminLayout from './AdminLayout';

const AdminAgencyList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<any>(null);
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // 代理店データの取得
  const { data: agencies = [], isLoading } = useQuery(
    ['adminAgencies', searchTerm],
    async () => {
      console.log('Fetching agencies with search term:', searchTerm);
      
      try {
        // 管理者用の関数を使用して代理店一覧を取得
        const { data, error } = await supabase
          .rpc('get_admin_agency_list', {
            p_search_term: searchTerm || null
          });
        
        if (error) {
          console.error('Error fetching agencies:', error);
          setError(`代理店データの取得に失敗しました: ${error.message}`);
          throw error;
        }
        
        console.log('Fetched agencies:', data);
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

  // 代理店削除のミューテーション
  const deleteAgencyMutation = useMutation(
    async (agencyId: string) => {
      // Supabaseの認証ユーザーを削除
      const { error } = await supabase.auth.admin.deleteUser(agencyId);
      if (error) throw error;
      return agencyId;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['adminAgencies']);
      }
    }
  );

  // 代理店の削除処理
  const handleDeleteAgency = async (agency: any) => {
    if (!window.confirm(`${agency.company_name}を削除してもよろしいですか？この操作は元に戻せません。`)) {
      return;
    }
    
    try {
      await deleteAgencyMutation.mutateAsync(agency.id);
    } catch (error) {
      console.error('代理店の削除に失敗しました:', error);
      alert('代理店の削除に失敗しました');
    }
  };

  // 代理店の編集処理
  const handleEditAgency = (agency: any) => {
    setSelectedAgency(agency);
    setIsFormOpen(true);
  };

  // 代理店の追加処理
  const handleAddAgency = () => {
    setSelectedAgency(null);
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">代理店管理</h1>
          
          <button
            onClick={handleAddAgency}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            新規代理店登録
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* 代理店数の表示 */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-center">
            <Building2 className="h-5 w-5 text-blue-500 mr-2" />
            <span className="text-blue-700 font-medium">現在の代理店数: {agencies.length}</span>
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
              placeholder="代理店名で検索..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        {/* 代理店リスト */}
        <div className="bg-white shadow overflow-hidden rounded-lg">
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : agencies.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      代理店名
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      連絡先
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      登録日
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      顧客数
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      キャンペーン数
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {agencies.map((agency: any) => (
                    <tr key={agency.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{agency.company_name}</div>
                            <div className="text-sm text-gray-500">{agency.contact_name || '未設定'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="flex items-center text-sm text-gray-900">
                            <Mail className="h-4 w-4 text-gray-400 mr-1" />
                            {agency.email}
                          </div>
                          {agency.phone && (
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <Phone className="h-4 w-4 text-gray-400 mr-1" />
                              {agency.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                          {formatDate(agency.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {agency.customer_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {agency.campaign_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditAgency(agency)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          <Edit className="h-5 w-5" />
                          <span className="sr-only">編集</span>
                        </button>
                        <button
                          onClick={() => handleDeleteAgency(agency)}
                          className="text-red-600 hover:text-red-900"
                          disabled={(agency.customer_count > 0 || agency.campaign_count > 0)}
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
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">代理店がありません</h3>
              <p className="mt-1 text-sm text-gray-500">
                新しい代理店を登録してください
              </p>
              <div className="mt-6">
                <button
                  onClick={handleAddAgency}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  新規代理店登録
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 代理店フォームモーダル */}
        {isFormOpen && (
          <AdminAgencyForm
            agency={selectedAgency}
            onClose={() => {
              setIsFormOpen(false);
              setSelectedAgency(null);
            }}
            onSuccess={() => {
              setIsFormOpen(false);
              setSelectedAgency(null);
              queryClient.invalidateQueries(['adminAgencies']);
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAgencyList;