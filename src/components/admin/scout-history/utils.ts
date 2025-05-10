// 時間フォーマット
export const formatTime = (timeString: string | null): string => {
  if (!timeString) return '不明';
  
  // PostgreSQLのtime型は "HH:MM:SS" 形式
  const timeParts = timeString.split(':');
  if (timeParts.length >= 2) {
    // UTCからJST（UTC+9）に変換
    const hour = parseInt(timeParts[0], 10);
    const jstHour = (hour + 9) % 24; // 9時間を加算して24時間形式に調整
    return `${String(jstHour).padStart(2, '0')}:${timeParts[1]}`;
  }
  return timeString;
};

// 候補者情報の表示
export const renderCandidateDetails = (details: any): string => {
  if (!details) return 'エラー';
  
  try {
    // 文字列の場合はJSONとしてパース
    const data = typeof details === 'string' ? JSON.parse(details) : details;
    
    // 候補者情報の表示
    if (Array.isArray(data)) {
      return `${data.length}件の候補者`;
    } else if (data.name) {
      return data.name;
    } else if (data.id) {
      return `ID: ${data.id}`;
    } else {
      return '詳細情報あり';
    }
  } catch (e) {
    return '不明なデータ形式';
  }
};

// 職種名を取得する関数
export const getJobTypeName = (result: any): string => {
  if (result.campaign?.job_details?.job_type && Array.isArray(result.campaign.job_details.job_type)) {
    return result.campaign.job_details.job_type
      .map((job: any) => job.name || '')
      .filter(Boolean)
      .join('、');
  }
  return '';
};

// 送信件数を計算する関数
export const calculateSentCount = (candidateDetails: any): number => {
  if (!candidateDetails) return 0;
  
  // 配列の場合は要素数をカウント
  if (Array.isArray(candidateDetails)) {
    return candidateDetails.length;
  }
  
  // オブジェクトの場合は1件とカウント
  if (typeof candidateDetails === 'object') {
    return 1;
  }
  
  return 0;
};