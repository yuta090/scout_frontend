import React from 'react';
import { TrendingUp } from 'lucide-react';

interface ReferralMonthlyStatsProps {
  monthlyStats: {
    month: string;
    count: number;
  }[];
  isLoading: boolean;
}

const ReferralMonthlyStats: React.FC<ReferralMonthlyStatsProps> = ({ monthlyStats, isLoading }) => {
  // コンソールログに月間統計データを表示
  React.useEffect(() => {
    console.log('月間統計データ:', monthlyStats.map(item => `${item.month}: ${item.count}件`));
    
    // 0件の月も含まれているか確認
    const hasZeroMonths = monthlyStats.some(item => item.count === 0);
    console.log('0件の月を含むか:', hasZeroMonths ? 'はい' : 'いいえ');
    
    // 0件の月があれば、それらを表示
    if (hasZeroMonths) {
      const zeroMonths = monthlyStats.filter(item => item.count === 0).map(item => item.month);
      console.log('0件の月:', zeroMonths.join(', '));
    }
  }, [monthlyStats]);

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-40 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">月間統計</h2>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-700">月間紹介数推移</h3>
          {monthlyStats.length > 1 && (
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">
                {monthlyStats[monthlyStats.length - 1].count > monthlyStats[monthlyStats.length - 2].count 
                  ? `前月比 +${monthlyStats[monthlyStats.length - 1].count - monthlyStats[monthlyStats.length - 2].count}件` 
                  : `前月比 ${monthlyStats[monthlyStats.length - 1].count - monthlyStats[monthlyStats.length - 2].count}件`}
              </span>
            </div>
          )}
        </div>
        
        <div className="h-40 bg-gray-50 rounded-lg border border-gray-200 flex items-end justify-between p-4">
          {monthlyStats.map((item) => (
            <div key={item.month} className="flex flex-col items-center">
              <div 
                className="bg-indigo-500 w-10" 
                style={{ 
                  height: `${Math.max(20, Math.min(100, item.count * 10 + 20))}px` 
                }}
              ></div>
              <span className="text-xs mt-2">{item.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReferralMonthlyStats;