import React from 'react';
import { DeliveryDays, DAY_NAMES } from './types';
import { isNightTimeDelivery, getDayDeliveryPrice, calculateTotalPrice, BASE_PRICE, calculateTotalQuantity, DAILY_LIMIT, calculateDeliveryDaysInPeriod } from './utils';

interface DeliveryScheduleSectionProps {
  deliveryDays: DeliveryDays;
  additionalQuantity: number;
  startDate: string;
  endDate: string;
  onDeliveryDaysChange: (newDeliveryDays: DeliveryDays) => void;
  onAdditionalQuantityChange: (quantity: number) => void;
}

const DeliveryScheduleSection: React.FC<DeliveryScheduleSectionProps> = ({
  deliveryDays,
  additionalQuantity,
  startDate,
  endDate,
  onDeliveryDaysChange,
  onAdditionalQuantityChange
}) => {
  // 基本の送信数を計算（期間内の営業日 × 500通）
  const baseQuantity = startDate && endDate ? calculateTotalQuantity(startDate, endDate, deliveryDays, 0) : 0;
  // 追加送信を含めた合計送信数
  const totalQuantity = baseQuantity + additionalQuantity;

  // 基本送信数が最大値（5000通）に達していない場合は追加送信を無効化
  const isAdditionalQuantityDisabled = baseQuantity < 5000;

  // 追加送信入力時の通知メッセージを生成
  const getAdditionalQuantityMessage = () => {
    if (!startDate || !endDate || additionalQuantity <= 0 || isAdditionalQuantityDisabled) {
      return null;
    }

    // 期間内の配信可能日数を取得
    const availableDeliveryDays = calculateDeliveryDaysInPeriod(startDate, endDate, deliveryDays);
    
    // 必要な配信日数を計算
    const requiredDeliveryDays = Math.ceil(totalQuantity / DAILY_LIMIT);
    
    if (requiredDeliveryDays > availableDeliveryDays) {
      const additionalDaysNeeded = requiredDeliveryDays - availableDeliveryDays;
      return (
        <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-sm text-amber-800">
            送信終了日を延長するか、追加送信数を調整してください。
            <br />
            あと{additionalDaysNeeded}営業日必要です。
          </p>
        </div>
      );
    }

    return null;
  };

  const handleTimeChange = (day: keyof typeof DAY_NAMES, value: string) => {
    onDeliveryDaysChange({
      ...deliveryDays,
      [day]: {
        ...deliveryDays[day],
        start: value
      }
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">オプション</h3>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              追加送信
            </label>
            {isAdditionalQuantityDisabled && (
              <p className="mt-1 text-sm text-amber-600">
                基本送信数（5,000通）を使い切ってから追加送信が可能になります
              </p>
            )}
          </div>
          <span className="text-sm text-gray-500">
            1通 10円
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            min="0"
            max="10000"
            value={additionalQuantity}
            onChange={(e) => {
              const value = Math.max(0, Math.min(parseInt(e.target.value) || 0, 10000));
              onAdditionalQuantityChange(value);
            }}
            className={`w-32 px-4 py-2 border rounded-md focus:ring-2 ${
              isAdditionalQuantityDisabled
                ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
            }`}
            disabled={isAdditionalQuantityDisabled}
          />
          <span className={`text-sm font-medium ${isAdditionalQuantityDisabled ? 'text-gray-400' : 'text-indigo-600'}`}>
            +{(additionalQuantity * 10).toLocaleString()}円
          </span>
        </div>
        {getAdditionalQuantityMessage()}
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">配信スケジュール</h3>
        <div className="space-y-4">
          {Object.entries(deliveryDays).map(([day, value]) => {
            const dayName = DAY_NAMES[day as keyof typeof DAY_NAMES];
            const isNight = isNightTimeDelivery(value.start);
            const isWeekend = day === 'saturday' || day === 'sunday';
            const optionPrice = getDayDeliveryPrice(day as keyof typeof DAY_NAMES, deliveryDays);

            return (
              <div
                key={day}
                className={`p-4 rounded-lg border transition-colors duration-200 ${
                  value.checked
                    ? isNight || isWeekend
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-indigo-50 border-indigo-200'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <div className="flex items-center flex-1">
                    <input
                      type="checkbox"
                      checked={value.checked}
                      onChange={(e) =>
                        onDeliveryDaysChange({
                          ...deliveryDays,
                          [day]: { ...deliveryDays[day], checked: e.target.checked }
                        })
                      }
                      className={`h-4 w-4 focus:ring-2 border-gray-300 rounded ${
                        isNight || isWeekend
                          ? 'text-amber-500 focus:ring-amber-500'
                          : 'text-indigo-600 focus:ring-indigo-500'
                      }`}
                    />
                    <span className={`ml-3 font-medium ${
                      value.checked
                        ? isNight || isWeekend
                          ? 'text-amber-900'
                          : 'text-indigo-900'
                        : 'text-gray-900'
                    }`}>
                      {dayName}
                    </span>

                    {value.checked && (
                      <div className="ml-6">
                        <select
                          value={value.start}
                          onChange={(e) => handleTimeChange(day as keyof typeof DAY_NAMES, e.target.value)}
                          className={`border rounded-md shadow-sm focus:ring-2 px-4 py-1.5 ${
                            isNight
                              ? 'border-amber-300 focus:ring-amber-500 focus:border-amber-500 bg-amber-50'
                              : 'border-indigo-300 focus:ring-indigo-500 focus:border-indigo-500 bg-indigo-50'
                          }`}
                        >
                          {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                            <option key={hour} value={hour} className="py-1">
                              {hour}:00
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {value.checked && optionPrice > 0 && (
                    <div className="text-sm">
                      <span className={`font-medium ${
                        isNight || isWeekend ? 'text-amber-800' : 'text-indigo-800'
                      }`}>
                        +{optionPrice.toLocaleString()}円
                      </span>
                      {isNight && (
                        <span className="ml-2 text-amber-700">
                          (夜間配信)
                        </span>
                      )}
                      {isWeekend && (
                        <span className="ml-2 text-amber-700">
                          (休日配信)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center text-lg font-medium">
              <div>
                <span>基本料金: </span>
                <span className="text-sm text-gray-600">
                  (10日間で最大5,000通 / 1日最大{DAILY_LIMIT}通)
                </span>
              </div>
              <span>{BASE_PRICE.toLocaleString()}円</span>
            </div>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between items-center text-lg">
                <span>オプション料金:</span>
                <span>+{(calculateTotalPrice(deliveryDays, additionalQuantity) - BASE_PRICE).toLocaleString()}円</span>
              </div>
              <div className="text-sm text-gray-600 pl-4 space-y-1">
                {additionalQuantity > 0 && !isAdditionalQuantityDisabled && (
                  <div className="flex justify-between">
                    <span>追加送信 ({additionalQuantity.toLocaleString()}通):</span>
                    <span>+{(additionalQuantity * 10).toLocaleString()}円</span>
                  </div>
                )}
                {Object.entries(deliveryDays).map(([day, value]) => {
                  const price = getDayDeliveryPrice(day as keyof typeof DAY_NAMES, deliveryDays);
                  if (value.checked && price > 0) {
                    const dayName = DAY_NAMES[day as keyof typeof DAY_NAMES];
                    const isNight = isNightTimeDelivery(value.start);
                    const isWeekend = day === 'saturday' || day === 'sunday';
                    return (
                      <div key={day} className="flex justify-between">
                        <span>
                          {dayName} ({isWeekend ? '休日' : '平日'}{isNight ? '・夜間' : ''} {value.start}:00配信):
                        </span>
                        <span>+{price.toLocaleString()}円</span>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
            <div className="flex justify-between items-center text-xl font-bold mt-4 pt-4 border-t">
              <span>合計金額:</span>
              <span>{calculateTotalPrice(deliveryDays, additionalQuantity).toLocaleString()}円</span>
            </div>
            <div className="mt-2 text-sm text-gray-500 text-right">
              (1通あたり {Math.round(calculateTotalPrice(deliveryDays, additionalQuantity) / totalQuantity).toLocaleString()}円)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryScheduleSection;