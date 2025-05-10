import React, { memo } from 'react';
import { FileText, UserPlus, MessageSquare, Calendar, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { Activity } from '../../../lib/types';

interface RecentActivitiesProps {
  activities: Activity[];
  isLoading: boolean;
}

// メモ化したコンポーネントを作成
const RecentActivities: React.FC<RecentActivitiesProps> = memo(({ activities, isLoading }) => {
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
        return <Clock className="h-5 w-5 text-gray-500" />;
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

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <h2 className="text-lg font-medium text-gray-900 mb-4">最近のアクティビティ</h2>
        <div className="space-y-4">
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
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">最近のアクティビティ</h2>
      
      {activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity: Activity) => (
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
                  {/* プロフィール情報を表示 - 優先順位: profiles > details */}
                  {(activity.profiles?.role || activity.details?.role) && (
                    <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {/* 会社名の表示 - 優先順位: profiles > details */}
                      {(activity.profiles?.company_name || activity.details?.company_name) ? 
                        `${activity.profiles?.company_name || activity.details?.company_name} (` : ''}
                      {/* ロールの表示 - 優先順位: profiles > details */}
                      {getRoleDisplay(activity.profiles?.role || activity.details?.role)}
                      {(activity.profiles?.company_name || activity.details?.company_name) ? ')' : ''}
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
});

// 静的プロパティを追加
RecentActivities.logged = false;
// displayName を設定
RecentActivities.displayName = 'RecentActivities';

export default RecentActivities;