import React from 'react';
import { Activity } from '../lib/supabase';
import { FileText, UserPlus, MessageSquare, Calendar, Building2, CheckCircle, Link } from 'lucide-react';

interface ActivityLogProps {
  activities: Activity[];
}

const ActivityLog: React.FC<ActivityLogProps> = ({ activities }) => {
  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'project_created':
        return <FileText className="h-5 w-5 text-indigo-600" />;
      case 'user_added':
        return <UserPlus className="h-5 w-5 text-green-600" />;
      case 'message_sent':
        return <MessageSquare className="h-5 w-5 text-blue-600" />;
      case 'meeting_scheduled':
        return <Calendar className="h-5 w-5 text-purple-600" />;
      case 'customer_created':
        return <Building2 className="h-5 w-5 text-orange-600" />;
      case 'referral_converted':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'referral_lead_assigned':
        return <Link className="h-5 w-5 text-blue-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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
      case 'referral_agent':
        return '取次代理店';
      default:
        return role || '';
    }
  };

  // スケルトンローディング
  const ActivitySkeleton = () => (
    <div className="space-y-3 p-4">
      {Array(5).fill(0).map((_, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div className="rounded-full bg-gray-200 h-8 w-8 animate-pulse"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-1 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // 現在のユーザーのロールを取得
  const currentUserRole = (() => {
    // 現在のURLからロールを推測
    const path = window.location.pathname;
    if (path.includes('/admin/')) return 'admin';
    if (path.includes('/agency/')) return 'agency';
    if (path.includes('/client/')) return 'client';
    if (path.includes('/referral-dashboard')) return 'referral_agent';
    return null;
  })();

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h2 className="text-lg font-medium text-gray-900">アクティビティログ</h2>
      </div>
      <div className="border-t border-gray-200">
        {activities === undefined || activities === null ? (
          <ActivitySkeleton />
        ) : activities.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {activities.map((activity) => (
              <li key={activity.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      {getActivityIcon(activity.action)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.details?.message}
                    </p>
                    <div className="flex items-center mt-1">
                      <p className="text-sm text-gray-500">
                        {formatDate(activity.created_at)}
                      </p>
                      {/* 管理者の場合のみロールと会社名を表示 */}
                      {currentUserRole === 'admin' && activity.details?.role && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {activity.details?.company_name ? `${activity.details?.company_name} (` : ''}
                          {getRoleDisplay(activity.details?.role)}
                          {activity.details?.company_name ? ')' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-4 py-6 text-center text-gray-500">
            <p className="text-sm">アクティビティはありません</p>
            <p className="text-xs mt-1">アクティビティが発生すると、ここに表示されます</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;