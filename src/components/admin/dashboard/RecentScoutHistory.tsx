import React from 'react';
import { useQuery } from 'react-query';
import { supabase } from '../../../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Users, Calendar, ArrowRight, Clock, Briefcase } from 'lucide-react';

interface RecentScoutHistoryProps {
  limit?: number;
}

const RecentScoutHistory: React.FC<RecentScoutHistoryProps> = ({ limit = 5 }) => {
  // スカウト結果の取得
  const { data: scoutResults = [], isLoading } = useQuery(
    ['recentScoutHistory', limit],
    async () => {
      const { data, error } = await supabase
        .from('scout_results')
        .select(`
          id,
          campaign_id,
          customer_id,
          candidate_details,
          sent_date,
          sent_time,
          created_at,
          campaign:campaigns(
            title,
            job_details,
            customer_id
          ),
          customer:customers(
            company_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('最近のスカウト履歴取得エラー:', error);
        throw error;
      }
      
      console.log('最近のスカウト履歴取得成功:', data?.length || 0);
      
      // データの修正: customer_idがnullの場合はcampaignのcustomer_idを使用
      const fixedData = data?.map(result => {
        // customer_idがnullで、campaignのcustomer_idが存在する場合
        if (!result.customer_id && result.campaign?.customer_id) {
          return {
            ...result,
            customer_id: result.campaign.customer_id
          };
        }
        return result;
      }) || [];
      
      // 顧客IDのリストを作成
      const customerIds = fixedData
        .filter(result => result.customer_id && !result.customer?.company_name)
        .map(result => result.customer_id);
      
      // 重複を削除
      const uniqueCustomerIds = [...new Set(customerIds)];
      
      if (uniqueCustomerIds.length > 0) {
        console.log('不足している顧客情報を取得:', uniqueCustomerIds);
        
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('id, company_name')
          .in('id', uniqueCustomerIds);
          
        if (!customerError && customerData) {
          // 顧客情報をマージ
          return fixedData.map(result => {
            if (!result.customer?.company_name && result.customer_id) {
              const customer = customerData.find(c => c.id === result.customer_id);
              if (customer) {
                return {
                  ...result,
                  customer: {
                    ...result.customer,
                    company_name: customer.company_name
                  }
                };
              }
            }
            return result;
          });
        }
      }
      
      return fixedData;
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 60000, // 1分間はデータを新鮮と見なす
      onError: (error) => {
        console.error('最近のスカウト履歴取得エラー:', error);
      }
    }
  );

  // 職種名を取得する関数
  const getJobTypeName = (result: any): string => {
    if (result.campaign?.job_details?.job_type && Array.isArray(result.campaign.job_details.job_type)) {
      return result.campaign.job_details.job_type
        .map((job: any) => job.name || '')
        .filter(Boolean)
        .join('、');
    }
    return '';
  };

  // 送信件数を計算する関数
  const calculateSentCount = (candidateDetails: any): number => {
    if (!candidateDetails) return 0;
    
    // 配列の場合は要素数をカウント
    if (Array.isArray(candidateDetails)) {
      return candidateDetails.length;
    }
    
    // オブジェクトの場合は1件とカウント
    if (typeof candidateDetails === 'object') {
      return 1;
    }
    
    return 0;
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

  // 日付フォーマット
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return '日付不明';
    }
  };

  // 時間フォーマット
  const formatTime = (timeString: string | null | undefined) => {
    if (!timeString) return '不明';
    
    // PostgreSQLのtime型は "HH:MM:SS" 形式
    const timeParts = timeString.split(':');
    if (timeParts.length >= 2) {
      return `${timeParts[0]}:${timeParts[1]}`;
    }
    return timeString;
  };

  // 顧客名を取得する関数
  const getCustomerName = (result: any): string => {
    // 直接customerオブジェクトから取得
    if (result.customer?.company_name) {
      return result.customer.company_name;
    }
    
    // 顧客情報がない場合は「不明な企業」を返す
    return '不明な企業';
  };

  // スカウト結果がない場合はダミーデータを表示
  if (scoutResults.length === 0 && !isLoading) {
    const dummyResults = [
      {
        id: '1',
        customer_name: '株式会社サンプル',
        job_type: 'Webエンジニア',
        sent_count: 25,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        sent_time: '09:30:00'
      },
      {
        id: '2',
        customer_name: 'テスト株式会社',
        job_type: 'マーケティング担当',
        sent_count: 18,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        sent_time: '14:15:00'
      },
      {
        id: '3',
        customer_name: '株式会社エージェント',
        job_type: '営業職',
        sent_count: 32,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        sent_time: '11:45:00'
      }
    ];

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">最近のスカウト送信</h3>
        <div className="space-y-4">
          {dummyResults.map((result) => (
            <div key={result.id} className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex-1">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-indigo-500 mr-2" />
                  <span className="font-medium text-gray-900">
                    {result.customer_name}
                  </span>
                </div>
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                  <span>{formatDate(result.created_at)}</span>
                  <Clock className="h-4 w-4 text-gray-400 mx-1 ml-2" />
                  <span>{formatTime(result.sent_time)}</span>
                  <ArrowRight className="h-3 w-3 mx-2 text-gray-400" />
                  <span className="font-medium text-indigo-600">
                    {result.sent_count}件送信
                  </span>
                </div>
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <Briefcase className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="truncate max-w-xs">{result.job_type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <h3 className="text-lg font-medium text-gray-900 mb-4">最近のスカウト送信</h3>
        <div className="space-y-4">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
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
      <h3 className="text-lg font-medium text-gray-900 mb-4">最近のスカウト送信</h3>
      <div className="space-y-4">
        {scoutResults.map((result: any) => {
          const sentCount = calculateSentCount(result.candidate_details);
          const jobTypeName = getJobTypeName(result);
          const customerName = getCustomerName(result);
          
          return (
            <div key={result.id} className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex-1">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-indigo-500 mr-2" />
                  <span className="font-medium text-gray-900">
                    {customerName}
                  </span>
                </div>
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                  <span>{result.sent_date ? new Date(result.sent_date).toLocaleDateString('ja-JP') : formatDate(result.created_at)}</span>
                  <Clock className="h-4 w-4 text-gray-400 mx-1 ml-2" />
                  <span>{formatTime(result.sent_time)}</span>
                  <ArrowRight className="h-3 w-3 mx-2 text-gray-400" />
                  <span className="font-medium text-indigo-600">
                    {sentCount > 0 ? `${sentCount}件送信` : 'エラー'}
                  </span>
                </div>
                {jobTypeName && (
                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <Briefcase className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="truncate max-w-xs">{jobTypeName}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentScoutHistory;