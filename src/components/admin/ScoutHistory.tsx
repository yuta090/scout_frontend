import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { supabase } from '../../lib/supabase';
import AdminLayout from './AdminLayout';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import ScoutHistoryTable from './ScoutHistoryTable';
import ScoutHistoryDetail from './ScoutHistoryDetail';
import ScoutHistoryFilters from './ScoutHistoryFilters';
import { GroupedScoutResult } from './scout-history/types';
import { getJobTypeName, calculateSentCount, formatTime } from './scout-history/utils';
import { format, utcToZonedTime } from 'date-fns-tz';
import { ja } from 'date-fns/locale';

const AdminScoutHistory: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState<string>(today);
  const [endDate, setEndDate] = useState<string>(today);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<GroupedScoutResult | null>(null);
  const itemsPerPage = 20;

  // スカウト結果の取得
  const { data: scoutResults = [], isLoading } = useQuery(
    ['adminScoutHistory', startDate, endDate, statusFilter, searchTerm],
    async () => {
      let query = supabase
        .from('scout_results')
        .select(`
          id,
          campaign_id,
          customer_id,
          candidate_details,
          sent_date,
          sent_time,
          created_at,
          updated_at,
          campaign:campaigns(
            title,
            job_details,
            customer_id
          ),
          customer:customers(
            company_name
          )
        `)
        .order('sent_time', { ascending: true });

      // 日付フィルター
      if (startDate && endDate) {
        query = query.gte('sent_date', startDate).lte('sent_date', endDate);
      } else if (startDate) {
        query = query.eq('sent_date', startDate);
      }

      // 検索フィルター
      if (searchTerm) {
        query = query.or(`customer.company_name.ilike.%${searchTerm}%,campaign.title.ilike.%${searchTerm}%`);
      }

      // ステータスフィルター
      if (statusFilter) {
        if (statusFilter === 'success') {
          query = query.not('candidate_details', 'is', null);
        } else if (statusFilter === 'error') {
          query = query.is('candidate_details', null);
        }
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('スカウト結果取得エラー:', error);
        throw error;
      }
      
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
      
      return fixedData;
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      staleTime: 30000 // 30秒間はデータを新鮮と見なす
    }
  );

  // 顧客情報の取得
  const [customerMap, setCustomerMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchCustomerInfo = async () => {
      // 顧客IDのリストを作成
      const customerIds = scoutResults
        .filter(result => result.customer_id)
        .map(result => result.customer_id);
      
      // 重複を削除
      const uniqueCustomerIds = [...new Set(customerIds)];
      
      if (uniqueCustomerIds.length === 0) return;
      
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('id, company_name')
          .in('id', uniqueCustomerIds);
        
        if (error) throw error;
        
        // 顧客IDと会社名のマップを作成
        const newCustomerMap: Record<string, string> = {};
        data?.forEach(customer => {
          newCustomerMap[customer.id] = customer.company_name;
        });
        
        setCustomerMap(newCustomerMap);
      } catch (err) {
        console.error('顧客情報の取得に失敗:', err);
      }
    };
    
    fetchCustomerInfo();
  }, [scoutResults]);

  // 顧客名を取得する関数
  const getCustomerName = (result: any): string => {
    // 直接customerオブジェクトから取得
    if (result.customer?.company_name) {
      return result.customer.company_name;
    }
    
    // customerMapから取得
    if (result.customer_id && customerMap[result.customer_id]) {
      return customerMap[result.customer_id];
    }
    
    // 顧客情報がない場合は「不明な企業」を返す
    return '不明な企業';
  };

  // スカウト結果をグルーピング
  const groupedResults = React.useMemo(() => {
    if (!scoutResults.length) return [];

    // 顧客ID + 送信時間でグルーピング
    const groupMap = new Map<string, GroupedScoutResult>();

    scoutResults.forEach(result => {
      // 顧客名を取得
      const customerName = getCustomerName(result);
      
      // 職種名を取得
      let jobTypeName = getJobTypeName(result);

      // グループキー（顧客ID + 送信時間）
      const groupKey = `${result.customer_id}_${result.sent_time || ''}_${result.sent_date || ''}`;
      
      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, {
          customer_id: result.customer_id,
          customer_name: customerName,
          sent_time: result.sent_time || '',
          sent_date: result.sent_date || '',
          job_types: jobTypeName ? [jobTypeName] : [],
          total_count: 0,
          success_count: 0,
          error_count: 0,
          items: []
        });
      }
      
      const group = groupMap.get(groupKey)!;
      
      // 職種名が未登録の場合は追加
      if (jobTypeName && !group.job_types.includes(jobTypeName)) {
        group.job_types.push(jobTypeName);
      }
      
      // カウント更新
      const sentCount = calculateSentCount(result.candidate_details);
      group.total_count += sentCount || 1;
      
      if (result.candidate_details) {
        group.success_count += sentCount || 1;
      } else {
        group.error_count += 1;
      }
      
      // アイテム追加
      group.items.push(result);
    });

    // Map から配列に変換して時間順にソート
    return Array.from(groupMap.values())
      .sort((a, b) => {
        // 日付で降順、同じ日付なら時間で昇順
        const dateCompare = new Date(b.sent_date || '').getTime() - new Date(a.sent_date || '').getTime();
        if (dateCompare !== 0) return dateCompare;
        return a.sent_time.localeCompare(b.sent_time);
      });
  }, [scoutResults, customerMap]);

  // ページネーション適用
  const paginatedResults = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return groupedResults.slice(start, end);
  }, [groupedResults, currentPage, itemsPerPage]);

  // 総ページ数
  const totalPages = Math.max(1, Math.ceil(groupedResults.length / itemsPerPage));

  // 日付フォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const jstDate = utcToZonedTime(date, 'Asia/Tokyo');
    return format(jstDate, 'yyyy年MM月dd日(EEEE)', { locale: ja });
  };

  // 前日に移動
  const goToPreviousDay = () => {
    const date = new Date(startDate);
    date.setDate(date.getDate() - 1);
    const newDate = date.toISOString().split('T')[0];
    setStartDate(newDate);
    setEndDate(newDate);
    setCurrentPage(1);
  };

  // 翌日に移動
  const goToNextDay = () => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + 1);
    const newDate = date.toISOString().split('T')[0];
    setStartDate(newDate);
    setEndDate(newDate);
    setCurrentPage(1);
  };

  // Excelダウンロード
  const handleExport = () => {
    // データの整形
    const exportData = groupedResults.flatMap(group => {
      return [{
        '日付': group.sent_date ? formatDate(group.sent_date) : '',
        '時間': formatTime(group.sent_time),
        '顧客企業': group.customer_name,
        '職種': group.job_types.join('、'),
        '送信数': group.total_count,
        '成功数': group.success_count,
        'エラー数': group.error_count,
        '成功率': `${Math.round((group.success_count / group.total_count) * 100)}%`
      }];
    });

    // Excelワークブックの作成
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // 列幅の設定
    const wscols = [
      { wch: 12 }, // 日付
      { wch: 8 },  // 時間
      { wch: 20 }, // 顧客企業
      { wch: 30 }, // 職種
      { wch: 8 },  // 送信数
      { wch: 8 },  // 成功数
      { wch: 8 },  // エラー数
      { wch: 8 }   // 成功率
    ];
    ws['!cols'] = wscols;
    
    XLSX.utils.book_append_sheet(wb, ws, `スカウト履歴_${startDate}_${endDate}`);
    XLSX.writeFile(wb, `スカウト送信履歴_${startDate}_${endDate}.xlsx`);
  };

  // CSVダウンロード
  const handleCSVExport = () => {
    // 詳細データを含むCSVを作成
    const detailData = groupedResults.flatMap(group => {
      return group.items
        .filter(item => item.candidate_details)
        .flatMap(item => {
          const details = Array.isArray(item.candidate_details) 
            ? item.candidate_details 
            : [item.candidate_details];
          
          return details.map(detail => ({
            '日付': group.sent_date ? formatDate(group.sent_date) : '',
            '時間': formatTime(group.sent_time),
            '顧客企業': group.customer_name,
            '職種': group.job_types.join('、'),
            '年齢': detail.age ? `${detail.age}歳` : '-',
            '年収': detail.income ? `${detail.income}万円` : '-',
            '最終学歴': detail.education || '-',
            '住まい': detail.prefecture || '-',
            '最新職歴': detail.last_company || '-'
          }));
        });
    });

    // CSVデータがない場合は集計データを使用
    const exportData = detailData.length > 0 ? detailData : groupedResults.map(group => ({
      '日付': group.sent_date ? formatDate(group.sent_date) : '',
      '時間': formatTime(group.sent_time),
      '顧客企業': group.customer_name,
      '職種': group.job_types.join('、'),
      '送信数': group.total_count,
      '成功数': group.success_count,
      'エラー数': group.error_count,
      '成功率': `${Math.round((group.success_count / group.total_count) * 100)}%`
    }));

    // CSVワークブックの作成
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    XLSX.utils.book_append_sheet(wb, ws, `スカウト履歴_${startDate}_${endDate}`);
    XLSX.writeFile(wb, `スカウト送信履歴_${startDate}_${endDate}.csv`, { bookType: 'csv' });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* ヘッダー部分 */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">スカウト送信管理</h1>
          
          <div className="flex space-x-2">
            <button
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <Download className="h-4 w-4 mr-2" />
              Excel
            </button>
            <button
              onClick={handleCSVExport}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <Download className="h-4 w-4 mr-2" />
              CSV
            </button>
          </div>
        </div>

        {/* フィルターセクション */}
        <ScoutHistoryFilters
          startDate={startDate}
          endDate={endDate}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onSearchChange={setSearchTerm}
          onStatusFilterChange={setStatusFilter}
          onExport={handleExport}
          onCSVExport={handleCSVExport}
          onPreviousDay={goToPreviousDay}
          onNextDay={goToNextDay}
        />

        {/* ページネーション（上部） */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white px-4 py-3 sm:px-6 rounded-lg shadow">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                前へ
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                次へ
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                  {' - '}
                  <span className="font-medium">{Math.min(currentPage * itemsPerPage, groupedResults.length)}</span>
                  {' 件目 / 全 '}
                  <span className="font-medium">{groupedResults.length}</span>
                  {' 件'}
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    <span className="sr-only">前へ</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // 表示するページ番号を計算
                    let pageNum;
                    if (totalPages <= 5) {
                      // 5ページ以下の場合は全ページ表示
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      // 現在のページが前方の場合
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      // 現在のページが後方の場合
                      pageNum = totalPages - 4 + i;
                    } else {
                      // 現在のページが中央の場合
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          currentPage === pageNum
                            ? 'z-10 bg-indigo-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    <span className="sr-only">次へ</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* スカウト結果テーブル */}
        <ScoutHistoryTable 
          paginatedResults={paginatedResults} 
          isLoading={isLoading}
          onRowClick={setSelectedGroup}
        />

        {/* 詳細モーダル */}
        {selectedGroup && (
          <ScoutHistoryDetail 
            groupData={selectedGroup} 
            onClose={() => setSelectedGroup(null)} 
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminScoutHistory;