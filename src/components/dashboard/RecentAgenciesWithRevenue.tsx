import React from 'react';
import { useQuery } from 'react-query';
import { supabase } from '../../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Building2, Calendar, CreditCard } from 'lucide-react';

interface RecentAgenciesWithRevenueProps {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  limit?: number;
}

interface AgencyWithRevenue {
  id: string;
  company_name: string;
  contact_name: string | null;
  email: string;
  created_at: string;
  total_revenue: number;
}

const RecentAgenciesWithRevenue: React.FC<RecentAgenciesWithRevenueProps> = ({ 
  dateRange, 
  limit = 5 
}) => {
  // 代理店データと売上金額の取得
  const { data: agencies = [], isLoading } = useQuery(
    ['recentAgenciesWithRevenue', dateRange, limit],
    async () => {
      console.log('代理店データと売上金額を取得中...');
      
      try {
        // 代理店データを取得
        const { data: agencyData, error: agencyError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'agency')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (agencyError) {
          console.error('代理店データ取得エラー:', agencyError);
          throw agencyError;
        }

        console.log(`取得した代理店データ: ${agencyData?.length || 0}件`, agencyData);

        if (!agencyData || agencyData.length === 0) {
          return [];
        }

        // 各代理店の売上金額を取得
        const agenciesWithRevenue = await Promise.all(
          agencyData.map(async (agency) => {
            try {
              const { data: campaignData, error: campaignError } = await supabase
                .from('campaigns')
                .select('total_amount')
                .eq('agency_id', agency.id)
                .gte('created_at', dateRange.startDate)
                .lte('created_at', dateRange.endDate);

              if (campaignError) {
                console.error(`${agency.company_name}の売上データ取得エラー:`, campaignError);
                return {
                  ...agency,
                  total_revenue: 0
                };
              }

              // 売上金額の合計を計算
              const totalRevenue = campaignData?.reduce(
                (sum, campaign) => sum + (campaign.total_amount || 0), 
                0
              ) || 0;

              console.log(`${agency.company_name}の売上金額: ${totalRevenue}円`);

              return {
                ...agency,
                total_revenue: totalRevenue
              };
            } catch (error) {
              console.error(`${agency.company_name}の売上データ処理エラー:`, error);
              return {
                ...agency,
                total_revenue: 0
              };
            }
          })
        );

        console.log('売上情報を含めた代理店データ:', agenciesWithRevenue);
        return agenciesWithRevenue as AgencyWithRevenue[];
      } catch (error) {
        console.error('代理店データと売上金額の取得に失敗:', error);
        throw error;
      }
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      staleTime: 60000, // 1分間はデータを新鮮と見なす
      onError: (error) => {
        console.error('代理店データ取得エラー:', error);
      }
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

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <h3 className="text-lg font-medium text-gray-900 mb-4">最近の代理店</h3>
        <div className="space-y-4">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-5 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 代理店データがない場合はダミーデータを表示
  if (agencies.length === 0) {
    const dummyAgencies = [
      {
        id: '1',
        company_name: '株式会社サンプル',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        total_revenue: 150000
      },
      {
        id: '2',
        company_name: 'テスト株式会社',
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        total_revenue: 120000
      },
      {
        id: '3',
        company_name: '株式会社エージェント',
        created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        total_revenue: 85000
      }
    ];

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">最近の代理店</h3>
        <div className="space-y-4">
          {dummyAgencies.map((agency) => (
            <div key={agency.id} className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{agency.company_name}</p>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                    <p className="text-xs text-gray-500">登録: {formatRelativeTime(agency.created_at)}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <CreditCard className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-sm font-medium text-indigo-600">
                  {agency.total_revenue.toLocaleString()}円
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">最近の代理店</h3>
      <div className="space-y-4">
        {agencies.map((agency) => (
          <div key={agency.id} className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{agency.company_name}</p>
                <div className="flex items-center mt-1">
                  <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                  <p className="text-xs text-gray-500">登録: {formatRelativeTime(agency.created_at)}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <CreditCard className="h-4 w-4 text-gray-400 mr-1" />
              <span className="text-sm font-medium text-indigo-600">
                {agency.total_revenue.toLocaleString()}円
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentAgenciesWithRevenue;