import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import DashboardLayout from './DashboardLayout';
import ProjectList from './ProjectList';
import ActivityLog from './ActivityLog';
import { FileText, Users, MessageSquare, Calendar } from 'lucide-react';
import { supabase, getRecentActivities } from '../lib/supabase';
import DateRangeSelector from './dashboard/DateRangeSelector';
import RecentAgenciesWithRevenue from './dashboard/RecentAgenciesWithRevenue';
import RecentAnnouncement from './dashboard/RecentAnnouncement';

const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // 認証チェック
  const { data: user } = useQuery('user', async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/');
      throw new Error('Not authenticated');
    }
    return user;
  }, {
    retry: false,
    onError: () => navigate('/')
  });

  // ダッシュボードデータの取得
  const { data: dashboardData, isLoading, error } = useQuery(
    ['clientDashboardData', user?.id, dateRange],
    async () => {
      if (!user?.id) return null;

      // 統計情報の取得
      const [{ count: activeCampaignsCount }, { count: totalCampaignsCount }, activitiesData] = await Promise.all([
        supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('agency_id', user.id).eq('status', 'in_progress'),
        supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('agency_id', user.id),
        getRecentActivities(user.id)
      ]);

      return {
        stats: {
          activeCampaigns: activeCampaignsCount || 0,
          totalCampaigns: totalCampaignsCount || 0
        },
        activities: activitiesData
      };
    },
    {
      enabled: !!user?.id,
      staleTime: 60 * 1000, // 1分間はデータを新鮮と見なす
    }
  );

  const statItems = [
    { name: '進行中の案件', value: String(dashboardData?.stats.activeCampaigns || 0), icon: FileText },
    { name: '総案件数', value: String(dashboardData?.stats.totalCampaigns || 0), icon: Users },
    { name: 'Airワーク', value: 'スカウト代行', icon: MessageSquare },
    { name: '次回面談予定', value: '未定', icon: Calendar }
  ];

  return (
    <DashboardLayout userType="client">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            データの取得に失敗しました。
          </div>
        )}

        {/* 日付範囲選択 */}
        <div className="flex justify-end">
          <DateRangeSelector
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onStartDateChange={(date) => setDateRange(prev => ({ ...prev, startDate: date }))}
            onEndDateChange={(date) => setDateRange(prev => ({ ...prev, endDate: date }))}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            // スケルトンローディング
            Array(4).fill(0).map((_, index) => (
              <div key={index} className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-gray-200 h-6 w-6 rounded-full"></div>
                    <div className="ml-5 w-0 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            statItems.map((stat) => {
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
            })
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">スカウト一覧</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {isLoading ? "読み込み中..." : `${dashboardData?.stats.totalCampaigns || 0}件のスカウト依頼があります`}
                    </p>
                  </div>
                </div>
              </div>
              {isLoading ? (
                <div className="border-t border-gray-200 p-6">
                  <div className="animate-pulse space-y-4">
                    {Array(3).fill(0).map((_, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <ProjectList userType="client" />
              )}
            </div>
          </div>
          <div className="space-y-6">
            {/* 最近の代理店と売上金額 */}
            <RecentAgenciesWithRevenue 
              dateRange={dateRange}
              limit={5}
            />
            
            {/* お知らせ */}
            <RecentAnnouncement />
            
            {/* アクティビティログ */}
            <ActivityLog activities={dashboardData?.activities || []} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;