const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

exports.handler = async function(event, context) {
  // CORS対応
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
  
  // OPTIONSリクエスト（プリフライト）への対応
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  console.log('認証リクエスト受信');
  
  // リクエストボディのパース
  let requestData;
  try {
    requestData = JSON.parse(event.body);
  } catch (e) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'リクエスト形式が不正です',
        details: {
          status: 'error',
          code: 'INVALID_REQUEST',
          timestamp: new Date().toISOString()
        }
      })
    };
  }

  // 認証情報の取得と検証
  const { username, password } = requestData;
  
  if (!username || !password) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'ユーザー名とパスワードは必須です',
        details: {
          status: 'error',
          code: 'MISSING_CREDENTIALS',
          timestamp: new Date().toISOString()
        }
      })
    };
  }
  
  let browser;
  try {
    console.log('ブラウザを起動中...');
    browser = await puppeteer.launch({
      args: [...chromium.args, '--no-sandbox'],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
    
    console.log('ページを開いています...');
    const page = await browser.newPage();
    
    // ユーザーエージェントを設定
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // リクエストのタイムアウト設定
    page.setDefaultNavigationTimeout(30000);
    page.setDefaultTimeout(30000);
    
    // ログイン処理
    console.log('Airworkにアクセス中...');
    await page.goto('https://ats.rct.airwork.net/interaction', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    console.log('現在のURL:', page.url());
    
    // 要素が表示されるまで待機
    await page.waitForSelector('input[name="account"]', { timeout: 10000 })
      .catch(e => console.log('アカウント入力欄が見つかりません:', e.message));
    
    console.log('ログインフォームに入力中...');
    await page.type('input[name="account"]', username);
    await page.type('input[name="password"]', password);
    
    // ログインボタンを探す
    const submitButton = await page.$('button[type="submit"]');
    if (!submitButton) {
      throw new Error('ログインボタンが見つかりません');
    }
    
    console.log('ログイン実行中...');
    await Promise.all([
      submitButton.click(),
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 })
    ]);
    
    // ログイン結果を判定
    const currentUrl = page.url();
    console.log(`ログイン後のURL: ${currentUrl}`);
    
    // ダッシュボードにリダイレクトされたか確認
    const isLoggedIn = currentUrl.includes('/dashboards');
    
    let errorMessage = '';
    if (!isLoggedIn) {
      // エラーメッセージの取得
      errorMessage = await page.evaluate(() => {
        const errorEl = document.querySelector('.error-message');
        return errorEl ? errorEl.textContent.trim() : '';
      });
      console.log('エラーメッセージ:', errorMessage || 'エラーメッセージなし');
    }
    
    // スクリーンショットの取得（デバッグ用）
    await page.screenshot({ path: '/tmp/login-screenshot.png' })
      .catch(e => console.log('スクリーンショット取得エラー:', e.message));
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: isLoggedIn,
        message: isLoggedIn ? 'ログインに成功しました' : `ログインに失敗しました${errorMessage ? ': ' + errorMessage : ''}`,
        details: {
          status: isLoggedIn ? 'success' : 'invalid_credentials',
          code: isLoggedIn ? 'AUTH_SUCCESS' : 'AUTH_FAILED',
          url: currentUrl,
          timestamp: new Date().toISOString()
        }
      })
    };
    
  } catch (error) {
    console.error('認証処理エラー:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: '認証処理中にエラーが発生しました',
        details: {
          status: 'error',
          code: 'PROCESSING_ERROR',
          error: error.message,
          timestamp: new Date().toISOString()
        }
      })
    };
  } finally {
    if (browser) {
      console.log('ブラウザを終了します');
      await browser.close();
    }
  }
};