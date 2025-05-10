import React from 'react';
import { BarChart2, TrendingUp } from 'lucide-react';

interface AdminPeriodStatsProps {
  stats: {
    periodCampaignCount: number;
    activeCampaignCount: number;
    totalRevenue: number;
  };
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

const AdminPeriodStats: React.FC<AdminPeriodStatsProps> = ({ stats, dateRange }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">期間内統計</h2>
        <div className="flex items-center">
          <BarChart2 className="h-5 w-5 text-gray-400 mr-1" />
          <span className="text-sm text-gray-500">
            {dateRange.startDate} 〜 {dateRange.endDate}
          </span>
        </div>
      </div>
      
      <div className="space-y-4">
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
    </div>
  );
};

export default AdminPeriodStats;