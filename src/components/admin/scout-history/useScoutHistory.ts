import { useState, useEffect, useMemo } from 'react';
import { useQuery } from 'react-query';
import { supabase } from '../../../lib/supabase';
import { ScoutResult, GroupedScoutResult } from './types';
import { getJobTypeName, calculateSentCount } from './utils';
import * as XLSX from 'xlsx';

interface UseScoutHistoryProps {
  currentDate: string;
  searchTerm: string;
  currentPage: number;
  statusFilter: string | null;
  itemsPerPage: number;
}

export const useScoutHistory = ({
  currentDate,
  searchTerm,
  currentPage,
  statusFilter,
  itemsPerPage
}: UseScoutHistoryProps) => {
  const [totalPages, setTotalPages] = useState(1);

  // スカウト結果の取得
  const { data: scoutResults = [], isLoading } = useQuery(
    ['adminScoutHistory', currentDate, statusFilter, searchTerm],
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
            job_details
          ),
          customer:customers(
            company_name
          )
        `)
        .order('sent_time', { ascending: true });

      // 日付フィルター
      if (currentDate) {
        query = query.eq('sent_date', currentDate);
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

      const { data, error, count } = await query;
      
      if (error) {
        console.error('スカウト結果取得エラー:', error);
        throw error;
      }
      
      return data || [];
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      staleTime: 30000, // 30秒間はデータを新鮮と見なす
      onError: (error) => {
        console.error('スカウト結果取得エラー:', error);
      }
    }
  );

  // スカウト結果をグルーピング
  const groupedResults = useMemo(() => {
    if (!scoutResults.length) return [];

    // 顧客ID + 送信時間でグルーピング
    const groupMap = new Map<string, GroupedScoutResult>();

    scoutResults.forEach(result => {
      // 顧客名を取得
      const customerName = result.customer?.company_name || '不明な顧客';
      
      // 職種名を取得
      let jobTypeName = getJobTypeName(result);

      // グループキー（顧客ID + 送信時間）
      const groupKey = `${result.customer_id}_${result.sent_time || ''}`;
      
      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, {
          customer_id: result.customer_id,
          customer_name: customerName,
          sent_time: result.sent_time || '',
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
      .sort((a, b) => a.sent_time.localeCompare(b.sent_time));
  }, [scoutResults]);

  // ページネーション適用
  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    
    // 総ページ数を再計算
    setTotalPages(Math.ceil(groupedResults.length / itemsPerPage));
    
    return groupedResults.slice(start, end);
  }, [groupedResults, currentPage, itemsPerPage]);

  // 日付フォーマット
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  // 時間フォーマット
  const formatTime = (timeString: string | null) => {
    if (!timeString) return '不明';
    
    // PostgreSQLのtime型は "HH:MM:SS" 形式
    const timeParts = timeString.split(':');
    if (timeParts.length >= 2) {
      return `${timeParts[0]}:${timeParts[1]}`;
    }
    return timeString;
  };

  // Excelダウンロード
  const handleExport = () => {
    // データの整形
    const exportData = groupedResults.flatMap(group => {
      return [{
        '日付': currentDate ? new Date(currentDate).toLocaleDateString('ja-JP') : '',
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
    
    XLSX.utils.book_append_sheet(wb, ws, `スカウト履歴_${currentDate}`);
    XLSX.writeFile(wb, `スカウト送信履歴_${currentDate}.xlsx`);
  };

  return {
    scoutResults,
    isLoading,
    groupedResults,
    paginatedResults,
    totalPages,
    formatDate,
    formatTime,
    handleExport
  };
};