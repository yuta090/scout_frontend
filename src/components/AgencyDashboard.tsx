import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import ProjectList from './ProjectList';
import ActivityLog from './ActivityLog';
import CustomerManagement from './CustomerManagement';
import CampaignForm from './campaign/CampaignForm';
import { Building2, Users, CreditCard, Calendar } from 'lucide-react';
import { supabase, getRecentActivities, type Activity } from '../lib/supabase';

const AgencyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'customers'>('dashboard');
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCampaigns: 0,
    totalRevenue: 0
  });
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [projectListKey, setProjectListKey] = useState(0);

  // データ取得を最適化
  const fetchDashboardData = useCallback(async (userId: string) => {
    try {
      // 並列でデータを取得
      const [
        { count: customersCount }, 
        { data: activeCampaigns }, 
        { data: campaigns },
        activitiesData
      ] = await Promise.all([
        supabase.from('customers')
          .select('*', { count: 'exact', head: true })
          .eq('agency_id', userId),
        supabase.from('campaigns')
          .select('*')
          .eq('agency_id', userId)
          .eq('status', 'in_progress')
          .gte('created_at', dateRange.startDate)
          .lte('created_at', dateRange.endDate),
        supabase.from('campaigns')
          .select('total_amount')
          .eq('agency_id', userId)
          .gte('created_at', dateRange.startDate)
          .lte('created_at', dateRange.endDate),
        getRecentActivities(userId)
      ]);

      // 合計売上金額の計算
      const totalRevenue = campaigns?.reduce((sum, campaign) => sum + (campaign.total_amount || 0), 0) || 0;

      setStats({
        totalCustomers: customersCount || 0,
        activeCampaigns: activeCampaigns?.length || 0,
        totalRevenue: totalRevenue
      });

      setActivities(activitiesData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('データの取得に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/');
          return;
        }
        fetchDashboardData(user.id);
      } catch (err) {
        console.error('Auth check error:', err);
        navigate('/');
      }
    };

    checkAuth();
  }, [navigate, fetchDashboardData]);

  // 統計情報をメモ化
  const statItems = useMemo(() => [
    { name: '合計売上金額', value: `${stats.totalRevenue.toLocaleString()}円`, icon: CreditCard },
    { name: '進行中の案件', value: String(stats.activeCampaigns), icon: Building2 },
    { name: '登録顧客数', value: String(stats.totalCustomers), icon: Users }
  ], [stats]);

  const handleNewProject = useCallback(() => {
    setSelectedCustomerId(null);
    setShowCampaignForm(true);
  }, []);

  const handleCampaignSave = useCallback(() => {
    setShowCampaignForm(false);
    setProjectListKey(prev => prev + 1);
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout userType="agency">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="agency">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* タブナビゲーション */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'dashboard'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              ダッシュボード
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'customers'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              顧客管理
            </button>
          </nav>
        </div>

        {activeTab === 'dashboard' ? (
          <>
            {/* 日付範囲選択 */}
            <div className="flex justify-end items-center space-x-4">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
                <span className="text-gray-500">〜</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                <ProjectList 
                  key={projectListKey}
                  userType="agency" 
                  onNewProject={handleNewProject}
                />
              </div>
              <div>
                <ActivityLog activities={activities} />
              </div>
            </div>
          </>
        ) : (
          <CustomerManagement />
        )}

        {showCampaignForm && (
          <CampaignForm
            customerId={selectedCustomerId || undefined}
            onClose={() => setShowCampaignForm(false)}
            onSave={handleCampaignSave}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default AgencyDashboard;