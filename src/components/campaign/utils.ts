import { DeliveryDays } from './types';

export const BASE_PRICE = 50000;
export const NIGHT_DELIVERY_PRICE = 3000;
export const WEEKEND_DELIVERY_PRICE = 5000;
export const DAILY_LIMIT = 500;
export const MAX_PERIOD_DAYS = 10;
export const MAX_TOTAL_QUANTITY = 5000;

export const isNightTimeDelivery = (startTime: string) => {
  const hour = parseInt(startTime, 10);
  return hour >= 18 || hour <= 8;
};

export const getDayDeliveryPrice = (
  day: keyof DeliveryDays,
  deliveryDays: DeliveryDays
) => {
  if (!deliveryDays[day].checked) return 0;

  const isWeekend = day === 'saturday' || day === 'sunday';
  const isNight = isNightTimeDelivery(deliveryDays[day].start);

  let price = 0;
  if (isWeekend) price += WEEKEND_DELIVERY_PRICE;
  if (isNight) price += NIGHT_DELIVERY_PRICE;

  return price;
};

export const calculateTotalPrice = (
  deliveryDays: DeliveryDays,
  additionalQuantity: number
) => {
  let total = BASE_PRICE;

  Object.entries(deliveryDays).forEach(([day, value]) => {
    if (value.checked) {
      total += getDayDeliveryPrice(day as keyof DeliveryDays, deliveryDays);
    }
  });

  total += additionalQuantity * 10;

  return total;
};
type DeliveryDays = {
  [key: string]: { checked: boolean; start: string };
};

export const getDeliveryDates = (
  startDate: string | Date,
  endDate: string | Date,
  deliveryDays: DeliveryDays
): { date: string; time: string }[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dayMap: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  const activeDays = Object.entries(deliveryDays)
    .filter(([_, value]) => value.checked)
    .map(([day, value]) => ({
      day: dayMap[day.toLowerCase()],
      time: `${value.start.padStart(2, '0')}:00:00`, // Format time to HH:00:00
    }));

  const result: { date: string; time: string }[] = [];

  for (
    let date = new Date(start);
    date <= end;
    date.setDate(date.getDate() + 1)
  ) {
    const dayInfo = activeDays.find((d) => d.day === date.getDay());
    if (dayInfo) {
      result.push({
        date: date.toISOString().split('T')[0], // Format YYYY-MM-DD
        time: dayInfo.time,
      });
    }
  }

  return result;
};

// 期間内の配信可能日数を計算する関数（土日の配信設定を考慮）
export const calculateDeliveryDaysInPeriod = (
  startDate: string,
  endDate: string,
  deliveryDays: DeliveryDays
): number => {
  if (!startDate || !endDate || !deliveryDays) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  let deliveryDaysCount = 0;

  // 日付を1日ずつ進めながらカウント
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = d.getDay(); // 0=日曜, 1=月曜, ..., 6=土曜
    // 曜日に対応するdeliveryDaysのキーを取得
    const dayKey = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ][day] as keyof DeliveryDays;

    // その曜日が配信設定されているかチェック
    if (deliveryDays[dayKey]?.checked) {
      deliveryDaysCount++;
    }
  }

  return deliveryDaysCount;
};

// 期間内の総送信数を計算する関数
export const calculateTotalQuantity = (
  startDate: string,
  endDate: string,
  deliveryDays: DeliveryDays,
  additionalQuantity: number = 0
): number => {
  if (!startDate || !endDate || !deliveryDays) return 0;

  const deliveryDaysCount = calculateDeliveryDaysInPeriod(
    startDate,
    endDate,
    deliveryDays
  );

  // 基本の送信数を計算（期間内の営業日 × 500通、ただし最大5000通まで）
  const baseQuantity = Math.min(
    deliveryDaysCount * DAILY_LIMIT,
    MAX_TOTAL_QUANTITY
  );

  // 追加送信数を加算
  const totalQuantity = baseQuantity + additionalQuantity;

  return totalQuantity;
};

// 期間の表示用フォーマット関数
export const formatDateRange = (
  startDate: string,
  endDate: string,
  deliveryDays: DeliveryDays,
  additionalQuantity: number = 0
): string => {
  if (!startDate || !endDate || !deliveryDays) return '';

  const deliveryDaysCount = calculateDeliveryDaysInPeriod(
    startDate,
    endDate,
    deliveryDays
  );
  const totalQuantity = calculateTotalQuantity(
    startDate,
    endDate,
    deliveryDays,
    additionalQuantity
  );

  return `${deliveryDaysCount}日間 (最大${totalQuantity.toLocaleString()}通)`;
};

// 期間の妥当性チェック関数
export const validatePeriod = (
  startDate: string,
  endDate: string,
  deliveryDays: DeliveryDays
): string | null => {
  if (!startDate || !endDate) {
    return '送信期間を設定してください';
  }

  if (!deliveryDays) {
    return '配信スケジュールを設定してください';
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (start > end) {
    return '開始日は終了日より前の日付を選択してください';
  }

  const deliveryDaysCount = calculateDeliveryDaysInPeriod(
    startDate,
    endDate,
    deliveryDays
  );

  // 配信日が選択されているかチェック
  const hasDeliveryDays = Object.values(deliveryDays).some(
    (day) => day.checked
  );
  if (!hasDeliveryDays) {
    return '配信する曜日を1日以上選択してください';
  }

  if (deliveryDaysCount > MAX_PERIOD_DAYS) {
    return `配信日数が長すぎます。最大${MAX_PERIOD_DAYS}日までの期間を選択してください`;
  }

  return null;
};
