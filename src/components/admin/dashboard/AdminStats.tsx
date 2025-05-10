import React, { memo } from 'react';
import { Building2, Users, FileText } from 'lucide-react';
import StatCard from './StatCard';

interface AdminStatsProps {
  stats: {
    agencyCount: number;
    clientCount: number;
    campaignCount: number;
  };
  isLoading: boolean;
}

// メモ化したコンポーネントを作成
const AdminStats: React.FC<AdminStatsProps> = memo(({ stats, isLoading }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {isLoading ? (
        // 統計カードのスケルトンローディング
        Array(3).fill(0).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="flex items-center">
              <div className="h-6 w-6 bg-gray-200 rounded-full flex-shrink-0"></div>
              <div className="ml-5 w-0 flex-1">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          </div>
        ))
      ) : (
        // 実際のデータ表示
        <>
          <StatCard 
            title="代理店数" 
            value={stats.agencyCount} 
            icon={Building2} 
            color="bg-indigo-500" 
          />
          <StatCard 
            title="クライアント数" 
            value={stats.clientCount} 
            icon={Users} 
            color="bg-blue-500" 
          />
          <StatCard 
            title="全キャンペーン" 
            value={stats.campaignCount} 
            icon={FileText} 
            color="bg-purple-500" 
          />
        </>
      )}
    </div>
  );
});

// displayName を設定
AdminStats.displayName = 'AdminStats';

export default AdminStats;