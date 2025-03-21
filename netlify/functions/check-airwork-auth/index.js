// 簡易版関数 - 更新日: 2025-03-21
const puppeteer = require('puppeteer-core');
const chromium = require('chrome-aws-lambda');

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

// ブラウザを取得する関数
const getBrowser = async () => {
  const executablePath = await chromium.executablePath;
  
  // デバッグ目的でパスを出力
  console.log('Chromium実行ファイルパス:', executablePath);
  
  // 本番環境とローカル環境で分岐
  if (process.env.NETLIFY) {
    return await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
  } else {
    // ローカル環境ではインストール済みのChromeを使用
    return await puppeteer.launch({
      args: ['--no-sandbox'],
      headless: true,
      executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    });
  }
};

// Airworkの認証をチェックする関数
const checkAuthentication = async (username, password, xpathToCheck) => {
  let browser;
  try {
    // ブラウザを取得
    browser = await getBrowser();
    console.log('🌐 ブラウザを起動しました');
    
    // 新しいページを開く
    const page = await browser.newPage();
    
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
    return {
      success: false,
      message: '認証処理中にエラーが発生しました',
      error: error.message
    };
  } finally {
    // ブラウザを閉じる
    if (browser) {
      await browser.close();
      console.log('🔒 ブラウザセッションを終了しました');
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
    
    // 認証チェックを実行
    console.log(`🔒 ${username}の認証を開始します...`);
    const authResult = await checkAuthentication(username, password, xpathToCheck);
    
    if (authResult.success) {
      return generateSuccessResponse('認証に成功しました', {
        screenshot: authResult.screenshot
      });
    } else {
      return generateErrorResponse(authResult.message, 401, {
        error: authResult.error,
        screenshot: authResult.screenshot
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
    return generateErrorResponse('実行中にエラーが発生しました: ' + error.message);
  }
};
