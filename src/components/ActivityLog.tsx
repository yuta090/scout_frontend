import React from 'react';
import { Activity } from '../lib/supabase';
import { FileText, UserPlus, MessageSquare, Calendar } from 'lucide-react';

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

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h2 className="text-lg font-medium text-gray-900">アクティビティログ</h2>
      </div>
      <div className="border-t border-gray-200">
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
                    {activity.details.message}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDate(activity.created_at)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ActivityLog;