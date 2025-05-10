import React from 'react';
import { FileText, UserPlus, MessageSquare, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

interface RecentActivitiesProps {
  activities: any[];
  isLoading: boolean;
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ activities, isLoading }) => {
  // アクティビティアイコン
  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'customer_created':
        return <UserPlus className="h-5 w-5 text-blue-500" />;
      case 'campaign_created':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'customer_updated':
        return <MessageSquare className="h-5 w-5 text-yellow-500" />;
      default:
        return <Calendar className="h-5 w-5 text-gray-500" />;
    }
  };

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

  // ロール表示の変換
  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'agency':
        return '代理店';
      case 'client':
        return 'クライアント';
      case 'admin':
        return '管理者';
      default:
        return role || '';
    }
  };

  console.log('RecentActivities - activities:', activities);
  console.log('RecentActivities - activities with roles:', activities.map(a => ({
    id: a.id,
    message: a.details?.message,
    role: a.details?.role,
    profiles: a.profiles
  })));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">最近のアクティビティ</h2>
      
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start">
              <div className="h-5 w-5 bg-gray-200 rounded-full mt-1"></div>
              <div className="ml-3 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity: any) => (
            <div key={activity.id} className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.action)}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {activity.details?.message || activity.action}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-gray-500 mr-2">
                    {formatRelativeTime(activity.created_at)}
                  </span>
                  {activity.details?.role && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">
                      {getRoleDisplay(activity.details.role)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">アクティビティがありません</p>
      )}
    </div>
  );
};

export default RecentActivities;