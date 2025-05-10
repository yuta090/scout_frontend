import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { supabase } from '../../lib/supabase';
import { 
  Search, FileText, Clock, CheckCircle, XCircle, 
  AlertCircle, Calendar, CreditCard, Building2, Users, Edit, Warehouse 
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import CampaignForm from '../campaign/CampaignForm';
import CampaignLog from '../campaign/CampaignLog';

const AdminCampaignList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<any | null>(null);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [viewCampaignLog, setViewCampaignLog] = useState<any | null>(null);

  // キャンペーンデータの取得
  const { data: campaigns = [], isLoading } = useQuery(
    ['adminCampaigns', searchTerm, statusFilter],
    async () => {
      let query = supabase
        .from('campaigns')
        .select(`
          *,
          customers (
            company_name
          ),
          profiles:agency_id (
            company_name
          )
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,customers.company_name.ilike.%${searchTerm}%,profiles.company_name.ilike.%${searchTerm}%`);
      }

      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      staleTime: 60000 // 1分間はデータを新鮮と見なす
    }
  );

  // ステータスアイコン
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <FileText className="h-5 w-5 text-gray-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  // ステータスカラー
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-indigo-100 text-indigo-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // ステータステキスト
  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return '下書き';
      case 'pending':
        return '承認待ち';
      case 'approved':
        return '承認済み';
      case 'in_progress':
        return '実行中';
      case 'completed':
        return '完了';
      case 'cancelled':
        return 'キャンセル';
      default:
        return status;
    }
  };

  // 日付フォーマット
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // ステータスフィルターオプション
  const statusOptions = [
    { value: null, label: 'すべて' },
    { value: 'draft', label: '下書き' },
    { value: 'pending', label: '承認待ち' },
    { value: 'approved', label: '承認済み' },
    { value: 'in_progress', label: '実行中' },
    { value: 'completed', label: '完了' },
    { value: 'cancelled', label: 'キャンセル' }
  ];

  // キャンペーン編集処理
  const handleEditCampaign = (campaign: any) => {
    setEditingCampaign(campaign);
    setShowCampaignForm(true);
  };

  // キャンペーン保存後の処理
  const handleCampaignSave = () => {
    setShowCampaignForm(false);
    setEditingCampaign(null);
  };

  // スカウト送信履歴を表示
  const handleViewCampaignLog = (campaign: any) => {
    setViewCampaignLog(campaign);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">キャンペーン管理</h1>
          
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter || ''}
              onChange={(e) => setStatusFilter(e.target.value || null)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              {statusOptions.map((option) => (
                <option key={option.value || 'all'} value={option.value || ''}>
                  {option.label}
                </option>
              ))}
            </select>
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
              placeholder="顧客名、代理店名で検索..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        {/* キャンペーンリスト */}
        <div className="bg-white shadow overflow-hidden rounded-lg">
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : campaigns.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      顧客/代理店
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {campaigns.map((campaign: any) => (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            {getStatusIcon(campaign.status)}
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <Users className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-900">
                                {campaign.customers?.company_name || '不明な顧客'}
                              </span>
                            </div>
                            <div className="flex items-center mt-1">
                              <Building2 className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-500">
                                {campaign.profiles?.company_name || '不明な代理店'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                          {getStatusText(campaign.status)}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(campaign.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleViewCampaignLog(campaign)}
                            className="text-indigo-600 hover:text-indigo-900 flex items-center"
                          >
                            <Warehouse className="h-4 w-4 mr-1" />
                            送信履歴
                          </button>
                          <button
                            onClick={() => handleEditCampaign(campaign)}
                            className="text-indigo-600 hover:text-indigo-900 flex items-center"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            編集
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">キャンペーンがありません</h3>
              <p className="mt-1 text-sm text-gray-500">
                検索条件に一致するキャンペーンが見つかりませんでした
              </p>
            </div>
          )}
        </div>

      {/* キャンペーン編集モーダル */}
      {showCampaignForm && editingCampaign && (
        <CampaignForm
          customerId={editingCampaign.customer_id}
          campaign={editingCampaign}
          onClose={() => setShowCampaignForm(false)}
          onSave={handleCampaignSave}
        />
      )}

      {/* スカウト送信履歴モーダル */}
      {viewCampaignLog && (
        <CampaignLog
          campaign={viewCampaignLog}
          onClose={() => setViewCampaignLog(null)}
        />
      )}
      </div>
    </AdminLayout>
  );
};

export default AdminCampaignList;