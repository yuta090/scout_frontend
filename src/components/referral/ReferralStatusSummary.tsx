import React from 'react';

interface ReferralStatusSummaryProps {
  stats: {
    pendingLeads: number;
    contactedLeads: number;
    convertedLeads: number;
    conversionRate: number;
  };
  isLoading: boolean;
}

const ReferralStatusSummary: React.FC<ReferralStatusSummaryProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-100 p-4 rounded-lg animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-12"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">紹介状況</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="text-blue-600 text-sm font-medium">申込中</div>
          <div className="text-2xl font-bold text-blue-700">{stats.pendingLeads}</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <div className="text-yellow-600 text-sm font-medium">連絡済み</div>
          <div className="text-2xl font-bold text-yellow-700">{stats.contactedLeads}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <div className="text-green-600 text-sm font-medium">成約</div>
          <div className="text-2xl font-bold text-green-700">{stats.convertedLeads}</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <div className="text-purple-600 text-sm font-medium">成約率</div>
          <div className="text-2xl font-bold text-purple-700">{stats.conversionRate}%</div>
        </div>
      </div>
    </div>
  );
};

export default ReferralStatusSummary;