import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import ProjectList from './ProjectList';
import ActivityLog from './ActivityLog';
import { FileText, Users, MessageSquare, Calendar } from 'lucide-react';
import { supabase, getRecentActivities, type Activity } from '../lib/supabase';

const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    activeCampaigns: 0,
    totalCampaigns: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/');
          return;
        }

        // 統計情報の取得
        const [{ count: activeCampaignsCount }, { count: totalCampaignsCount }, activitiesData] = await Promise.all([
          supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('agency_id', user.id).eq('status', 'in_progress'),
          supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('agency_id', user.id),
          getRecentActivities(user.id)
        ]);

        setStats({
          activeCampaigns: activeCampaignsCount || 0,
          totalCampaigns: totalCampaignsCount || 0
        });

        setActivities(activitiesData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('データの取得に失敗しました。');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const statItems = [
    { name: '進行中の案件', value: String(stats.activeCampaigns), icon: FileText },
    { name: '総案件数', value: String(stats.totalCampaigns), icon: Users },
    { name: 'Airワーク', value: 'スカウト代行', icon: MessageSquare },
    { name: '次回面談予定', value: '未定', icon: Calendar }
  ];

  if (isLoading) {
    return (
      <DashboardLayout userType="client">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="client">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statItems.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.name}
                className="bg-white overflow-hidden shadow rounded-lg"
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {stat.name}
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {stat.value}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ProjectList userType="client" />
          </div>
          <div>
            <ActivityLog activities={activities} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;