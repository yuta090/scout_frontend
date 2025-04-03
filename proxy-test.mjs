import axios from 'axios';
import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = 3000;

// CORS設定
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// リクエスト内容をログに出力するミドルウェア
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// JSONボディパーサー
app.use(express.json());

// ヘルスチェックエンドポイント
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Proxy server is running' });
});

// 直接プロキシルート（/proxy-api以下のパスをAirworkにプロキシする）
app.use('/proxy-api', createProxyMiddleware({
  target: 'https://ats.rct.airwork.net',
  changeOrigin: true,
  pathRewrite: {
    '^/proxy-api': '/airplf/api/v1' // パスの書き換え
  },
  onProxyReq: (proxyReq, req, res) => {
    // リクエストヘッダーを追加/変更する場合はここで
    proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[プロキシレスポンス] ステータス: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error('プロキシエラー:', err);
    res.status(500).json({
      status: 'error',
      message: 'プロキシサーバーエラー',
      error: err.message
    });
  }
}));

// 手動プロキシエンドポイント（リクエストを受け取り、サーバー側でAPIを呼び出す）
app.post('/auth/login', async (req, res) => {
  try {
    console.log('認証リクエスト受信:', req.body);
    
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'ユーザー名とパスワードは必須です',
        details: {
          status: 'error',
          code: 'MISSING_CREDENTIALS',
          timestamp: new Date().toISOString()
        }
      });
    }
    
    console.log(`Airwork APIにリクエスト送信中... (ユーザー: ${username})`);
    
    const response = await axios.post('https://ats.rct.airwork.net/airplf/api/v1/auth/login', {
      account: username,
      password: password,
      remember: false
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
      },
      timeout: 15000, // 15秒タイムアウト
    });
    
    console.log('Airwork APIレスポンス:', response.status);
    
    // 成功レスポンスを返す
    return res.status(200).json({
      success: true,
      message: '認証に成功しました',
      details: {
        status: 'success',
        code: 'AUTH_SUCCESS',
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('認証エラー:', error.message);
    
    // エラーレスポンスを構築
    let errorResponse = {
      success: false,
      message: '認証に失敗しました',
      details: {
        status: 'error',
        code: 'AUTH_FAILED',
        timestamp: new Date().toISOString()
      }
    };
    
    if (error.response) {
      // サーバーからのレスポンスがある場合
      console.log(`ステータスコード: ${error.response.status}`);
      console.log('エラーデータ:', error.response.data);
      
      errorResponse.details.status = 'invalid_credentials';
      errorResponse.details.code = 'INVALID_CREDENTIALS';
      
      // ステータスコードに応じて詳細情報を設定
      if (error.response.status === 401) {
        errorResponse.message = 'ユーザー名またはパスワードが正しくありません';
      } else if (error.response.status === 429) {
        errorResponse.details.status = 'error';
        errorResponse.details.code = 'RATE_LIMIT';
        errorResponse.message = 'リクエスト制限に達しました。しばらく時間をおいてください';
      } else if (error.response.status === 423) {
        errorResponse.details.status = 'account_locked';
        errorResponse.details.code = 'ACCOUNT_LOCKED';
        errorResponse.message = 'アカウントがロックされています';
      }
      
      return res.status(error.response.status).json(errorResponse);
    } else if (error.request) {
      // リクエストは送信されたがレスポンスがない場合
      console.error('サーバーから応答がありませんでした');
      
      errorResponse.message = '認証サーバーへの接続に失敗しました';
      errorResponse.details.status = 'network_error';
      errorResponse.details.code = 'NETWORK_ERROR';
      
      return res.status(500).json(errorResponse);
    } else {
      // リクエスト作成時のエラー
      console.error('リクエスト設定エラー:', error.message);
      
      errorResponse.message = '認証リクエストの作成に失敗しました';
      errorResponse.details.status = 'error';
      errorResponse.details.code = 'REQUEST_SETUP_ERROR';
      errorResponse.details.error = error.message;
      
      return res.status(500).json(errorResponse);
    }
  }
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`\n🚀 プロキシサーバーが起動しました - http://localhost:${PORT}`);
  console.log(`\n使用例:`);
  console.log(`- 手動プロキシエンドポイント: http://localhost:${PORT}/auth/login`);
  console.log(`- 直接プロキシエンドポイント: http://localhost:${PORT}/proxy-api/auth/login`);
  console.log(`\nCtrl+Cで終了\n`);
}); 