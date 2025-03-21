// 完全に新しいEngage簡易認証関数 - 更新日: 2025-03-23

// 環境変数を出力（デバッグ用）
console.log('Environment variables:', {
  netlify: process.env.NETLIFY,
  nodeEnv: process.env.NODE_ENV,
  functionName: process.env.FUNCTION_NAME,
  functionPath: process.env.LAMBDA_TASK_ROOT
});

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
      isSimpleMode: true,
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
      isSimpleMode: true,
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
    nodeEnv: process.env.NODE_ENV,
    nodeVersion: process.version
  };
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
    
    // 簡易認証チェック
    console.log(`🔒 ${username}の簡易認証を実行します...`);
    
    // 許可されたユーザーとパスワードの組み合わせを確認
    const validCredentials = [
      { username: 'hraim@tomataku.jp', password: 'password123' },
      // 他の有効な認証情報を追加
    ];
    
    const isValid = validCredentials.some(cred => 
      cred.username === username && cred.password === password
    );
    
    if (isValid) {
      console.log('✅ 認証成功');
      return generateSuccessResponse('認証に成功しました', {
        envInfo: getEnvInfo()
      });
    } else {
      console.log('❌ 認証失敗');
      return generateErrorResponse('認証失敗：ユーザー名またはパスワードが正しくありません', 401, {
        envInfo: getEnvInfo()
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