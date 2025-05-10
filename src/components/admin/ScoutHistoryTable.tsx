import React from 'react';
import { Clock, Building2, Briefcase, Users, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { GroupedScoutResult } from './scout-history/types';
import { formatTime } from './scout-history/utils';
import { format, utcToZonedTime } from 'date-fns-tz';
import { ja } from 'date-fns/locale';

interface ScoutHistoryTableProps {
  paginatedResults: GroupedScoutResult[];
  isLoading: boolean;
  onRowClick: (groupData: GroupedScoutResult) => void;
}

const ScoutHistoryTable: React.FC<ScoutHistoryTableProps> = ({ 
  paginatedResults, 
  isLoading,
  onRowClick
}) => {
  // 日付をJST（日本時間）に変換する関数
  const formatDateToJST = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const jstDate = utcToZonedTime(date, 'Asia/Tokyo');
    return format(jstDate, 'yyyy年MM月dd日', { locale: ja });
  };

  return (
    <div className="bg-white shadow overflow-hidden rounded-lg">
      {isLoading ? (
        <div className="p-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : paginatedResults.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  送信時間
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  顧客企業
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  職種
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  送信数
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedResults.map((group) => (
                <tr 
                  key={`${group.customer_id}_${group.sent_time}_${group.sent_date}`} 
                  className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                  onClick={() => onRowClick(group)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {formatTime(group.sent_time)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Building2 className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {group.customer_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Briefcase className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900 truncate max-w-xs">
                        {group.job_types.length > 0 ? group.job_types.join('、') : '不明な職種'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {group.total_count}件
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      {group.success_count > 0 && (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          成功: {group.success_count}件
                        </span>
                      )}
                      {group.error_count > 0 && (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          <XCircle className="h-4 w-4 mr-1" />
                          エラー: {group.error_count}件
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">スカウト送信履歴がありません</h3>
          <p className="mt-1 text-sm text-gray-500">
            選択した日付にスカウト送信履歴が見つかりませんでした
          </p>
        </div>
      )}
    </div>
  );
};

export default ScoutHistoryTable;