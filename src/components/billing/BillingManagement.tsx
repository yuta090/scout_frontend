import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { supabase } from '../../lib/supabase';
import { Download, Search, Calendar, Building2, User, FileText, CreditCard } from 'lucide-react';
import DateRangeSelector from '../dashboard/DateRangeSelector';
import * as XLSX from 'xlsx';

interface BillingData {
  id: string;
  customer_id: string;
  company_name: string;
  contact_name: string;
  start_date: string;
  end_date: string;
  total_quantity: number;
  total_amount: number;
  employer_id: string | null;
}

const BillingManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [filteredData, setFilteredData] = useState<BillingData[]>([]);

  // 請求データの取得
  const { data: billingData, isLoading, error } = useQuery(
    ['billingData', dateRange.startDate, dateRange.endDate],
    async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('認証エラー');

        // 代理店IDに基づいて顧客とキャンペーンデータを取得
        const { data, error } = await supabase
          .from('campaigns')
          .select(`
            id,
            title,
            customer_id,
            quantity,
            total_amount,
            options,
            customers (
              company_name,
              contact_name,
              employer_id
            )
          `)
          .eq('agency_id', user.id)
          .gte('options->schedule->start_date', dateRange.startDate)
          .lte('options->schedule->start_date', dateRange.endDate)
          .order('options->schedule->start_date', { ascending: false });

        if (error) throw error;

        // データを整形
        return (data || []).map(campaign => ({
          id: campaign.id,
          customer_id: campaign.customer_id,
          company_name: campaign.customers?.company_name || '不明',
          contact_name: campaign.customers?.contact_name || '不明',
          start_date: campaign.options?.schedule?.start_date || '',
          end_date: campaign.options?.schedule?.end_date || '',
          total_quantity: campaign.quantity || 0,
          total_amount: campaign.total_amount || 0,
          employer_id: campaign.customers?.employer_id || null
        }));
      } catch (err) {
        console.error('請求データの取得に失敗しました:', err);
        throw err;
      }
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  );

  // 検索とフィルタリング
  useEffect(() => {
    if (!billingData) return;

    const filtered = billingData.filter(item => 
      item.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.employer_id && item.employer_id.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    setFilteredData(filtered);
  }, [billingData, searchTerm]);

  // CSVダウンロード
  const handleDownloadCSV = () => {
    if (!filteredData.length) return;

    // データの整形
    const exportData = filteredData.map(item => ({
      '会社名': item.company_name,
      '担当者': item.contact_name,
      '配信開始日': item.start_date,
      '配信終了日': item.end_date,
      '総配信数': item.total_quantity,
      '金額': item.total_amount,
      '雇用者ID': item.employer_id || ''
    }));

    // Excelワークブックの作成
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // 列幅の設定
    const wscols = [
      { wch: 20 }, // 会社名
      { wch: 15 }, // 担当者
      { wch: 12 }, // 配信開始日
      { wch: 12 }, // 配信終了日
      { wch: 10 }, // 総配信数
      { wch: 12 }, // 金額
      { wch: 32 }  // 雇用者ID
    ];
    ws['!cols'] = wscols;
    
    XLSX.utils.book_append_sheet(wb, ws, '請求データ');
    
    // ファイル名に日付範囲を含める
    const fileName = `請求データ_${dateRange.startDate}_${dateRange.endDate}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // 日付フォーマット
  const formatDate = (dateString: string) => {
    if (!dateString) return '未設定';
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 金額フォーマット
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // 合計金額の計算
  const totalAmount = filteredData.reduce((sum, item) => sum + item.total_amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">請求管理</h1>
        
        <DateRangeSelector 
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onStartDateChange={(date) => setDateRange(prev => ({ ...prev, startDate: date }))}
          onEndDateChange={(date) => setDateRange(prev => ({ ...prev, endDate: date }))}
        />
      </div>

      <div className="flex justify-between items-center">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="会社名、担当者、雇用者IDで検索..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <button
          onClick={handleDownloadCSV}
          disabled={!filteredData.length}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4 mr-2" />
          CSVダウンロード
        </button>
      </div>

      {/* 合計金額表示 */}
      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CreditCard className="h-5 w-5 text-indigo-500 mr-2" />
            <span className="text-indigo-700 font-medium">期間内の合計請求金額</span>
          </div>
          <span className="text-xl font-bold text-indigo-700">{formatCurrency(totalAmount)}</span>
        </div>
      </div>

      {/* 請求データテーブル */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            データの取得に失敗しました。再度お試しください。
          </div>
        ) : filteredData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    会社名
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    担当者
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    配信期間
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    総配信数
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    金額
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    雇用者ID
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{item.company_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-500">{item.contact_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-500">
                          {formatDate(item.start_date)} 〜 {formatDate(item.end_date)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.total_quantity.toLocaleString()}通
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(item.total_amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-500 font-mono">
                          {item.employer_id || '未設定'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">請求データがありません</h3>
            <p className="mt-1 text-sm">
              {searchTerm ? '検索条件に一致する請求データが見つかりませんでした' : '選択した期間内の請求データがありません'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingManagement;