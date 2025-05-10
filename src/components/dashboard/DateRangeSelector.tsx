import React from 'react';
import { Calendar } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { format as formatTZ, utcToZonedTime } from 'date-fns-tz';

interface DateRangeSelectorProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange
}) => {
  // 東京タイムゾーンを設定
  const timeZone = 'Asia/Tokyo';

  // 日付範囲テンプレート
  const dateRangeTemplates = [
    { label: '今日', getValue: () => {
      const today = utcToZonedTime(new Date(), timeZone);
      const todayStr = formatTZ(today, 'yyyy-MM-dd', { timeZone });
      return { start: todayStr, end: todayStr };
    }},
    { label: '今週', getValue: () => {
      const today = utcToZonedTime(new Date(), timeZone);
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)); // 月曜日を週の始まりとする
      return { 
        start: formatTZ(startOfWeek, 'yyyy-MM-dd', { timeZone }), 
        end: formatTZ(today, 'yyyy-MM-dd', { timeZone })
      };
    }},
    { label: '今月', getValue: () => {
      const today = utcToZonedTime(new Date(), timeZone);
      const firstDayOfMonth = startOfMonth(today);
      return { 
        start: formatTZ(firstDayOfMonth, 'yyyy-MM-dd', { timeZone }), 
        end: formatTZ(today, 'yyyy-MM-dd', { timeZone })
      };
    }},
    {
      label: '先月',
      getValue: () => {
        const now = utcToZonedTime(new Date(), timeZone);
        const lastMonth = subMonths(now, 1);
        const start = startOfMonth(lastMonth);
        const end = endOfMonth(lastMonth);
        return { 
          start: formatTZ(start, 'yyyy-MM-dd', { timeZone }),
          end: formatTZ(end, 'yyyy-MM-dd', { timeZone })
        };
      },
    },
    { label: '過去7日間', getValue: () => {
      const today = utcToZonedTime(new Date(), timeZone);
      const last7Days = new Date(today);
      last7Days.setDate(today.getDate() - 6);
      return { 
        start: formatTZ(last7Days, 'yyyy-MM-dd', { timeZone }), 
        end: formatTZ(today, 'yyyy-MM-dd', { timeZone })
      };
    }},
    { label: '過去30日間', getValue: () => {
      const today = utcToZonedTime(new Date(), timeZone);
      const last30Days = new Date(today);
      last30Days.setDate(today.getDate() - 29);
      return { 
        start: formatTZ(last30Days, 'yyyy-MM-dd', { timeZone }), 
        end: formatTZ(today, 'yyyy-MM-dd', { timeZone })
      };
    }},
    { label: '過去90日間', getValue: () => {
      const today = utcToZonedTime(new Date(), timeZone);
      const last90Days = new Date(today);
      last90Days.setDate(today.getDate() - 89);
      return { 
        start: formatTZ(last90Days, 'yyyy-MM-dd', { timeZone }), 
        end: formatTZ(today, 'yyyy-MM-dd', { timeZone })
      };
    }},
    { label: '今年', getValue: () => {
      const today = utcToZonedTime(new Date(), timeZone);
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      return { 
        start: formatTZ(startOfYear, 'yyyy-MM-dd', { timeZone }), 
        end: formatTZ(today, 'yyyy-MM-dd', { timeZone })
      };
    }},
    { label: '去年', getValue: () => {
      const lastYear = utcToZonedTime(new Date(), timeZone).getFullYear() - 1;
      const startOfLastYear = new Date(lastYear, 0, 1);
      const endOfLastYear = new Date(lastYear, 11, 31);
      return { 
        start: formatTZ(startOfLastYear, 'yyyy-MM-dd', { timeZone }), 
        end: formatTZ(endOfLastYear, 'yyyy-MM-dd', { timeZone })
      };
    }},
    { label: 'カスタム', getValue: () => ({ start: startDate, end: endDate }) }
  ];

  // コンポーネントがマウントされたときに今月の日付範囲を設定
  React.useEffect(() => {
    const today = utcToZonedTime(new Date(), timeZone);
    const firstDayOfMonth = startOfMonth(today);
    
    onStartDateChange(formatTZ(firstDayOfMonth, 'yyyy-MM-dd', { timeZone }));
    onEndDateChange(formatTZ(today, 'yyyy-MM-dd', { timeZone }));
  }, []);

  // テンプレート選択時の処理
  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = parseInt(e.target.value);
    if (selectedIndex >= 0 && selectedIndex < dateRangeTemplates.length) {
      const { start, end } = dateRangeTemplates[selectedIndex].getValue();
      onStartDateChange(start);
      onEndDateChange(end);
    }
  };

  // 現在選択されている日付範囲に一致するテンプレートのインデックスを取得
  const getCurrentTemplateIndex = (): number => {
    for (let i = 0; i < dateRangeTemplates.length - 1; i++) {
      const { start, end } = dateRangeTemplates[i].getValue();
      if (start === startDate && end === endDate) {
        return i;
      }
    }
    return dateRangeTemplates.length - 1; // カスタム
  };

  return (
    <div className="flex items-center space-x-4">
      <select
        value={getCurrentTemplateIndex()}
        onChange={handleTemplateChange}
        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
      >
        {dateRangeTemplates.map((template, index) => (
          <option key={index} value={index}>
            {template.label}
          </option>
        ))}
      </select>
      <Calendar className="h-5 w-5 text-gray-400" />
      <div className="flex items-center space-x-2">
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
        <span className="text-gray-500">〜</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
    </div>
  );
};

export default DateRangeSelector;