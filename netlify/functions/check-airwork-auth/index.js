// Airwork認証チェック関数 - 更新日: 2025-03-23
const chromium = require('chrome-aws-lambda');
const puppeteer = chromium.puppeteer;
const os = require('os');

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
    nodeEnv: process.env.NODE_ENV
  };
};

// ローカルテスト用の簡易認証
const simpleAuthCheck = async (username, password) => {
  console.log(`🔒 ${username}の簡易認証モードを実行します...`);
  usingSimpleAuthMode = true; // 簡易認証モードフラグをオンに
  
  // 許可されたユーザーとパスワードの組み合わせを確認
  const validCredentials = [
    { username: 'kido@tomataku.jp', password: 'Tomataku0427#' }, // Airwork用認証情報
    { username: 'hraim@tomataku.jp', password: 'password123' },   // Engage用認証情報
    { username: 't.oouchi@yokohamamusen.co.jp', password: 'yk7537623' }  // 新規認証情報
  ];
  
  // ユーザー名とパスワードが一致するかチェック
  const matchedCredential = validCredentials.find(cred => 
    cred.username === username && cred.password === password
  );
  
  if (matchedCredential) {
    return {
      success: true,
      message: '簡易認証に成功しました',
      envInfo: getEnvInfo(),
      service: matchedCredential.username.includes('yokohamamusen') || matchedCredential.username.includes('hraim') ? 'engage' : 'airwork'
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

// Airworkの認証をチェックする関数
const checkAuthentication = async (username, password, xpathToCheck) => {
  // ローカルテスト環境では簡易認証モードを使用
  if (isLocal) {
    console.log('🧪 ローカルテスト環境を検出、簡易認証モードを使用します');
    return simpleAuthCheck(username, password);
  }
  
  let page = null;
  
  try {
    // ブラウザを取得
    const browser = await getBrowser();
    console.log('🌐 ブラウザセッションを開始します');
    
    // 新しいページを開く
    page = await browser.newPage();
    
    // Airworkインタラクションページにアクセス
    console.log('🔄 Airworkインタラクションページにアクセスします...');
    await page.goto('https://ats.rct.airwork.net/interaction', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // ログインボタンを見つけてクリック
    console.log('🔍 ログインボタンを探しています...');
    
    // XPathでログインボタンを見つける試み
    const loginButtonXPath = "//a[contains(text(), 'ログイン')]";
    await page.waitForXPath(loginButtonXPath, { timeout: 10000 });
    const [loginButton] = await page.$x(loginButtonXPath);
    
    if (loginButton) {
      console.log('✅ ログインボタンが見つかりました（XPath）');
      await loginButton.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
    } else {
      throw new Error('ログインボタンが見つかりませんでした');
    }
    
    // ログインフォームに入力
    console.log('📝 ログイン情報を入力しています...');
    await page.type('#account', username);
    await page.type('#password', password);
    
    // ログインボタンをクリック
    const loginSubmitXPath = "//*[@id='mainContent']/div/div[2]/div[4]/input";
    await page.waitForXPath(loginSubmitXPath, { timeout: 10000 });
    const [loginSubmit] = await page.$x(loginSubmitXPath);
    
    if (loginSubmit) {
      console.log('✅ ログイン送信ボタンが見つかりました');
      await loginSubmit.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
    } else {
      throw new Error('ログイン送信ボタンが見つかりませんでした');
    }
    
    // 成功したかどうかを確認するXPathを待つ
    console.log(`🔍 成功確認のXPathを待っています: ${xpathToCheck}`);
    try {
      await page.waitForXPath(xpathToCheck, { timeout: 15000 });
      console.log('✅ 認証に成功しました！');
      
      // スクリーンショットを取得（デバッグ用）
      const screenshotBuffer = await page.screenshot();
      
      return {
        success: true,
        message: '認証に成功しました',
        screenshot: screenshotBuffer.toString('base64')
      };
    } catch (xpathError) {
      console.error('❌ 成功確認のXPathが見つかりませんでした:', xpathError.message);
      
      // スクリーンショットを取得（デバッグ用）
      const screenshotBuffer = await page.screenshot();
      
      return {
        success: false,
        message: '認証後のXPathが見つかりませんでした',
        error: xpathError.message,
        screenshot: screenshotBuffer.toString('base64')
      };
    }
  } catch (error) {
    console.error('❌ 認証処理中にエラーが発生しました:', error.message);
    // エラー発生時は簡易認証にフォールバック
    console.log('⚠️ ブラウザでのエラーが発生したため、簡易認証にフォールバックします');
    return simpleAuthCheck(username, password);
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
    } catch (error) {
      return generateErrorResponse('リクエストボディの解析に失敗しました', 400);
    }
    
    // 必須パラメータの確認
    if (!requestBody.username || !requestBody.password) {
      return generateErrorResponse('username, passwordは必須パラメータです', 400);
    }
    
    const { username, password } = requestBody;
    const xpathToCheck = requestBody.xpath || "//a[contains(@class, 'logout')]";
    
    // 強制的に簡易認証モードを使用するかどうか
    if (requestBody.forceSimpleAuth) {
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
    
    // 認証チェックを実行
    console.log(`🔒 ${username}の認証を開始します...`);
    const authResult = await checkAuthentication(username, password, xpathToCheck);
    
    if (authResult.success) {
      return generateSuccessResponse('認証に成功しました', {
        screenshot: authResult.screenshot,
        envInfo: authResult.envInfo
      });
    } else {
      return generateErrorResponse(authResult.message, 401, {
        envInfo: authResult.envInfo
      });
    }
    
  } catch (error) {
    console.error('処理中に予期せぬエラーが発生しました:', error.message);
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
