// Airwork認証チェック関数 - 更新日: 2025-03-24
const chromium = require('chrome-aws-lambda');
const puppeteer = chromium.puppeteer;
const os = require('os');

// 詳細環境診断
console.log('🧪 デプロイ情報診断:', {
  date: new Date().toISOString(),
  deplyTimestamp: '2025-03-24T14:30:00',
  validationVersion: 'v2.0.0',
  env: {
    NETLIFY: process.env.NETLIFY,
    NODE_ENV: process.env.NODE_ENV,
    LAMBDA_TASK_ROOT: process.env.LAMBDA_TASK_ROOT,
    AWS_LAMBDA_FUNCTION_NAME: process.env.AWS_LAMBDA_FUNCTION_NAME,
    SITE_ID: process.env.SITE_ID
  },
  system: {
    platform: os.platform(),
    arch: os.arch(),
    release: os.release(),
    memory: `${Math.round(os.totalmem() / (1024 * 1024))}MB`,
    freemem: `${Math.round(os.freemem() / (1024 * 1024))}MB`,
    cpus: os.cpus().length
  }
});

// 環境変数をチェック
const isLocal = !process.env.NETLIFY;

// 簡易認証モードのフラグ (常にfalseに初期化)
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
    nodeEnv: process.env.NODE_ENV,
    functionVersion: '2.0.0'
  };
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

// サービスタイプに基づいて認証URLとXPathを選択
const getAuthConfig = (serviceType) => {
  // サービスタイプに基づいて異なる認証設定を返す
  if (serviceType === 'engage') {
    return {
      loginUrl: 'https://engage.com/login', // Engageのログインページ
      loginButtonXPath: "//a[contains(text(), 'ログイン')]",
      usernameSelector: '#username',
      passwordSelector: '#password',
      submitButtonXPath: "//button[contains(text(), 'ログイン')]",
      successXPath: "//a[contains(text(), 'ログアウト')]"
    };
  } else {
    // デフォルトはAirwork
    return {
      loginUrl: 'https://ats.rct.airwork.net/interaction',
      loginButtonXPath: "//a[contains(text(), 'ログイン')]",
      usernameSelector: '#account',
      passwordSelector: '#password',
      submitButtonXPath: "//*[@id='mainContent']/div/div[2]/div[4]/input",
      successXPath: "//a[contains(@class, 'logout')]"
    };
  }
};

// 認証をチェックする関数
const performAuthentication = async (username, password, serviceType) => {
  let page = null;
  
  try {
    // サービスタイプに基づいて認証設定を取得
    const authConfig = getAuthConfig(serviceType);
    console.log(`🔧 認証設定: ${serviceType || 'airwork'}`);
    
    // ブラウザを取得
    const browser = await getBrowser();
    console.log('🌐 ブラウザセッションを開始します');
    
    // 新しいページを開く
    page = await browser.newPage();
    
    // ログインページにアクセス
    console.log(`🔄 ${serviceType || 'airwork'}のログインページにアクセスします...`);
    await page.goto(authConfig.loginUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // ログインボタンを見つけてクリック
    console.log('🔍 ログインボタンを探しています...');
    
    // XPathでログインボタンを見つける試み
    try {
      await page.waitForXPath(authConfig.loginButtonXPath, { timeout: 10000 });
      const [loginButton] = await page.$x(authConfig.loginButtonXPath);
      
      if (loginButton) {
        console.log('✅ ログインボタンが見つかりました');
        await loginButton.click();
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
      } else {
        console.log('⚠️ ログインボタンが見つかりませんでした - フォームが既に表示されている可能性があります');
      }
    } catch (err) {
      console.log('⚠️ ログインボタンの待機中にタイムアウト - フォームが既に表示されている可能性があります');
    }
    
    // ログインフォームに入力
    console.log('📝 ログイン情報を入力しています...');
    await page.type(authConfig.usernameSelector, username);
    await page.type(authConfig.passwordSelector, password);
    
    // ログインボタンをクリック
    await page.waitForXPath(authConfig.submitButtonXPath, { timeout: 10000 });
    const [loginSubmit] = await page.$x(authConfig.submitButtonXPath);
    
    if (loginSubmit) {
      console.log('✅ ログイン送信ボタンが見つかりました');
      await loginSubmit.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
    } else {
      throw new Error('ログイン送信ボタンが見つかりませんでした');
    }
    
    // 成功したかどうかを確認するXPathを待つ
    console.log(`🔍 成功確認のXPathを待っています: ${authConfig.successXPath}`);
    try {
      await page.waitForXPath(authConfig.successXPath, { timeout: 15000 });
      console.log('✅ 認証に成功しました！');
      
      // スクリーンショットを取得（デバッグ用）
      const screenshotBuffer = await page.screenshot();
      
      return {
        success: true,
        message: '認証に成功しました',
        screenshot: screenshotBuffer.toString('base64'),
        service: serviceType || 'airwork'
      };
    } catch (xpathError) {
      console.error('❌ 成功確認のXPathが見つかりませんでした:', xpathError.message);
      
      // スクリーンショットを取得（デバッグ用）
      const screenshotBuffer = await page.screenshot();
      
      return {
        success: false,
        message: '認証に失敗しました: ユーザー名またはパスワードが正しくないか、ログイン後の画面が想定と異なります',
        error: xpathError.message,
        screenshot: screenshotBuffer.toString('base64'),
        service: serviceType || 'airwork'
      };
    }
  } catch (error) {
    console.error('❌ 認証処理中にエラーが発生しました:', error.message);
    return {
      success: false,
      message: `認証処理中にエラーが発生しました: ${error.message}`,
      error: error.message,
      stack: error.stack,
      service: serviceType || 'airwork'
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
  console.log('📣 関数呼び出し情報:', {
    httpMethod: event.httpMethod,
    path: event.path,
    functionName: context.functionName || 'unknown',
    headers: Object.keys(event.headers || {})
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
      console.log('📝 リクエスト内容:', {
        username: requestBody.username,
        hasPassword: !!requestBody.password,
        serviceType: requestBody.serviceType
      });
    } catch (error) {
      return generateErrorResponse('リクエストボディの解析に失敗しました', 400);
    }
    
    // 必須パラメータの確認
    if (!requestBody.username || !requestBody.password) {
      return generateErrorResponse('username, passwordは必須パラメータです', 400);
    }
    
    const { username, password, serviceType } = requestBody;
    
    // forceSimpleAuthが指定されていても無視し、常に実際の認証テストを実行
    console.log(`🔒 ${username}の認証を開始します... サービス: ${serviceType || 'airwork'}`);
    
    // 認証処理を実行
    const authResult = await performAuthentication(username, password, serviceType);
    
    if (authResult.success) {
      return generateSuccessResponse('認証に成功しました', {
        screenshot: authResult.screenshot,
        service: authResult.service,
        envInfo: getEnvInfo()
      });
    } else {
      return generateErrorResponse(authResult.message, 401, {
        error: authResult.error,
        screenshot: authResult.screenshot,
        service: authResult.service,
        envInfo: getEnvInfo()
      });
    }
    
  } catch (error) {
    console.error('❌ 処理中に予期せぬエラーが発生しました:', error.message);
    console.error('📚 エラースタック:', error.stack);
    
    return generateErrorResponse('認証処理に失敗しました: ' + error.message, 500, {
      error: error.message,
      stack: error.stack,
      envInfo: getEnvInfo()
    });
  }
};
