import React from 'react';
import { Search, Filter, Calendar, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { format, utcToZonedTime } from 'date-fns-tz';
import { ja } from 'date-fns/locale';

interface ScoutHistoryFiltersProps {
  startDate: string;
  endDate: string;
  searchTerm: string;
  statusFilter: string | null;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onSearchChange: (term: string) => void;
  onStatusFilterChange: (status: string | null) => void;
  onExport: () => void;
  onCSVExport: () => void;
  onPreviousDay: () => void;
  onNextDay: () => void;
}

const ScoutHistoryFilters: React.FC<ScoutHistoryFiltersProps> = ({
  startDate,
  endDate,
  searchTerm,
  statusFilter,
  onStartDateChange,
  onEndDateChange,
  onSearchChange,
  onStatusFilterChange,
  onExport,
  onCSVExport,
  onPreviousDay,
  onNextDay
}) => {
  // 日付をJST（日本時間）に変換する関数
  const formatDateToJST = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const jstDate = utcToZonedTime(date, 'Asia/Tokyo');
    return format(jstDate, 'yyyy-MM-dd', { locale: ja });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        {/* 検索とフィルター */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="顧客名で検索..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200 hover:border-gray-400"
            />
          </div>
          
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-gray-400 mr-2" />
            <select
              value={statusFilter || ''}
              onChange={(e) => onStatusFilterChange(e.target.value || null)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-colors duration-200 hover:border-gray-400"
            >
              <option value="">すべてのステータス</option>
              <option value="success">成功</option>
              <option value="error">エラー</option>
            </select>
          </div>
        </div>

        {/* 日付選択 */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onPreviousDay}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
            aria-label="前日"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 hover:border-gray-400"
              />
            </div>
            <span className="text-gray-500">〜</span>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 hover:border-gray-400"
              />
            </div>
          </div>
          
          <button
            onClick={onNextDay}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
            aria-label="翌日"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScoutHistoryFilters;