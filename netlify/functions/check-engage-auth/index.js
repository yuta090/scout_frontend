// Engage認証チェック関数 - 更新日: 2025-03-22
const chromium = require('chrome-aws-lambda');
const puppeteer = chromium.puppeteer;
const os = require('os');

// 環境変数をチェック
const isLocal = !process.env.NETLIFY;

// 環境変数を出力（デバッグ用）
console.log('Environment variables:', {
  netlify: process.env.NETLIFY,
  nodeEnv: process.env.NODE_ENV,
  functionName: process.env.FUNCTION_NAME,
  functionPath: process.env.LAMBDA_TASK_ROOT,
  nodeModules: process.env.NODE_PATH
});

// 現在のディレクトリの内容を出力
const fs = require('fs');
const path = require('path');
try {
  console.log('Current directory:', process.cwd());
  const files = fs.readdirSync(process.cwd());
  console.log('Directory contents:', files);
  
  // node_modulesの確認
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    const nodeModules = fs.readdirSync(nodeModulesPath);
    console.log('node_modules contents:', nodeModules);
  }
} catch (error) {
  console.error('Error checking directory:', error);
}

// CORS対応のためのヘッダーを設定
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

// OPTIONSリクエストへの対応
const handleOptions = () => {
  return {
    statusCode: 204,
    headers
  };
};

// 成功レスポンスの生成
const generateSuccessResponse = (message, data = {}) => {
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      message,
      ...data
    })
  };
};

// エラーレスポンスの生成
const generateErrorResponse = (message, statusCode = 500, errorDetails = null) => {
  return {
    statusCode,
    headers,
    body: JSON.stringify({
      success: false,
      message,
      error: errorDetails
    })
  };
};

// 環境情報を取得
const getEnvInfo = () => {
  return {
    platform: os.platform(),
    isNetlify: process.env.NETLIFY === 'true',
    cwd: process.cwd(),
    nodeEnv: process.env.NODE_ENV,
    nodeVersion: process.version,
    moduleCache: module.paths
  };
};

// 簡易認証チェック関数
const simpleAuthCheck = async (username, password) => {
  console.log(`🔒 ${username}の簡易認証を実行します...`);
  
  // 許可されたユーザーとパスワードの組み合わせを確認（本番環境では適宜変更）
  const validCredentials = [
    { username: 'hraim@tomataku.jp', password: 'password123' },
    // 他の有効な認証情報を追加
  ];
  
  const isValid = validCredentials.some(cred => 
    cred.username === username && cred.password === password
  );
  
  if (isValid) {
    console.log('✅ 認証成功');
    return {
      success: true,
      message: '認証に成功しました',
      envInfo: getEnvInfo()
    };
  } else {
    console.log('❌ 認証失敗');
    return {
      success: false,
      message: '認証失敗：ユーザー名またはパスワードが正しくありません',
      envInfo: getEnvInfo()
    };
  }
};

// ブラウザインスタンスをキャッシュ
let _browser = null;

// ブラウザを取得する関数
const getBrowser = async () => {
  if (_browser) {
    return _browser;
  }
  
  try {
    // Netlify環境向けに最適化された起動設定
    console.log('🌐 ブラウザを起動しています...');
    _browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true
    });
    console.log('✅ ブラウザの起動に成功しました');
    return _browser;
  } catch (error) {
    console.error('❌ ブラウザ起動エラー:', error);
    throw error;
  }
};

// メイン関数
exports.handler = async (event, context) => {
  console.log('Function called with event:', {
    method: event.httpMethod,
    path: event.path,
    headers: event.headers
  });
  
  // OPTIONSリクエストの処理
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  // POSTリクエスト以外は拒否
  if (event.httpMethod !== 'POST') {
    return generateErrorResponse('POSTリクエストのみ受け付けています', 405);
  }
  
  try {
    // リクエストボディの解析
    let requestBody;
    try {
      requestBody = JSON.parse(event.body || '{}');
      console.log('Request body parsed:', requestBody);
    } catch (error) {
      console.error('Error parsing request body:', error);
      return generateErrorResponse('リクエストボディの解析に失敗しました', 400);
    }
    
    // 必須パラメータの確認
    if (!requestBody.username || !requestBody.password) {
      return generateErrorResponse('username, passwordは必須パラメータです', 400);
    }
    
    const { username, password } = requestBody;
    
    // 常に簡易認証モードを使用する
    console.log('🧪 簡易認証モードを使用します');
    const authResult = await simpleAuthCheck(username, password);
    
    if (authResult.success) {
      return generateSuccessResponse('認証に成功しました', {
        envInfo: authResult.envInfo
      });
    } else {
      return generateErrorResponse(authResult.message, 401, {
        envInfo: authResult.envInfo
      });
    }
    
  } catch (error) {
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    return generateErrorResponse('実行中にエラーが発生しました: ' + error.message, 500, {
      error: error.message,
      stack: error.stack,
      envInfo: getEnvInfo()
    });
  }
}; 