import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import CustomerManagement from './CustomerManagement';
import CampaignForm from './campaign/CampaignForm';
import { supabase, getRecentActivities, type Activity, executeWithRetry } from '../lib/supabase';

// 新しく作成したコンポーネントをインポート
import DateRangeSelector from './dashboard/DateRangeSelector';
import TabNavigation from './dashboard/TabNavigation';
import DashboardContent from './dashboard/DashboardContent';
import ErrorDisplay from './dashboard/ErrorDisplay';

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
  const [campaignCount, setCampaignCount] = useState<number | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  // データ取得を最適化
  const fetchDashboardData = useCallback(async (userId: string) => {
    if (!navigator.onLine) {
      setError('インターネット接続がありません。接続を確認してください。');
      return;
    }

    try {
      setIsStatsLoading(true);
      setError(null);
      console.log('Fetching dashboard data for user:', userId);
      
      // 並列でデータを取得
      const [
        customersResult,
        activeCampaignsResult,
        campaignsResult,
        totalCampaignsResult
      ] = await Promise.all([
        executeWithRetry(() =>
          supabase.from('customers')
            .select('*', { count: 'exact' })
            .eq('agency_id', userId)
        ),
        executeWithRetry(() =>
          supabase.from('campaigns')
            .select('*')
            .eq('agency_id', userId)
            .eq('status', 'in_progress')
            .gte('created_at', dateRange.startDate)
            .lte('created_at', dateRange.endDate)
        ),
        executeWithRetry(() =>
          supabase.from('campaigns')
            .select('total_amount')
            .eq('agency_id', userId)
            .gte('created_at', dateRange.startDate)
            .lte('created_at', dateRange.endDate)
        ),
        executeWithRetry(() =>
          supabase.from('campaigns')
            .select('*', { count: 'exact' })
            .eq('agency_id', userId)
        )
      ]);

      // エラーチェック
      const errors = [
        { name: 'customers', error: customersResult.error },
        { name: 'activeCampaigns', error: activeCampaignsResult.error },
        { name: 'campaigns', error: campaignsResult.error },
        { name: 'totalCampaigns', error: totalCampaignsResult.error }
      ].filter(e => e.error);

      if (errors.length > 0) {
        const errorMessages = errors.map(e => `${e.name}: ${e.error.message}`).join(', ');
        throw new Error(`データ取得エラー: ${errorMessages}`);
      }

      // データを設定
      setStats({
        totalCustomers: customersResult.count || 0,
        activeCampaigns: activeCampaignsResult.data?.length || 0,
        totalRevenue: campaignsResult.data?.reduce((sum, campaign) => sum + (campaign.total_amount || 0), 0) || 0
      });

      setCampaignCount(totalCampaignsResult.count || 0);
      
      // アクティビティを取得
      try {
        const activitiesData = await executeWithRetry(() => getRecentActivities(userId));
        setActivities(activitiesData);
      } catch (activityError) {
        console.error('Error fetching activities:', activityError);
        // アクティビティの取得エラーは致命的ではないため、メインのエラーとしては扱わない
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'データの取得に失敗しました。');
    } finally {
      setIsStatsLoading(false);
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const maxRetries = 3;
        let retryCount = 0;
        let lastError;

        while (retryCount < maxRetries) {
          try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            
            if (authError) throw authError;
            if (!user) {
              navigate('/');
              return;
            }

            console.log('Current user:', user);

            // 直接RPC関数を使用してロールを取得
            const { data: role, error: roleError } = await supabase
              .rpc('get_user_role', { user_id: user.id });

            if (roleError) {
              console.error('Error fetching user role:', roleError);
              throw roleError;
            }

            console.log('User role:', role);
            
            // 代理店ロールでない場合はリダイレクト
            if (role !== 'agency') {
              console.log('User is not an agency, redirecting to home');
              navigate('/');
              return;
            }

            await fetchDashboardData(user.id);
            return; // Success, exit the retry loop
          } catch (error) {
            lastError = error;
            retryCount++;
            console.error(`Auth check attempt ${retryCount} failed:`, error);
            
            if (retryCount < maxRetries) {
              // Exponential backoff
              const delay = Math.pow(2, retryCount) * 1000;
              console.log(`Retrying in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
        }

        // If we get here, all retries failed
        console.error('Auth check failed after retries:', lastError);
        setError('認証に失敗しました。ページを再読み込みしてください。');
        navigate('/');
      } catch (err) {
        console.error('Auth check error:', err);
        navigate('/');
      }
    };

    checkAuth();
  }, [navigate, fetchDashboardData]);

  const handleNewProject = useCallback(() => {
    setSelectedCustomerId(null);
    setShowCampaignForm(true);
  }, []);

  const handleCampaignSave = useCallback(() => {
    setShowCampaignForm(false);
    setProjectListKey(prev => prev + 1);
  }, []);

  return (
    <DashboardLayout userType="agency">
      <div className="space-y-6">
        <ErrorDisplay error={error} />

        {/* タブナビゲーションと日付選択を同じ行に配置 */}
        <div className="border-b border-gray-200 flex justify-between items-center">
          <TabNavigation 
            activeTab={activeTab} 
            onTabChange={(tab) => setActiveTab(tab)} 
          />
          
          {/* 日付範囲選択 - 右端に配置 */}
          <DateRangeSelector 
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onStartDateChange={(date) => setDateRange(prev => ({ ...prev, startDate: date }))}
            onEndDateChange={(date) => setDateRange(prev => ({ ...prev, endDate: date }))}
          />
        </div>

        {activeTab === 'dashboard' ? (
          <DashboardContent 
            stats={stats}
            activities={activities}
            isStatsLoading={isStatsLoading}
            campaignCount={campaignCount}
            projectListKey={projectListKey}
            onNewProject={handleNewProject}
            onCampaignSave={handleCampaignSave}
          />
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