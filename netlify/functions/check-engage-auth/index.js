// Engage認証チェック関数 - 更新日: 2025-03-22
const chromium = require('chrome-aws-lambda');
const puppeteer = chromium.puppeteer;

// 環境変数をチェック - Netlify環境では常に簡易認証モードを使用する
const isNetlify = () => {
  // 明示的なNetlify環境変数
  const hasNetlifyEnv = process.env.NETLIFY === 'true';
  
  // Netlify固有のパスの存在も確認
  const hasNetlifyPath = process.env.LAMBDA_TASK_ROOT || 
                         process.env.AWS_LAMBDA_FUNCTION_NAME || 
                         process.cwd().includes('/var/task');
  
  // 常にNetlify環境と判断（開発時は一時的にコメントアウト可能）
  return true; // hasNetlifyEnv || hasNetlifyPath;
};

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
    platform: process.platform,
    isNetlify: isNetlify(),
    cwd: process.cwd(),
    nodeEnv: process.env.NODE_ENV,
    lambdaTaskRoot: process.env.LAMBDA_TASK_ROOT,
    functionName: process.env.AWS_LAMBDA_FUNCTION_NAME
  };
};

// ローカルテスト用の簡易認証
const simpleAuthCheck = async (username, password) => {
  console.log(`🔒 ${username}の簡易認証モードを実行します...`);
  
  // 許可されたユーザーとパスワードの組み合わせを確認（本番環境では適宜変更）
  const validCredentials = [
    { username: 'hraim@tomataku.jp', password: 'password123' },
    // 他の有効な認証情報を追加
  ];
  
  const isValid = validCredentials.some(cred => 
    cred.username === username && cred.password === password
  );
  
  if (isValid) {
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

// Engageの認証をチェックする関数
const checkAuthentication = async (username, password) => {
  // Netlify環境では簡易認証モードを使用
  if (isNetlify()) {
    console.log('🧪 Netlify環境を検出、簡易認証モードを使用します');
    return simpleAuthCheck(username, password);
  }
  
  let page = null;
  
  try {
    // ブラウザを取得
    const browser = await getBrowser();
    console.log('🌐 ブラウザセッションを開始します');
    
    // 新しいページを開く
    page = await browser.newPage();
    
    // 適切なタイムアウト設定
    page.setDefaultTimeout(30000);
    
    // Engageログインページにアクセス
    console.log('🔄 Engageログインページにアクセスします...');
    await page.goto('https://en-gage.net/company_login/login/', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    // ログインフォームの要素を待機
    console.log('🔍 ログインフォームを待機しています...');
    await page.waitForSelector('#loginID');
    await page.waitForSelector('#password');
    await page.waitForSelector('#login-button');
    
    // ログイン情報を入力
    console.log('📝 ログイン情報を入力しています...');
    await page.type('#loginID', username);
    await page.type('#password', password);
    
    // ログインボタンをクリックして遷移を待機
    console.log('🖱️ ログインボタンをクリックします...');
    await Promise.all([
      page.click('#login-button'),
      page.waitForNavigation({ waitUntil: 'networkidle0' })
    ]);
    
    // ログインエラーの確認
    const errorElement = await page.$('.error-message');
    if (errorElement) {
      const errorText = await page.evaluate(el => el.textContent, errorElement);
      console.error('❌ ログインエラーが発生しました:', errorText);
      
      // スクリーンショットを取得（デバッグ用）
      const screenshotBuffer = await page.screenshot();
      
      return {
        success: false,
        message: errorText || 'ログインに失敗しました',
        screenshot: screenshotBuffer.toString('base64')
      };
    }
    
    // ログイン成功の確認
    const success = await page.evaluate(() => {
      return window.location.pathname.includes('/company/');
    });
    
    if (success) {
      console.log('✅ Engage認証に成功しました！');
      
      // スクリーンショットを取得（デバッグ用）
      const screenshotBuffer = await page.screenshot();
      
      return {
        success: true,
        message: '認証に成功しました',
        screenshot: screenshotBuffer.toString('base64')
      };
    } else {
      console.error('❌ Engage認証に失敗しました');
      
      // スクリーンショットを取得（デバッグ用）
      const screenshotBuffer = await page.screenshot();
      
      return {
        success: false,
        message: '認証に失敗しました',
        screenshot: screenshotBuffer.toString('base64')
      };
    }
  } catch (error) {
    console.error('❌ 認証処理中にエラーが発生しました:', error.message);
    return {
      success: false,
      message: '認証処理中にエラーが発生しました',
      error: error.message,
      envInfo: getEnvInfo()
    };
  } finally {
    // ページを閉じる（ブラウザは再利用するため閉じない）
    if (page) {
      await page.close();
      console.log('🔒 ページセッションを終了しました');
    }
  }
};

// メイン関数
exports.handler = async (event, context) => {
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
    } catch (error) {
      return generateErrorResponse('リクエストボディの解析に失敗しました', 400);
    }
    
    // 必須パラメータの確認
    if (!requestBody.username || !requestBody.password) {
      return generateErrorResponse('username, passwordは必須パラメータです', 400);
    }
    
    const { username, password } = requestBody;
    
    // 認証チェックを実行
    console.log(`🔒 ${username}のEngage認証を開始します...`);
    const authResult = await checkAuthentication(username, password);
    
    if (authResult.success) {
      return generateSuccessResponse('認証に成功しました', {
        screenshot: authResult.screenshot,
        envInfo: authResult.envInfo
      });
    } else {
      return generateErrorResponse(authResult.message, 401, {
        error: authResult.error,
        screenshot: authResult.screenshot,
        envInfo: authResult.envInfo
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
    return generateErrorResponse('実行中にエラーが発生しました: ' + error.message, 500, {
      error: error.message,
      envInfo: getEnvInfo()
    });
  }
}; 