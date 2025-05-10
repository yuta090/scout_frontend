import React from 'react';
import StatCard from './StatCard';
import { CreditCard, Building2, Users } from 'lucide-react';

interface DashboardStatsProps {
  stats: {
    totalRevenue: number;
    activeCampaigns: number;
    totalCustomers: number;
  };
  isLoading: boolean;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, isLoading }) => {
  const statItems = [
    { name: '合計売上金額', value: `${stats.totalRevenue.toLocaleString()}円`, icon: CreditCard },
    { name: '進行中の案件', value: String(stats.activeCampaigns), icon: Building2 },
    { name: '登録顧客数', value: String(stats.totalCustomers), icon: Users }
  ];

  // スケルトンローディングコンポーネント
  const StatCardSkeleton = () => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-6 w-6 text-gray-400" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                合計売上金額
              </dt>
              <dd className="flex items-baseline">
                <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {isLoading ? (
        // 統計カードのスケルトンローディング
        statItems.map((_, index) => <StatCardSkeleton key={index} />)
      ) : (
        // 実際のデータ表示
        statItems.map((stat) => <StatCard key={stat.name} {...stat} />)
      )}
    </div>
  );
};

export default DashboardStats;