// Engage認証チェック関数 - シンプル版 (名称変更版) - 更新日: 2025-03-24

// 環境変数を出力（デバッグ用）
console.log('Environment variables:', {
  netlify: process.env.NETLIFY,
  nodeEnv: process.env.NODE_ENV,
  functionName: process.env.FUNCTION_NAME,
  functionPath: process.env.LAMBDA_TASK_ROOT
});

// 簡易認証モードのフラグ (常にtrue)
const usingSimpleAuthMode = true;

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
      usingSimpleAuthMode,
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
      usingSimpleAuthMode,
      error: errorDetails
    })
  };
};

// 環境情報を取得
const getEnvInfo = () => {
  return {
    platform: process.platform,
    isNetlify: process.env.NETLIFY === 'true',
    cwd: process.cwd(),
    functionName: process.env.LAMBDA_TASK_ROOT || process.env.FUNCTION_NAME
  };
};

// 簡易認証チェック関数
const simpleAuthCheck = async (username, password) => {
  console.log(`🔒 ${username}の簡易認証を実行します...`);
  
  // 許可されたユーザーとパスワードの組み合わせを確認
  const validCredentials = [
    { username: 'hraim@tomataku.jp', password: 'password123' },
    // 他の有効な認証情報を追加可能
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

// メイン関数
exports.handler = async (event, context) => {
  console.log('関数が呼び出されました：', {
    httpMethod: event.httpMethod,
    path: event.path
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
      console.log('リクエストボディ:', requestBody);
    } catch (error) {
      console.error('リクエストボディ解析エラー:', error);
      return generateErrorResponse('リクエストボディの解析に失敗しました', 400);
    }
    
    // 必須パラメータの確認
    if (!requestBody.username || !requestBody.password) {
      return generateErrorResponse('username, passwordは必須パラメータです', 400);
    }
    
    const { username, password } = requestBody;
    
    // 簡易認証を実行
    console.log(`🔒 ${username}の認証を開始します...`);
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
    console.error('エラー詳細:', error);
    return generateErrorResponse('実行中にエラーが発生しました: ' + error.message, 500, {
      error: error.message,
      stack: error.stack,
      envInfo: getEnvInfo()
    });
  }
}; 