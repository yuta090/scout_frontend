import React from 'react';
import { CreditCard, Building2, Users, FileText } from 'lucide-react';

interface DashboardStatsProps {
  stats: {
    agencyCount: number;
    clientCount: number;
    campaignCount: number;
    activeCampaignCount: number;
    totalRevenue: number;
    periodCampaignCount: number;
  };
  isLoading: boolean;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, isLoading }) => {
  const statItems = [
    { 
      title: '代理店数ぽよ', 
      value: stats.agencyCount, 
      icon: Building2, 
      color: 'bg-indigo-500' 
    },
    { 
      title: 'クライアント数', 
      value: stats.clientCount, 
      icon: Users, 
      color: 'bg-blue-500' 
    },
    { 
      title: '全キャンペーン', 
      value: stats.campaignCount, 
      icon: FileText, 
      color: 'bg-purple-500' 
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {isLoading ? (
        Array(3).fill(0).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="flex items-center">
              <div className="bg-gray-200 p-3 rounded-full h-12 w-12"></div>
              <div className="ml-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-6 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          </div>
        ))
      ) : (
        statItems.map((item, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${item.color}`}>
                <item.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-500">{item.title}</h3>
                <p className="text-2xl font-semibold">{item.value}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default DashboardStats;