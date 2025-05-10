import React, { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, Eye, Plus, Search, Calendar, Edit, CreditCard, Warehouse, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Campaign } from '../lib/supabase';
import { supabase } from '../lib/supabase';
import CampaignForm from './campaign/CampaignForm';
import CampaignLog from './campaign/CampaignLog';

interface ProjectListProps {
  userType: 'agency' | 'client';
  onNewProject?: () => void;
  customerId?: string;
  initialCount?: number | null;
}

const ProjectList: React.FC<ProjectListProps> = ({ userType, onNewProject, customerId, initialCount = null }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [viewCampaignLog, setViewCampaignLog] = useState<Campaign | null>(null);
  const [showNewCampaignForm, setShowNewCampaignForm] = useState(false);
  const [campaignCount, setCampaignCount] = useState<number | null>(initialCount);
  const itemsPerPage = 50;

  const fetchCampaigns = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('campaigns')
        .select(`
          *,
          customers (
            company_name
          )
        `)
        .order('created_at', { ascending: false });

      // If customerId is provided, filter by it
      if (customerId) {
        query = query.eq('customer_id', customerId);
      } else {
        query = query.eq('agency_id', user.id);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      setCampaigns(data || []);
      if (count !== null) {
        setCampaignCount(count);
      }
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError('キャンペーン情報の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [customerId]);

  useEffect(() => {
    const filtered = campaigns.filter(campaign => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (campaign.customers?.company_name?.toLowerCase() || '').includes(searchLower) ||
        campaign.title.toLowerCase().includes(searchLower)
      );
    });

    const sorted = [...filtered].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    setFilteredCampaigns(sorted);
    setCurrentPage(1);
  }, [searchTerm, campaigns]);

  const handleNewProject = () => {
    if (onNewProject) {
      onNewProject();
    } else {
      setEditingCampaign(null);
      setShowNewCampaignForm(true);
    }
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setShowNewCampaignForm(true);
  };

  const handleCampaignSave = () => {
    setShowNewCampaignForm(false);
    setEditingCampaign(null);
    fetchCampaigns();
  };

  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCampaigns = filteredCampaigns.slice(startIndex, endIndex);

  const getStatusIcon = (status: Campaign['status']) => {
    switch (status) {
      case 'draft':
        return <FileText className="h-5 w-5 text-gray-600" />;
      case 'requested':
        return <Clock className="h-5 w-5 text-yellow-600" />;
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

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'requested':
        return 'bg-yellow-100 text-yellow-800';
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

  const getStatusText = (status: Campaign['status']) => {
    switch (status) {
      case 'draft':
        return '下書き';
      case 'requested':
        return '申請中';
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getJobTypeNames = (campaign: Campaign) => {
    if (!campaign.job_details?.job_type) return '';
    return Array.isArray(campaign.job_details.job_type)
      ? campaign.job_details.job_type
          .map(job => job.name)
          .filter(Boolean)
          .join('、')
      : '';
  };

  // スケルトンローディングコンポーネント
  const ProjectListSkeleton = () => (
    <div className="px-4 py-5 sm:px-6 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">スカウト一覧</h2>
          <p className="mt-1 text-sm text-gray-500">
            読み込み中...
          </p>
        </div>
        {userType === 'agency' && (
          <div className="animate-pulse h-12 w-48 bg-indigo-200 rounded-lg"></div>
        )}
      </div>

      <div className="max-w-xl">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <div className="animate-pulse h-10 w-full bg-gray-200 rounded-md"></div>
        </div>
      </div>

      <div className="border-t border-gray-200 mt-4">
        <div className="animate-pulse space-y-4 py-4">
          {Array(3).fill(0).map((_, index) => (
            <div key={index} className="flex items-center space-x-4 px-4 py-4">
              <div className="rounded-full bg-gray-200 h-10 w-10"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="flex space-x-2">
                <div className="rounded-full bg-gray-200 h-8 w-8"></div>
                <div className="rounded-full bg-gray-200 h-8 w-8"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <ProjectListSkeleton />
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium text-gray-900">スカウト一覧</h2>
            <p className="mt-1 text-sm text-gray-500">
              {filteredCampaigns.length}件のスカウト依頼があります
            </p>
          </div>
          {userType === 'agency' && (
            <button
              onClick={handleNewProject}
              className="group relative inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg shadow-lg hover:from-indigo-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="absolute inset-0 w-full h-full bg-white/[0.04] rounded-lg"></span>
              <span className="absolute -bottom-0 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>
              <Plus className="h-5 w-5 mr-2 transition-transform group-hover:rotate-90 duration-200" />
              <span className="relative">新規スカウト依頼作成</span>
            </button>
          )}
        </div>

        <div className="max-w-xl">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="企業名で検索..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {currentCampaigns.map((campaign) => (
            <li key={campaign.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors duration-150">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    {getStatusIcon(campaign.status)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {getStatusText(campaign.status)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CreditCard className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="font-medium text-gray-900">
                        {campaign.total_amount.toLocaleString()}円
                      </span>
                    </div>
                  </div>
                  <div className="mt-1 grid grid-cols-1 gap-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Eye className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      <span className="truncate">
                        {campaign.customers?.company_name || '未設定'}
                      </span>
                    </div>
                    {getJobTypeNames(campaign) && (
                      <div className="flex items-center text-xs text-gray-500">
                        <span className="truncate">
                          {getJobTypeNames(campaign)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      <span className="truncate">
                        {campaign.options.schedule.start_date && campaign.options.schedule.end_date ? (
                          `${formatDate(campaign.options.schedule.start_date)} 〜 ${formatDate(campaign.options.schedule.end_date)}`
                        ) : '未設定'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      作成日: {formatDate(campaign.created_at)}
                    </div>
                    <div className="text-sm text-gray-500">
                      総送信数: {campaign.quantity.toLocaleString()}通
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="group relative">
                    <button
                      onClick={() => setViewCampaignLog(campaign)}
                      className="text-gray-400 hover:text-gray-500 p-2 transition-colors duration-200"
                      aria-label="スカウト送信履歴を表示"
                    >
                      <Warehouse className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                      スカウト送信履歴を表示
                    </div>
                  </div>
                  <div className="group relative">
                    <button
                      onClick={() => handleEditCampaign(campaign)}
                      className="text-gray-400 hover:text-gray-500 p-2 transition-colors duration-200"
                      aria-label="スカウト情報を編集"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                      スカウト情報を編集
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
          {currentCampaigns.length === 0 && (
            <li className="px-4 py-8 text-center text-gray-500">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2">
                {searchTerm ? '検索条件に一致するスカウト依頼が見つかりません' : 'スカウト依頼がありません'}
              </p>
              {userType === 'agency' && !searchTerm && (
                <p className="mt-1 text-sm">
                  「新規スカウト依頼作成」から案件を作成してください
                </p>
              )}
            </li>
          )}
        </ul>
      </div>

      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              前へ
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              次へ
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                <span className="font-medium">{startIndex + 1}</span>
                {' - '}
                <span className="font-medium">{Math.min(endIndex, filteredCampaigns.length)}</span>
                {' / '}
                <span className="font-medium">{filteredCampaigns.length}</span>
                {' 件'}
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">前へ</span>
                  <ChevronLeft className="h-5 w-5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === currentPage
                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">次へ</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {(editingCampaign || showNewCampaignForm) && (
        <CampaignForm
          customerId={editingCampaign?.customer_id || customerId}
          campaign={editingCampaign}
          onClose={() => {
            setEditingCampaign(null);
            setShowNewCampaignForm(false);
          }}
          onSave={handleCampaignSave}
        />
      )}
      {viewCampaignLog && (
        <CampaignLog
          campaign={viewCampaignLog}
          onClose={() => setViewCampaignLog(null)}
        />
      )}
    </div>
  );
};

export default ProjectList;