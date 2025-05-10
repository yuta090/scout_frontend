import React, { useState, useEffect } from "react";
import { type Campaign, type CampaignLog, getCampaignLogs } from "../../lib/supabase";
import { Calendar, ChevronLeft, ChevronRight, Download } from "lucide-react";
import * as XLSX from 'xlsx';
import Modal from "../ui/Modal";

interface CampaignLogProps {
  campaign?: Campaign;
  onClose: () => void;
}

const CampaignLog: React.FC<CampaignLogProps> = ({ campaign, onClose }) => {
  const [campaignlogs, setCampaignLogs] = useState<CampaignLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // 日付範囲の状態
  const today = new Date().toISOString().split('T')[0];
  const [dateRange, setDateRange] = useState({
    startDate: today,
    endDate: today
  });
  
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchCampaignLogs = async (campaign) => {
      try {
        setIsLoading(true);
        const campaignLogs = await getCampaignLogs(campaign.id);
        setCampaignLogs(campaignLogs);
      } catch (err) {
        console.error("Error fetching campaign logs:", err);
        setError("Error fetching campaign logs");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaignLogs(campaign);
  }, [campaign]);

  // 日付でグループ化
  const groupedLogs = campaignlogs.reduce((acc, log) => {
    const date = log.created_at.split("T")[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {} as Record<string, CampaignLog[]>);

  // 日付の配列を取得して降順にソート
  const sortedDates = Object.keys(groupedLogs).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  // 日付範囲内のログを取得
  const getLogsInDateRange = () => {
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    endDate.setHours(23, 59, 59, 999); // 終了日の終わりまで含める
    
    let filteredLogs: CampaignLog[] = [];
    
    // 日付範囲内のすべてのログを集める
    Object.entries(groupedLogs).forEach(([date, logs]) => {
      const logDate = new Date(date);
      if (logDate >= startDate && logDate <= endDate) {
        filteredLogs = [...filteredLogs, ...logs];
      }
    });
    
    return filteredLogs;
  };
  
  const logsInDateRange = getLogsInDateRange();

  // ページネーション
  const totalPages = Math.ceil(sortedDates.length / itemsPerPage);
  const currentDates = sortedDates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 日付のフォーマット
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 年齢の表示を整形する関数
  const formatAge = (age: string | number | null | undefined) => {
    if (!age) return '-';
    
    // 数値の場合はそのまま「歳」を付ける
    if (typeof age === 'number') return `${age}歳`;
    
    // 文字列の場合は「歳」が含まれているかチェック
    if (typeof age === 'string') {
      if (age.includes('歳')) return age;
      return `${age}歳`;
    }
    
    return '-';
  };

  // 年収の表示を整形する関数
  const formatIncome = (income: string | number | null | undefined) => {
    if (!income) return '-';
    
    // 数値の場合はそのまま「万円」を付ける
    if (typeof income === 'number') return `${income}万円`;
    
    // 文字列の場合は「万円」が含まれているかチェック
    if (typeof income === 'string') {
      if (income.includes('万円')) return income;
      return `${income}万円`;
    }
    
    return '-';
  };

  // 前日に移動
  const goToPreviousDay = () => {
    const date = new Date(dateRange.startDate);
    date.setDate(date.getDate() - 1);
    const newDate = date.toISOString().split('T')[0];
    setDateRange({
      startDate: newDate,
      endDate: newDate
    });
    setCurrentPage(1);
  };

  // 翌日に移動
  const goToNextDay = () => {
    const date = new Date(dateRange.startDate);
    date.setDate(date.getDate() + 1);
    const newDate = date.toISOString().split('T')[0];
    setDateRange({
      startDate: newDate,
      endDate: newDate
    });
    setCurrentPage(1);
  };

  // CSVダウンロード
  const handleCSVExport = () => {
    // 日付範囲内のログから成功メッセージを抽出
    const successMessages = logsInDateRange.flatMap(log => {
      if (log.details?.success_msg) {
        return Array.isArray(log.details.success_msg) 
          ? log.details.success_msg.flat() 
          : [log.details.success_msg];
      }
      return [];
    });

    if (successMessages.length === 0) {
      alert('エクスポートするデータがありません');
      return;
    }

    // CSVデータの作成
    const exportData = successMessages.map(msg => {
      // 年齢と年収の表示を整形
      const age = typeof msg.age === 'string' && msg.age.includes('歳') ? msg.age : formatAge(msg.age);
      const income = typeof msg.income === 'string' && msg.income.includes('万円') ? msg.income : formatIncome(msg.income);
      
      return {
        '年齢': age,
        '年収': income,
        '最終学歴': msg.education || '-',
        '居住都道府県': msg.prefecture || '-',
        '最新の勤め先': msg.last_company || '-'
      };
    });

    // CSVワークブックの作成
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    const fileName = dateRange.startDate === dateRange.endDate 
      ? `スカウト送信履歴_${dateRange.startDate}.csv`
      : `スカウト送信履歴_${dateRange.startDate}_${dateRange.endDate}.csv`;
    
    XLSX.utils.book_append_sheet(wb, ws, `スカウト履歴`);
    XLSX.writeFile(wb, fileName, { bookType: 'csv' });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="スカウト送信履歴"
      maxWidth="max-w-5xl"
    >
      {/* 日付選択と検索 */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPreviousDay}
              className="p-2 rounded-md hover:bg-gray-100"
              aria-label="前日"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <span className="text-gray-500">〜</span>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            <button
              onClick={goToNextDay}
              className="p-2 rounded-md hover:bg-gray-100"
              aria-label="翌日"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          
          <button
            onClick={handleCSVExport}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Download className="h-4 w-4 mr-2" />
            CSVダウンロード
          </button>
        </div>
      </div>

      {/* ログ内容 */}
      <div className="px-6 py-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md">
            {error}
          </div>
        ) : logsInDateRange.length > 0 ? (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* 各日付のログから成功メッセージを抽出 */}
            {(() => {
              const successMessages = logsInDateRange.flatMap(log => {
                if (log.details?.success_msg) {
                  return Array.isArray(log.details.success_msg) 
                    ? log.details.success_msg.flat() 
                    : [log.details.success_msg];
                }
                return [];
              });

              return successMessages.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          年齢
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          年収
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          最終学歴
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          居住都道府県
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          最新の勤め先
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {successMessages.map((msg: any, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                            {typeof msg.age === 'string' && msg.age.includes('歳') ? msg.age : formatAge(msg.age)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                            {typeof msg.income === 'string' && msg.income.includes('万円') ? msg.income : formatIncome(msg.income)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                            {msg.education || '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                            {msg.prefecture || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-800">
                            {msg.last_company || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  この期間のスカウト送信データはありません
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">スカウト送信履歴がありません</h3>
            <p className="mt-1 text-sm text-gray-500">
              このキャンペーンにはまだスカウト送信履歴が記録されていません
            </p>
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          閉じる
        </button>
      </div>
    </Modal>
  );
};

export default CampaignLog;