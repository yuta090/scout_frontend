// Engage認証チェック関数 - 更新日: 2025-03-24
const os = require('os');

// 環境変数をチェックして詳細ログを出力
console.log('🔍 環境変数診断:', {
  NETLIFY: process.env.NETLIFY,
  NODE_ENV: process.env.NODE_ENV,
  LAMBDA_TASK_ROOT: process.env.LAMBDA_TASK_ROOT,
  AWS_LAMBDA_FUNCTION_NAME: process.env.AWS_LAMBDA_FUNCTION_NAME,
  PATH: process.env.PATH,
  LD_LIBRARY_PATH: process.env.LD_LIBRARY_PATH,
  platform: os.platform(),
  release: os.release(),
  arch: os.arch(),
  totalMemory: os.totalmem(),
  freeMemory: os.freemem()
});

// 環境変数をチェック
const isLocal = !process.env.NETLIFY;

// 簡易認証モードのフラグ
let usingSimpleAuthMode = false;

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
      usingSimpleAuthMode, // 簡易認証モードかどうかのフラグを追加
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
      usingSimpleAuthMode, // 簡易認証モードかどうかのフラグを追加
      error: errorDetails
    })
  };
};

// 環境情報を取得
const getEnvInfo = () => {
  return {
    platform: os.platform(),
    isNetlify: !!process.env.NETLIFY,
    cwd: process.cwd(),
    lambdaTaskRoot: process.env.LAMBDA_TASK_ROOT,
    functionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
    nodeVersion: process.version,
    totalmem: `${Math.round(os.totalmem() / 1024 / 1024)}MB`,
    freemem: `${Math.round(os.freemem() / 1024 / 1024)}MB`
  };
};

// ローカルテスト用の簡易認証
const simpleAuthCheck = async (username, password) => {
  console.log(`🔒 ${username}の簡易認証モードを実行します...`);
  usingSimpleAuthMode = true; // 簡易認証モードフラグをオンに
  
  // 許可されたユーザーとパスワードの組み合わせを確認
  if (username === 'hraim@tomataku.jp' && password === 'password123') {
    return {
      success: true,
      message: '簡易認証に成功しました',
      envInfo: getEnvInfo()
    };
  } else {
    return {
      success: false,
      message: '認証失敗：ユーザー名またはパスワードが正しくありません',
      envInfo: getEnvInfo()
    };
  }
};

// Engage認証（実験的）
const tryExperimentalAuth = async () => {
  try {
    console.log('📦 動的モジュールロードを試みます');
    // モジュールが利用可能か確認
    const fs = require('fs');
    
    // chrome-aws-lambdaが存在するか確認
    try {
      const chromePath = require.resolve('chrome-aws-lambda');
      console.log('✅ chrome-aws-lambdaが見つかりました:', chromePath);
    } catch (err) {
      console.log('❌ chrome-aws-lambdaが見つかりません:', err.message);
    }
    
    // puppeteerが存在するか確認
    try {
      const puppeteerPath = require.resolve('puppeteer-core');
      console.log('✅ puppeteer-coreが見つかりました:', puppeteerPath);
    } catch (err) {
      console.log('❌ puppeteer-coreが見つかりません:', err.message);
    }
    
    // ライブラリパスを確認
    if (process.env.LD_LIBRARY_PATH) {
      const libraryPaths = process.env.LD_LIBRARY_PATH.split(':');
      console.log('📚 ライブラリパス一覧:');
      for (const path of libraryPaths) {
        console.log(`- ${path}`);
        try {
          const files = fs.readdirSync(path);
          console.log(`  内容: ${files.slice(0, 5).join(', ')}${files.length > 5 ? '...' : ''}`);
        } catch (err) {
          console.log(`  ❌ 読み取りエラー: ${err.message}`);
        }
      }
    }
    
    return {
      success: false,
      message: '実験的認証はサポートされていません',
      diagnosticInfo: {
        modules: {
          'chrome-aws-lambda': Boolean(require.resolve('chrome-aws-lambda', { paths: [process.cwd()] })),
          'puppeteer-core': Boolean(require.resolve('puppeteer-core', { paths: [process.cwd()] }))
        }
      }
    };
  } catch (error) {
    console.error('🧪 実験的認証の診断中にエラー:', error);
    return {
      success: false,
      message: '実験的認証の診断エラー',
      error: error.message
    };
  }
};

// メイン関数
exports.handler = async (event, context) => {
  console.log('🚀 関数起動: check-engage-auth');
  console.log('📋 コンテキスト情報:', {
    functionName: context.functionName,
    functionVersion: context.functionVersion,
    memoryLimitInMB: context.memoryLimitInMB,
    remainingTime: context.getRemainingTimeInMillis ? context.getRemainingTimeInMillis() : 'N/A',
    awsRequestId: context.awsRequestId
  });
  
  // usingSimpleAuthModeをリセット
  usingSimpleAuthMode = false;
  
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
      requestBody = JSON.parse(event.body);
      console.log('📝 リクエスト内容:', requestBody);
    } catch (error) {
      return generateErrorResponse('リクエストボディの解析に失敗しました', 400);
    }
    
    // 必須パラメータの確認
    if (!requestBody.username || !requestBody.password) {
      return generateErrorResponse('username, passwordは必須パラメータです', 400);
    }
    
    const { username, password } = requestBody;
    
    // 診断モードを有効にするかどうか
    if (requestBody.diagnosticMode) {
      console.log('🧪 診断モードを実行します');
      const diagnosticResult = await tryExperimentalAuth();
      return generateSuccessResponse('診断完了', diagnosticResult);
    }
    
    // 強制的に簡易認証モードを使用するかどうか
    if (requestBody.forceSimpleAuth || isLocal || process.env.NETLIFY) {
      console.log('⚠️ 強制的に簡易認証モードを使用します');
      const authResult = await simpleAuthCheck(username, password);
      
      if (authResult.success) {
        return generateSuccessResponse('強制簡易認証に成功しました', {
          envInfo: authResult.envInfo
        });
      } else {
        return generateErrorResponse(authResult.message, 401, {
          envInfo: authResult.envInfo
        });
      }
    }
    
    // 通常のフローでは常に簡易認証モードを使用（Puppeteerは使用しない）
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
    console.error('❌ 処理中に予期せぬエラーが発生しました:', error.message);
    console.error('📚 エラースタック:', error.stack);
    
    // 最終手段として簡易認証にフォールバック
    try {
      console.log('⚠️ 予期せぬエラーが発生したため、最終手段として簡易認証を試みます');
      const { username, password } = JSON.parse(event.body);
      const authResult = await simpleAuthCheck(username, password);
      
      if (authResult.success) {
        return generateSuccessResponse('エラー後の簡易認証に成功しました', {
          error: error.message,
          envInfo: authResult.envInfo
        });
      } else {
        return generateErrorResponse(authResult.message, 401, {
          originalError: error.message,
          envInfo: authResult.envInfo
        });
      }
    } catch (fallbackError) {
      return generateErrorResponse('認証処理に完全に失敗しました: ' + error.message, 500, {
        originalError: error.message,
        fallbackError: fallbackError.message
      });
    }
  }
}; 