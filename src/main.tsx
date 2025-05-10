import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App';
import './index.css';

// デバッグ情報をコンソールに記録
console.log('🚀 アプリケーション初期化開始');

// QueryClientの設定
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分
      cacheTime: 1000 * 60 * 30, // 30分
      refetchOnWindowFocus: false,
    },
  },
});

console.log('📦 React Query設定:', {
  queryClient: !!queryClient,
  staleTime: queryClient.getDefaultOptions()?.queries?.staleTime,
  cacheTime: queryClient.getDefaultOptions()?.queries?.cacheTime,
  refetchOnWindowFocus: queryClient.getDefaultOptions()?.queries?.refetchOnWindowFocus,
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}

console.log('🌳 ルート要素を取得しました');

const root = createRoot(rootElement);

console.log('🔄 アプリケーションをレンダリングします');

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </StrictMode>
);

console.log('✅ アプリケーションのレンダリングが完了しました');