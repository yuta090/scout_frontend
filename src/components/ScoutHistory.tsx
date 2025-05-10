import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Users, Calendar, ArrowRight, Clock, Briefcase } from 'lucide-react';
import { format, utcToZonedTime } from 'date-fns-tz';

interface ScoutHistoryProps {
  limit?: number;
}

interface ScoutResult {
  id: string;
  campaign_id: string;
  customer_id: string;
  candidate_details: any;
  created_at: string;
  campaign?: {
    title: string;
    job_details?: {
      job_type?: Array<{
        name: string;
      }>;
    };
    customer_id?: string;
  };
  customer?: {
    company_name: string;
  };
  sent_date?: string;
  sent_time?: string;
}

const ScoutHistory: React.FC<ScoutHistoryProps> = ({ limit = 10 }) => {
  const [scoutResults, setScoutResults] = useState<ScoutResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customerMap, setCustomerMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchScoutResults = async () => {
      try {
        setIsLoading(true);
        
        // 直接JOINを使用して顧客情報を取得
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

        if (error) throw error;
        
        console.log('スカウト履歴取得成功:', data?.length || 0);
        
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
        
        setScoutResults(fixedData);
        
        if (fixedData.length > 0) {
          console.log('最初のスカウト結果サンプル:', {
            id: fixedData[0].id,
            customer_id: fixedData[0].customer_id,
            campaign_customer_id: fixedData[0].campaign?.customer_id,
            customer: fixedData[0].customer,
            company_name: fixedData[0].customer?.company_name || '企業名なし'
          });
        }
      } catch (err) {
        console.error('Error fetching scout results:', err);
        setError('スカウト履歴の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchScoutResults();
  }, [limit]);

  // 送信件数を計算する関数 - prefecture の数をカウント
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

  // 日付をJST（日本時間）に変換する関数
  const formatDateToJST = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const jstDate = utcToZonedTime(date, 'Asia/Tokyo');
    return format(jstDate, 'yyyy年MM月dd日', { locale: ja });
  };

  // 時間フォーマット
  const formatTime = (timeString: string | null | undefined) => {
    if (!timeString) return '不明';
    
    // PostgreSQLのtime型は "HH:MM:SS" 形式
    const timeParts = timeString.split(':');
    if (timeParts.length >= 2) {
      // UTCからJST（UTC+9）に変換
      const hour = parseInt(timeParts[0], 10);
      const jstHour = (hour + 9) % 24; // 9時間を加算して24時間形式に調整
      return `${String(jstHour).padStart(2, '0')}:${timeParts[1]}`;
    }
    return timeString;
  };

  // 職種名を取得する関数
  const getJobTypeName = (result: ScoutResult): string => {
    if (result.campaign?.job_details?.job_type && Array.isArray(result.campaign.job_details.job_type)) {
      return result.campaign.job_details.job_type
        .map((job: any) => job.name || '')
        .filter(Boolean)
        .join('、');
    }
    return '';
  };

  // 顧客名を取得する関数
  const getCustomerName = (result: ScoutResult): string => {
    // 直接customerオブジェクトから取得
    if (result.customer?.company_name) {
      return result.customer.company_name;
    }
    
    // 顧客情報がない場合は「不明な企業」を返す
    return '不明な企業';
  };

  // スカウト結果がない場合はダミーデータを表示
  if (scoutResults.length === 0 && !isLoading && !error) {
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
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">最近のスカウト送信履歴</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {dummyResults.map((result) => (
            <div key={result.id} className="px-6 py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-indigo-500 mr-2" />
                    <span className="font-medium text-gray-900">
                      {result.customer_name}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                    <span>{formatRelativeTime(result.created_at)}</span>
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
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <h3 className="text-lg font-medium text-gray-900 mb-4">最近のスカウト送信履歴</h3>
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">最近のスカウト送信履歴</h3>
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-5 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">最近のスカウト送信履歴</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {scoutResults.length > 0 ? (
          scoutResults.map((result) => {
            const sentCount = calculateSentCount(result.candidate_details);
            const jobTypeName = getJobTypeName(result);
            const customerName = getCustomerName(result);
            
            return (
              <div key={result.id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-indigo-500 mr-2" />
                      <span className="font-medium text-gray-900">
                        {customerName}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                      <span>
                        {result.sent_date ? formatDateToJST(result.sent_date) : formatRelativeTime(result.created_at)}
                      </span>
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
              </div>
            );
          })
        ) : (
          <div className="px-6 py-4 text-center text-gray-500">
            スカウト送信履歴がありません
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoutHistory;