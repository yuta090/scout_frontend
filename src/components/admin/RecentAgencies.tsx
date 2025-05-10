import React from 'react';
import { Building2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

interface RecentAgenciesProps {
  agencies: any[];
  isLoading: boolean;
}

const RecentAgencies: React.FC<RecentAgenciesProps> = ({ agencies, isLoading }) => {
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

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">最近の代理店</h2>
      
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : agencies.length > 0 ? (
        <div className="space-y-4">
          {agencies.slice(0, 5).map((agency) => (
            <div key={agency.id} className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{agency.company_name}</p>
                <p className="text-xs text-gray-500">{agency.email}</p>
              </div>
              <div className="text-xs text-gray-500">
                {formatRelativeTime(agency.created_at)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">代理店データがありません</p>
      )}
    </div>
  );
};

export default RecentAgencies;