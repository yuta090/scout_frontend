import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, getRecentActivities } from '../../lib/supabase';
import DashboardLayout from '../DashboardLayout';
import ActivityLog from '../ActivityLog';
import DateRangeSelector from '../dashboard/DateRangeSelector';
import ReferralLeadsList from './ReferralLeadsList';
import ReferralLinkSection from './ReferralLinkSection';
import ReferralStatCards from './ReferralStatCards';
import ReferralStatusSummary from './ReferralStatusSummary';
import ReferralMonthlyStats from './ReferralMonthlyStats';
import { isValidUUID } from '../../lib/utils';
import RecentAnnouncement from '../dashboard/RecentAnnouncement';

const ReferralDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [stats, setStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    totalCommission: 0,
    pendingLeads: 0,
    contactedLeads: 0,
    convertedLeads: 0,
    conversionRate: 0
  });
  const [referralLink, setReferralLink] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<{month: string, count: number}[]>([]);

  // 紹介リンクを取得する関数
  const fetchReferralLink = useCallback(async (userId: string) => {
    if (!isValidUUID(userId)) {
      console.warn('Invalid user ID for referral link:', userId);
      return '';
    }

    try {
      // 紹介リンクを生成
      const baseUrl = window.location.origin;
      return `${baseUrl}/entry?ref=${userId}`;
    } catch (error) {
      console.error('Error fetching referral link:', error);
      return '';
    }
  }, []);

  // 紹介統計情報を取得する関数
  const fetchReferralStats = useCallback(async (userId: string) => {
    if (!isValidUUID(userId)) {
      console.warn('Invalid user ID for referral stats:', userId);
      return {
        total_leads: 0,
        pending_leads: 0,
        contacted_leads: 0,
        converted_leads: 0,
        rejected_leads: 0,
        conversion_rate: 0
      };
    }

    try {
      const { data, error } = await supabase.rpc('get_referral_stats', {
        p_agent_id: userId
      });

      if (error) throw error;
      
      if (data && data.length > 0) {
        return data[0];
      }
      
      return {
        total_leads: 0,
        pending_leads: 0,
        contacted_leads: 0,
        converted_leads: 0,
        rejected_leads: 0,
        conversion_rate: 0
      };
    } catch (error) {
      console.error('Error fetching referral stats:', error);
      return {
        total_leads: 0,
        pending_leads: 0,
        contacted_leads: 0,
        converted_leads: 0,
        rejected_leads: 0,
        conversion_rate: 0
      };
    }
  }, []);

  // 月間統計データを生成する関数
  const generateMonthlyStats = useCallback(async (leads) => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = month.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short' });
      months.push({
        month: monthStr,
        date: month,
        count: 0
      });
    }
    
    console.log('月間統計の初期データ:', months.map(m => `${m.month}: ${m.count}件`));
    
    if (leads && leads.length > 0) {
      console.log(`紹介リード ${leads.length}件 の月間分布を計算中...`);
      
      leads.forEach(lead => {
        const leadDate = new Date(lead.created_at);
        console.log(`リード(${lead.id}): ${lead.company_name} - ${new Date(lead.created_at).toLocaleDateString('ja-JP')}`);
        
        months.forEach(monthData => {
          const monthStart = new Date(monthData.date);
          const monthEnd = new Date(monthData.date.getFullYear(), monthData.date.getMonth() + 1, 0);
          
          if (leadDate >= monthStart && leadDate <= monthEnd) {
            monthData.count++;
            console.log(`  → ${monthData.month}に加算 (現在: ${monthData.count}件)`);
          }
        });
      });
    }
    
    console.log('月間統計の最終データ:', months.map(m => `${m.month}: ${m.count}件`));
    
    return months;
  }, []);

  // データ取得を最適化
  const fetchDashboardData = useCallback(async (userId: string) => {
    if (!userId || !isValidUUID(userId)) {
      setError('ユーザーIDが無効です');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setUserId(userId);
      console.log('取次代理店ダッシュボードデータを取得中: ユーザーID =', userId);
      
      // 紹介リンクを取得
      const link = await fetchReferralLink(userId);
      setReferralLink(link);
      
      // 紹介統計情報を取得
      const statsData = await fetchReferralStats(userId);
      
      // 紹介リードを取得
      const { data: leads, error: leadsError } = await supabase
        .from('referral_leads')
        .select('*')
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false });
        
      if (leadsError) throw leadsError;
      
      console.log(`紹介リード取得: ${leads?.length || 0}件`);
      
      // 月間統計データを生成
      const monthlyData = await generateMonthlyStats(leads);
      setMonthlyStats(monthlyData);
      
      // 統計情報を設定
      setStats({
        totalReferrals: leads?.length || 0,
        activeReferrals: leads?.filter(lead => lead.status === 'converted').length || 0,
        totalCommission: (leads?.filter(lead => lead.status === 'converted').length || 0) * 50000,
        pendingLeads: statsData.pending_leads || 0,
        contactedLeads: statsData.contacted_leads || 0,
        convertedLeads: statsData.converted_leads || 0,
        conversionRate: statsData.conversion_rate || 0
      });
      
      // アクティビティを取得
      try {
        console.log('アクティビティを取得中: ユーザーID =', userId);
        const activitiesData = await getRecentActivities(userId);
        console.log('アクティビティ取得成功:', activitiesData?.length || 0);
        setActivities(activitiesData);
      } catch (activityError) {
        console.error('アクティビティ取得エラー:', activityError);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('データの取得に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  }, [fetchReferralLink, fetchReferralStats, generateMonthlyStats]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/');
          return;
        }

        // ユーザーIDの検証
        if (!isValidUUID(user.id)) {
          console.error('無効なユーザーID:', user.id);
          setError('無効なユーザーIDです');
          navigate('/');
          return;
        }
        
        // ユーザーのロールを確認
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, agency_type')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          navigate('/');
          return;
        }
        
        // 取次代理店でない場合はリダイレクト
        if (profile?.role !== 'referral_agent') {
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

  return (
    <DashboardLayout userType="referral_agent">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* 紹介リンクセクション */}
        <ReferralLinkSection referralLink={referralLink} />

        {/* 日付範囲選択 */}
        <div className="flex justify-end">
          <DateRangeSelector 
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onStartDateChange={(date) => setDateRange(prev => ({ ...prev, startDate: date }))}
            onEndDateChange={(date) => setDateRange(prev => ({ ...prev, endDate: date }))}
          />
        </div>

        {/* 統計カード */}
        <ReferralStatCards stats={stats} isLoading={isLoading} />

        {/* 紹介状況 */}
        <ReferralStatusSummary stats={stats} isLoading={isLoading} />

        {/* メインコンテンツ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 紹介企業リスト */}
          <div className="lg:col-span-2">
            <ReferralLeadsList referrerId={userId || ''} />
          </div>
          
          {/* サイドバー */}
          <div>
            {/* お知らせ */}
            <RecentAnnouncement />
            
            {/* アクティビティログ */}
            <ActivityLog activities={activities} />
          </div>
        </div>

        {/* 月間統計 */}
        <ReferralMonthlyStats 
          monthlyStats={monthlyStats} 
          isLoading={isLoading} 
        />
      </div>
    </DashboardLayout>
  );
};

export default ReferralDashboard;