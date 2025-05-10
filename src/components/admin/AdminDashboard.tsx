import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import { 
  Users, Building2, FileText, CheckCircle, 
  AlertCircle, Clock, BarChart2, TrendingUp
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import { supabase, getRecentActivities } from '../../lib/supabase';
import ScoutHistory from './ScoutHistory';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import RecentScoutHistory from './dashboard/RecentScoutHistory';
import RecentActivities from './dashboard/RecentActivities';
import AdminStats from './dashboard/AdminStats';
import RecentCampaigns from './dashboard/RecentCampaigns';
import RecentAnnouncement from '../dashboard/RecentAnnouncement';

interface AdminStats {
  agencyCount: number;
  clientCount: number;
  campaignCount: number;
  activeCampaignCount: number;
  totalRevenue: number;
  periodCampaignCount: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminStats>({
    agencyCount: 0,
    clientCount: 0,
    campaignCount: 0,
    activeCampaignCount: 0,
    totalRevenue: 0,
    periodCampaignCount: 0
  });
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [projectListKey, setProjectListKey] = useState(0);
  const [campaignCount, setCampaignCount] = useState<number | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  // コンポーネントがマウントされたときにデバッグ情報を出力
  React.useEffect(() => {
    console.log('AdminDashboard: コンポーネントがマウントされました');
    console.log('AdminDashboard: QueryClient の状態:', {
      available: !!queryClient,
      defaultOptions: queryClient?.getDefaultOptions(),
    });
  }, [queryClient]);

  // 認証チェック
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('管理者ダッシュボードの認証チェック開始');
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('ユーザーなし、ログイン画面へリダイレクト');
          navigate('/admin/login');
          return;
        }

        console.log('ユーザー取得成功:', user.id);

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('プロフィール取得エラー:', profileError);
          navigate('/admin/login');
          return;
        }

        console.log('プロフィール取得成功:', profile);

        if (profile?.role !== 'admin') {
          // 管理者でない場合はログインページにリダイレクト
          console.log('管理者権限なし、ログイン画面へリダイレクト');
          navigate('/admin/login');
        } else {
          console.log('管理者権限確認、ダッシュボード表示');
        }
      } catch (err) {
        console.error('Auth check error:', err);
        navigate('/admin/login');
      }
    };

    checkAuth();
  }, [navigate]);

  // 管理者統計情報の取得
  const { data: statsData, isLoading: isStatsQueryLoading, refetch: refetchStats } = useQuery(
    ['adminDashboardStats', dateRange.startDate, dateRange.endDate],
    async () => {
      console.log('管理者統計情報の取得開始');
      
      // 直接SQLで統計情報を取得
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_admin_dashboard_stats');

      if (statsError) {
        console.error('統計情報取得エラー:', statsError);
        throw statsError;
      }

      console.log('統計情報取得成功:', statsData);
      return statsData;
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5分間はデータを新鮮と見なす
      cacheTime: 10 * 60 * 1000, // 10分間キャッシュを保持
      retry: 3, // 失敗時に3回リトライ
      retryDelay: 1000, // リトライ間隔を1秒に設定
      onSuccess: (data) => {
        console.log('統計情報取得成功、データを処理します:', data);
        if (data && data.length > 0) {
          const adminStats = data[0];
          
          setStats({
            agencyCount: adminStats.agency_count || 0,
            clientCount: adminStats.client_count || 0,
            campaignCount: adminStats.campaign_count || 0,
            activeCampaignCount: adminStats.active_campaign_count || 0,
            totalRevenue: adminStats.total_revenue || 0,
            periodCampaignCount: adminStats.period_campaign_count || 0
          });
          console.log('統計情報を状態に設定しました:', {
            agencyCount: adminStats.agency_count || 0,
            clientCount: adminStats.client_count || 0,
            campaignCount: adminStats.campaign_count || 0,
            activeCampaignCount: adminStats.active_campaign_count || 0,
            totalRevenue: adminStats.total_revenue || 0,
            periodCampaignCount: adminStats.period_campaign_count || 0
          });
        }
        setIsStatsLoading(false);
      },
      onError: (error) => {
        console.error('統計情報取得エラー:', error);
        setError('統計データの取得に失敗しました');
        setIsStatsLoading(false);
      }
    }
  );

  // アクティビティとキャンペーンデータの取得
  const fetchDashboardData = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      console.log('ダッシュボードデータの取得開始');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('認証エラー');
      
      // アクティビティを取得
      try {
        const activities = await getRecentActivities(user.id);
        console.log('アクティビティ取得成功:', activities.length);
        
        // キャッシュに保存
        queryClient.setQueryData(['adminActivities'], activities);
      } catch (activityError) {
        console.error('アクティビティ取得エラー:', activityError);
      }

      // 最近のキャンペーンを取得
      const { data: recentCampaigns, error: recentCampaignsError } = await supabase
        .from('campaigns')
        .select(`
          id,
          title,
          status,
          created_at,
          customers (
            company_name
          ),
          profiles:agency_id (
            company_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentCampaignsError) throw recentCampaignsError;
      console.log('最近のキャンペーン取得成功:', recentCampaigns?.length || 0);
      
      // キャッシュに保存
      queryClient.setQueryData(['adminRecentCampaigns'], recentCampaigns || []);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('データの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [queryClient]);

  // データの取得
  useEffect(() => {
    const fetchData = async () => {
      console.log('ダッシュボードデータ取得処理を開始します');
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.log('ユーザーID:', user.id, 'のデータを取得します');
        await fetchDashboardData(user.id);
        
        // 統計情報を明示的に再取得
        console.log('統計情報を再取得します');
        try {
          await refetchStats();
          console.log('統計情報の再取得に成功しました');
        } catch (statsError) {
          console.error('統計情報の再取得に失敗しました:', statsError);
        }
      } else {
        console.log('ユーザーが見つかりません');
      }
    };
    
    fetchData();
  }, [fetchDashboardData, refetchStats]);

  // 他のページから戻ってきた時に統計情報を再取得
  useEffect(() => {
    const handleFocus = () => {
      console.log('ウィンドウフォーカス検出、統計情報を再取得');
      refetchStats()
        .then(() => console.log('フォーカス時の統計情報再取得成功'))
        .catch(err => console.error('フォーカス時の統計情報再取得失敗:', err));
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [refetchStats]);

  // キャッシュからアクティビティを取得
  const activities = queryClient.getQueryData(['adminActivities']) || [];
  
  // キャッシュからキャンペーンを取得
  const recentCampaigns = queryClient.getQueryData(['adminRecentCampaigns']) || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">管理者ダッシュボード</h1>
          
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => {
                console.log('開始日変更:', e.target.value);
                setDateRange(prev => ({ ...prev, startDate: e.target.value }));
                // 日付変更時に統計情報を再取得
                setTimeout(() => {
                  console.log('開始日変更による統計情報再取得を実行');
                  refetchStats()
                    .then(() => console.log('開始日変更による統計情報再取得成功'))
                    .catch(err => console.error('開始日変更による統計情報再取得失敗:', err));
                }, 100);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            <span className="text-gray-500">〜</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => {
                console.log('終了日変更:', e.target.value);
                setDateRange(prev => ({ ...prev, endDate: e.target.value }));
                // 日付変更時に統計情報を再取得
                setTimeout(() => {
                  console.log('終了日変更による統計情報再取得を実行');
                  refetchStats()
                    .then(() => console.log('終了日変更による統計情報再取得成功'))
                    .catch(err => console.error('終了日変更による統計情報再取得失敗:', err));
                }, 100);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* 統計カード */}
        <AdminStats 
          stats={stats}
          isLoading={isStatsLoading}
        />

        {/* 期間統計と最近のスカウト送信 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 最近のキャンペーン */}
          <RecentCampaigns 
            campaigns={recentCampaigns}
            isLoading={isLoading}
            dateRange={dateRange}
            stats={{
              activeCampaignCount: stats.activeCampaignCount,
              periodCampaignCount: stats.periodCampaignCount,
              totalRevenue: stats.totalRevenue
            }}
          />

          {/* 最近のスカウト送信 */}
          <RecentScoutHistory limit={5} />
        </div>

        {/* サイドバー */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {/* 最近のアクティビティ */}
            <RecentActivities 
              activities={activities}
              isLoading={isLoading}
            />
          </div>
          <div>
            {/* お知らせ */}
            <RecentAnnouncement />
          </div>
        </div>

        {/* スカウト履歴コンポーネント */}
        <ScoutHistory limit={10} />
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;