import React from 'react';
import { Calendar } from 'lucide-react';
import { calculateDeliveryDaysInPeriod, calculateTotalQuantity, formatDateRange } from './utils';
import { DeliveryDays } from './types';

interface DeliveryPeriodSectionProps {
  startDate: string;
  endDate: string;
  deliveryDays: DeliveryDays;
  additionalQuantity?: number;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

const DeliveryPeriodSection: React.FC<DeliveryPeriodSectionProps> = ({
  startDate,
  endDate,
  deliveryDays,
  additionalQuantity = 0,
  onStartDateChange,
  onEndDateChange
}) => {
  // 基本の送信数を計算（期間内の営業日 × 500通）
  const baseQuantity = startDate && endDate ? calculateTotalQuantity(startDate, endDate, deliveryDays, 0) : 0;
  // 追加送信を含めた合計送信数
  const totalQuantity = baseQuantity + additionalQuantity;
  // 期間内の配信日数
  const deliveryDaysCount = startDate && endDate ? calculateDeliveryDaysInPeriod(startDate, endDate, deliveryDays) : 0;

  // 営業日を計算する関数
  const isBusinessDay = (date: Date, deliveryDays: DeliveryDays): boolean => {
    const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayKey = dayMap[date.getDay()] as keyof DeliveryDays;
    return deliveryDays[dayKey].checked;
  };

  // 指定された日付から指定された営業日数後の日付を取得する関数
  const getDateAfterBusinessDays = (startDate: Date, businessDays: number, deliveryDays: DeliveryDays): Date => {
    const result = new Date(startDate);
    let businessDaysCount = 0;

    // 開始日も含めて計算するため、1日前から開始
    result.setDate(result.getDate() - 1);

    while (businessDaysCount < businessDays) {
      result.setDate(result.getDate() + 1);
      if (isBusinessDay(result, deliveryDays)) {
        businessDaysCount++;
      }
    }

    return result;
  };

  // 必要な営業日数を計算する関数
  const calculateRequiredBusinessDays = (totalQuantity: number): number => {
    const dailyLimit = 500;
    return Math.ceil(totalQuantity / dailyLimit);
  };

  // 開始日が変更されたときのハンドラー
  const handleStartDateChange = (newStartDate: string) => {
    onStartDateChange(newStartDate);

    if (newStartDate) {
      const startDateObj = new Date(newStartDate);
      // 追加送信数を考慮して必要な営業日数を計算
      const requiredDays = Math.max(10, calculateRequiredBusinessDays(totalQuantity));
      const endDateObj = getDateAfterBusinessDays(startDateObj, requiredDays, deliveryDays);
      onEndDateChange(endDateObj.toISOString().split('T')[0]);
    }
  };

  // 終了日が変更されたときのハンドラー
  const handleEndDateChange = (newEndDate: string) => {
    if (startDate && newEndDate) {
      const newDeliveryDaysCount = calculateDeliveryDaysInPeriod(startDate, newEndDate, deliveryDays);
      const requiredDays = calculateRequiredBusinessDays(totalQuantity);
      
      if (newDeliveryDaysCount < requiredDays) {
        // 必要な日数を満たすように終了日を延長
        const startDateObj = new Date(startDate);
        const endDateObj = getDateAfterBusinessDays(startDateObj, requiredDays, deliveryDays);
        onEndDateChange(endDateObj.toISOString().split('T')[0]);
      } else {
        onEndDateChange(newEndDate);
      }
    } else {
      onEndDateChange(newEndDate);
    }
  };

  // 配信設定がある曜日を取得
  const getDeliveryDayNames = () => {
    const dayNames = {
      monday: '月',
      tuesday: '火',
      wednesday: '水',
      thursday: '木',
      friday: '金',
      saturday: '土',
      sunday: '日'
    };

    return Object.entries(deliveryDays)
      .filter(([_, value]) => value.checked)
      .map(([day]) => dayNames[day as keyof typeof dayNames])
      .join('・');
  };

  // 残送信可能数の計算
  const calculateRemainingQuantity = () => {
    if (baseQuantity >= 5000) {
      // 基本送信数が5000通以上の場合、追加送信は無制限
      return '無制限';
    } else {
      // 基本送信数が5000通未満の場合、追加送信は不可
      return '0';
    }
  };

  // 最小終了日を計算
  const calculateMinEndDate = (): string => {
    if (!startDate) return '';
    
    const startDateObj = new Date(startDate);
    const requiredDays = calculateRequiredBusinessDays(totalQuantity);
    const minEndDateObj = getDateAfterBusinessDays(startDateObj, requiredDays, deliveryDays);
    return minEndDateObj.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">送信期間</h3>
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              送信開始日 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>
          <div className="w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              送信終了日 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                min={calculateMinEndDate()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>
        </div>

        {startDate && endDate && (
          <div className="bg-blue-50 p-4 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">
                  選択された期間: {deliveryDaysCount}日間
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  配信日: {getDeliveryDayNames()}曜日
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-blue-700">
                  最大送信数: {totalQuantity.toLocaleString()}通
                  {additionalQuantity > 0 && (
                    <span className="ml-2 text-indigo-600">
                      （うち追加送信：{additionalQuantity.toLocaleString()}通）
                    </span>
                  )}
                </p>
                {baseQuantity < 5000 && additionalQuantity > 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    残送信可能数: {calculateRemainingQuantity()}通
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryPeriodSection;