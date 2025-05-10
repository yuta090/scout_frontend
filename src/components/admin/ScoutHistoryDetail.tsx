import React from 'react';
import { X, User, MapPin, GraduationCap, DollarSign, Briefcase, Clock, Building2, CheckCircle, XCircle, Download } from 'lucide-react';
import { GroupedScoutResult } from './scout-history/types';
import { formatTime } from './scout-history/utils';
import * as XLSX from 'xlsx';
import Modal from '../ui/Modal';
import { format, utcToZonedTime } from 'date-fns-tz';
import { ja } from 'date-fns/locale';

interface ScoutHistoryDetailProps {
  groupData: GroupedScoutResult;
  onClose: () => void;
}

const ScoutHistoryDetail: React.FC<ScoutHistoryDetailProps> = ({ groupData, onClose }) => {
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

  // 日付をJST（日本時間）に変換する関数
  const formatDateToJST = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const jstDate = utcToZonedTime(date, 'Asia/Tokyo');
    return format(jstDate, 'yyyy年MM月dd日', { locale: ja });
  };

  // Excelダウンロード
  const handleExcelDownload = () => {
    // 詳細データを含むExcelを作成
    const detailData = groupData.items
      .filter(item => item.candidate_details)
      .flatMap(item => {
        // candidate_detailsが配列の場合は展開、そうでなければ単一要素の配列に変換
        const details = Array.isArray(item.candidate_details) 
          ? item.candidate_details 
          : [item.candidate_details];
        
        return details.map(detail => ({
          '日付': groupData.sent_date ? formatDateToJST(groupData.sent_date) : '',
          '時間': formatTime(groupData.sent_time),
          '顧客企業': groupData.customer_name,
          '職種': groupData.job_types.join('、'),
          '年齢': typeof detail.age === 'string' && detail.age.includes('歳') ? detail.age : formatAge(detail.age),
          '年収': typeof detail.income === 'string' && detail.income.includes('万円') ? detail.income : formatIncome(detail.income),
          '最終学歴': detail.education || '-',
          '住まい': detail.prefecture || '-',
          '最新職歴': detail.last_company || '-'
        }));
      });

    if (detailData.length === 0) {
      alert('ダウンロードできるデータがありません');
      return;
    }

    // Excelワークブックの作成
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(detailData);
    
    // 列幅の設定
    const wscols = [
      { wch: 12 }, // 日付
      { wch: 8 },  // 時間
      { wch: 20 }, // 顧客企業
      { wch: 30 }, // 職種
      { wch: 8 },  // 年齢
      { wch: 10 }, // 年収
      { wch: 20 }, // 最終学歴
      { wch: 15 }, // 住まい
      { wch: 30 }  // 最新職歴
    ];
    ws['!cols'] = wscols;
    
    XLSX.utils.book_append_sheet(wb, ws, `スカウト詳細_${groupData.customer_name}`);
    XLSX.writeFile(wb, `スカウト詳細_${groupData.customer_name}_${groupData.sent_date || new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // CSVダウンロード
  const handleCSVDownload = () => {
    // 詳細データを含むCSVを作成
    const detailData = groupData.items
      .filter(item => item.candidate_details)
      .flatMap(item => {
        // candidate_detailsが配列の場合は展開、そうでなければ単一要素の配列に変換
        const details = Array.isArray(item.candidate_details) 
          ? item.candidate_details 
          : [item.candidate_details];
        
        return details.map(detail => ({
          '日付': groupData.sent_date ? formatDateToJST(groupData.sent_date) : '',
          '時間': formatTime(groupData.sent_time),
          '顧客企業': groupData.customer_name,
          '職種': groupData.job_types.join('、'),
          '年齢': typeof detail.age === 'string' && detail.age.includes('歳') ? detail.age : formatAge(detail.age),
          '年収': typeof detail.income === 'string' && detail.income.includes('万円') ? detail.income : formatIncome(detail.income),
          '最終学歴': detail.education || '-',
          '住まい': detail.prefecture || '-',
          '最新職歴': detail.last_company || '-'
        }));
      });

    if (detailData.length === 0) {
      alert('ダウンロードできるデータがありません');
      return;
    }

    // CSVワークブックの作成
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(detailData);
    
    XLSX.utils.book_append_sheet(wb, ws, `スカウト詳細_${groupData.customer_name}`);
    XLSX.writeFile(wb, `スカウト詳細_${groupData.customer_name}_${groupData.sent_date || new Date().toISOString().split('T')[0]}.csv`, { bookType: 'csv' });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="スカウト送信詳細"
      maxWidth="max-w-4xl"
    >
      <div className="px-6 py-4">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Building2 className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">{groupData.customer_name}</h3>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleCSVDownload}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                <Download className="h-4 w-4 mr-1" />
                CSV
              </button>
              <button
                onClick={handleExcelDownload}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                <Download className="h-4 w-4 mr-1" />
                Excel
              </button>
            </div>
          </div>
          <div className="flex items-center text-gray-700">
            <Clock className="h-5 w-5 mr-2 text-gray-400" />
            <span className="text-sm font-medium">時間: </span>
            <span className="ml-2">{formatTime(groupData.sent_time)}</span>
          </div>
          <div className="flex items-center text-gray-700 mt-1">
            <Briefcase className="h-5 w-5 mr-2 text-gray-400" />
            <span className="text-sm font-medium">職種: </span>
            <span className="ml-2">{groupData.job_types.join('、')}</span>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          {groupData.items.filter(item => item.candidate_details).length > 0 ? (
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
                      住まい
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      最新職歴
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {groupData.items
                    .filter(item => item.candidate_details)
                    .flatMap(item => {
                      // candidate_detailsが配列の場合は展開、そうでなければ単一要素の配列に変換
                      const details = Array.isArray(item.candidate_details) 
                        ? item.candidate_details 
                        : [item.candidate_details];
                      
                      return details.map((detail, index) => (
                        <tr key={`${item.id}-${index}`} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <User className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900">
                                {typeof detail.age === 'string' && detail.age.includes('歳') ? detail.age : formatAge(detail.age)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900">
                                {typeof detail.income === 'string' && detail.income.includes('万円') ? detail.income : formatIncome(detail.income)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <GraduationCap className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900">
                                {detail.education || '-'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900">
                                {detail.prefecture || '-'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900">
                                {detail.last_company || '-'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ));
                    })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <XCircle className="mx-auto h-12 w-12 text-red-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">データがありません</h3>
              <p className="mt-1 text-sm text-gray-500">
                このスカウト送信には詳細データが記録されていません
              </p>
            </div>
          )}
        </div>
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

export default ScoutHistoryDetail;