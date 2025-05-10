import { QueryClient } from 'react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分間はデータを新鮮と見なす
      cacheTime: 60 * 60 * 1000, // 60分間キャッシュを保持
      refetchOnWindowFocus: false, // ウィンドウフォーカス時の再取得を無効化
      retry: 1, // エラー時に1回だけ再試行
      keepPreviousData: true, // 新しいデータが取得されるまで前のデータを保持
    },
  },
});