// Improved error handling with retry logic
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const handleSupabaseError = async (error: any, retryCount = 0): Promise<never> => {
  console.error('Supabase error:', error);
  
  // Network errors with retry logic
  if (error.message === 'Failed to fetch' && retryCount < MAX_RETRIES) {
    await wait(RETRY_DELAY * Math.pow(2, retryCount));
    return handleSupabaseError(error, retryCount + 1);
  }
  
  // Network errors
  if (error.message === 'Failed to fetch') {
    throw new Error('ネットワークエラー: Supabaseとの接続に失敗しました。インターネット接続を確認してください。');
  }
  
  // Database errors
  if (error.code === 'PGRST301') {
    throw new Error('データベースエラー: Supabaseの設定を確認してください。');
  }
  
  // Authentication errors
  if (error.code === 'AUTH_INVALID_CREDENTIALS') {
    throw new Error('認証エラー: メールアドレスまたはパスワードが正しくありません。');
  }

  // Session errors
  if (error.code === 'session_not_found') {
    throw new Error('セッションが無効です。再度ログインしてください。');
  }

  // Rate limiting
  if (error.code === '429') {
    throw new Error('リクエスト制限: しばらく時間をおいてから再度お試しください。');
  }

  // Generic error with better formatting
  throw new Error(`エラーが発生しました: ${error.message || '不明なエラー'}`);
};

// Wrapper function for Supabase queries with retry logic
export const executeWithRetry = async <T>(
  operation: () => Promise<T>,
  retryCount = 0
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof Error && error.message === 'Failed to fetch' && retryCount < MAX_RETRIES) {
      await wait(RETRY_DELAY * Math.pow(2, retryCount));
      return executeWithRetry(operation, retryCount + 1);
    }
    throw error;
  }
};