import React, { memo } from 'react';
import { BarChart2, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

interface RecentCampaignsProps {
  campaigns: any[];
  isLoading: boolean;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  stats?: {
    activeCampaignCount: number;
    periodCampaignCount: number;
    totalRevenue: number;
  };
}

// メモ化したコンポーネントを作成
const RecentCampaigns: React.FC<RecentCampaignsProps> = memo(({ 
  campaigns, 
  isLoading, 
  dateRange,
  stats
}) => {
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

  // キャンペーンステータスバッジ
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">下書き</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">承認待ち</span>;
      case 'in_progress':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">進行中</span>;
      case 'completed':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">完了</span>;
      case 'cancelled':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">キャンセル</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  // 期間統計セクションを表示するかどうか
  const showPeriodStats = dateRange && stats;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {showPeriodStats && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">期間内統計</h2>
            <div className="flex items-center">
              <BarChart2 className="h-5 w-5 text-gray-400 mr-1" />
              <span className="text-sm text-gray-500">
                {dateRange.startDate} 〜 {dateRange.endDate}
              </span>
            </div>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">新規キャンペーン</span>
              <div className="flex items-center">
                <span className="text-xl font-semibold">{stats.periodCampaignCount}</span>
                <TrendingUp className="h-4 w-4 text-green-500 ml-1" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">進行中のキャンペーン</span>
              <span className="text-xl font-semibold">{stats.activeCampaignCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">総売上</span>
              <span className="text-xl font-semibold">{stats.totalRevenue.toLocaleString()}円</span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">最近のキャンペーン</h3>
          </div>
        </>
      )}

      {!showPeriodStats && (
        <h2 className="text-lg font-medium text-gray-900 mb-4">最近のキャンペーン</h2>
      )}
      
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div className="w-2/3">
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-5 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      ) : campaigns.length > 0 ? (
        <div className="space-y-3">
          {campaigns.map((campaign: any) => (
            <div key={campaign.id} className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div>
                <p className="text-sm text-gray-500">
                  {campaign.customers?.company_name || '不明な顧客'} / {campaign.profiles?.company_name || '不明な代理店'}
                </p>
                <p className="text-xs text-gray-400">
                  {campaign.title || '無題のキャンペーン'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(campaign.status)}
                <span className="text-xs text-gray-500">{formatRelativeTime(campaign.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">キャンペーンがありません</p>
      )}
    </div>
  );
});

// displayName を設定
RecentCampaigns.displayName = 'RecentCampaigns';

export default RecentCampaigns;