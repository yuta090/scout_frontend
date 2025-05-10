import React from 'react';
import { Building2, CheckCircle, CreditCard } from 'lucide-react';

interface ReferralStatCardsProps {
  stats: {
    totalReferrals: number;
    convertedLeads: number;
    totalCommission: number;
  };
  isLoading: boolean;
}

const ReferralStatCards: React.FC<ReferralStatCardsProps> = ({ stats, isLoading }) => {
  // 統計カードコンポーネント
  const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: any; color: string }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="flex items-center">
              <div className="rounded-full bg-gray-200 h-12 w-12"></div>
              <div className="ml-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-6 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard 
        title="紹介企業数" 
        value={stats.totalReferrals} 
        icon={Building2} 
        color="bg-indigo-500" 
      />
      <StatCard 
        title="成約企業数" 
        value={stats.convertedLeads} 
        icon={CheckCircle} 
        color="bg-green-500" 
      />
      <StatCard 
        title="累計報酬" 
        value={`${stats.totalCommission.toLocaleString()}円`} 
        icon={CreditCard} 
        color="bg-purple-500" 
      />
    </div>
  );
};

export default ReferralStatCards;