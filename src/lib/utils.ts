/**
 * UUID形式の文字列かどうかを検証する関数
 * @param uuid 検証する文字列
 * @returns 有効なUUIDの場合はtrue、それ以外はfalse
 */
export const isValidUUID = (uuid: string): boolean => {
  if (!uuid) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * 日付をフォーマットする関数
 * @param dateString 日付文字列
 * @param options フォーマットオプション
 * @returns フォーマットされた日付文字列
 */
export const formatDate = (dateString: string, options: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
}): string => {
  return new Date(dateString).toLocaleDateString('ja-JP', options);
};

/**
 * 金額を通貨形式にフォーマットする関数
 * @param amount 金額
 * @param currency 通貨コード
 * @returns フォーマットされた金額文字列
 */
export const formatCurrency = (amount: number, currency: string = 'JPY'): string => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0
  }).format(amount);
};

/**
 * 配列をランダムにシャッフルする関数
 * @param array シャッフルする配列
 * @returns シャッフルされた新しい配列
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};