const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const fs = require('fs');
const path = require('path');
const os = require('os');

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

// エラーレスポンスの生成関数
const generateErrorResponse = (message, code, details = {}) => {
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: false,
      message,
      details: {
        status: 'error',
        code,
        timestamp: new Date().toISOString(),
        ...details
      }
    })
  };
};

// 成功レスポンスの生成関数
const generateSuccessResponse = (message, details = {}) => {
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      message,
      details: {
        status: 'success',
        timestamp: new Date().toISOString(),
        ...details
      }
    })
  };
};

// 認証処理を行う関数
exports.handler = async (event, context) => {
  // OPTIONSメソッドへの対応
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  // リクエストがPOSTであることを確認
  if (event.httpMethod !== 'POST') {
    return generateErrorResponse(
      'POSTリクエストが必要です',
      'METHOD_NOT_ALLOWED'
    );
  }

  let requestData;
  try {
    requestData = JSON.parse(event.body);
  } catch (error) {
    return generateErrorResponse(
      'リクエストボディの解析に失敗しました',
      'INVALID_REQUEST'
    );
  }

  // 必要なパラメータが揃っているか確認
  const { username, password, xpath } = requestData;
  if (!username || !password) {
    return generateErrorResponse(
      'ユーザー名とパスワードが必要です',
      'MISSING_PARAMETERS'
    );
  }

  const targetXPath = xpath || "//a[contains(@class, 'logout')]"; // デフォルトのXPath
  console.log(`🔒 ${username} の認証を開始します...`);
  console.log(`🔍 成功判定XPath: ${targetXPath}`);

  // Puppeteerを使用した認証処理
  let browser = null;
  try {
    console.log('🌐 Puppeteerでのブラウザを起動中...');
    console.log('🔍 環境診断:', { nodeVersion: process.version, platform: process.platform, arch: process.arch });
    
    // Netlify Functions環境用の設定（常にchromiumを使用）
    console.log('🌐 Serverless環境: @sparticuz/chromiumを使用します');
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    console.log('🌐 ブラウザが起動しました');
    const page = await browser.newPage();
    
    // デバッグ用: ネットワークリクエストをログに記録
    page.on('request', request => {
      console.log(`📤 リクエスト: ${request.url().substring(0, 100)}`);
    });
    
    page.on('requestfailed', request => {
      console.log(`❌ リクエスト失敗: ${request.url().substring(0, 100)}, ${request.failure().errorText}`);
    });
    
    page.on('response', response => {
      console.log(`📥 レスポンス: ${response.url().substring(0, 100)} - ${response.status()}`);
    });
    
    // 本物のブラウザに見せるための偽装設定
    await page.evaluateOnNewDocument(() => {
      // 一般的なChrome情報を設定
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      Object.defineProperty(navigator, 'language', { get: () => 'ja-JP' });
      Object.defineProperty(navigator, 'languages', { get: () => ['ja-JP', 'ja', 'en-US', 'en'] });
      
      // Chromeオブジェクトを模倣
      window.chrome = {
        runtime: {},
        loadTimes: function() {},
        csi: function() {},
        app: {},
        webstore: {}
      };
      
      // プラグイン配列を設定
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5]
      });
    });
    
    // ユーザーエージェントを設定
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36');
    
    // 初期画面に移動
    console.log('🌐 インタラクションページにアクセスします: https://ats.rct.airwork.net/interaction');
    await page.goto('https://ats.rct.airwork.net/interaction', {
      waitUntil: 'networkidle0',
      timeout: 60000
    });
    
    console.log('✅ インタラクションページにアクセスしました');
    
    // ページのスクリーンショットを取得（デバッグ用）
    const screenshotPath = path.join(os.tmpdir(), 'interaction-page.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 インタラクションページのスクリーンショットを保存しました: ${screenshotPath}`);
    
    // ログインボタンを探して3つの方法で試行
    console.log('🔍 ログインボタンを探しています...');
    
    // JavaScriptでボタンを直接探す
    const buttonFound = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('a, button'));
      const loginButton = buttons.find(button => 
        button.textContent.includes('ログイン') || 
        button.innerText.includes('ログイン')
      );
      
      if (loginButton) {
        loginButton.click();
        return true;
      }
      return false;
    });
    
    if (buttonFound) {
      console.log('✅ JavaScriptでログインボタンを見つけてクリックしました');
    } else {
      throw new Error('ログインボタンが見つかりませんでした');
    }
    
    // ログインページへのリダイレクトを待機
    console.log('⏳ ログインページへのリダイレクトを待機中...');
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 });
    
    // 現在のURLを確認
    const currentUrl = page.url();
    console.log(`📍 現在のURL: ${currentUrl}`);
    
    // ログインフォームのスクリーンショットを取得
    const loginScreenshotPath = path.join(os.tmpdir(), 'login-page.png');
    await page.screenshot({ path: loginScreenshotPath });
    console.log(`📸 ログインページのスクリーンショットを保存しました: ${loginScreenshotPath}`);
    
    // ログインフォームを入力して送信
    console.log('🔑 ログインフォームを入力します');
    
    try {
      // XPathを使用してフォーム要素を特定
      console.log('XPathを使用してIDとパスワードのフィールドを探します');
      
      // アカウント入力欄を探して入力
      const accountInputXPath = '//*[@id="account"]';
      const passwordInputXPath = '//*[@id="password"]';
      const loginButtonXPath = '//*[@id="mainContent"]/div/div[2]/div[4]/input';
      
      // アカウント入力
      const accountElement = await page.waitForXPath(accountInputXPath, { visible: true, timeout: 5000 });
      if (accountElement) {
        console.log('✅ アカウント入力欄を発見しました');
        await accountElement.type(username);
      } else {
        console.log('❌ アカウント入力欄が見つかりませんでした');
      }
      
      // パスワード入力
      const passwordElement = await page.waitForXPath(passwordInputXPath, { visible: true, timeout: 5000 });
      if (passwordElement) {
        console.log('✅ パスワード入力欄を発見しました');
        await passwordElement.type(password);
      } else {
        console.log('❌ パスワード入力欄が見つかりませんでした');
      }
      
      // ログインボタンをクリック
      console.log('🖱️ XPathを使用してログインボタンをクリックします');
      const loginButton = await page.waitForXPath(loginButtonXPath, { visible: true, timeout: 5000 });
      if (loginButton) {
        console.log('✅ ログインボタンを発見しました');
        await loginButton.click();
        console.log('✅ ログインボタンをクリックしました');
      } else {
        console.log('❌ ログインボタンが見つかりませんでした');
        throw new Error('ログインボタンが見つかりませんでした');
      }
      
    } catch (error) {
      console.log('❌ XPathでの要素検出に失敗:', error.message);
      
      // 失敗した場合はフォールバック：従来のセレクタ方法を試す
      console.log('⚠️ フォールバック: 従来のセレクタによる検出を試みます');
      
      // フォーム要素を検索して入力
      const formFilled = await page.evaluate((username, password) => {
        // ユーザー名入力欄を探す
        let usernameInput = null;
        ['input#account', '#account', 'input[name="account"]', 'input[type="email"]', 'input[name="email"]', 'input[name="userId"]', 'input[id="userId"]']
          .forEach(selector => {
            if (!usernameInput) {
              usernameInput = document.querySelector(selector);
            }
          });
        
        // パスワード入力欄を探す
        let passwordInput = null;
        ['input#password', '#password', 'input[type="password"]', 'input[name="password"]', 'input[id="password"]']
          .forEach(selector => {
            if (!passwordInput) {
              passwordInput = document.querySelector(selector);
            }
          });
        
        if (usernameInput && passwordInput) {
          usernameInput.value = username;
          passwordInput.value = password;
          return true;
        }
        return false;
      }, username, password);
      
      if (formFilled) {
        console.log('✅ フォーム入力完了');
      } else {
        console.log('❌ フォーム要素が見つかりませんでした');
        throw new Error('ログインフォームの入力に失敗しました');
      }
      
      // フォームの送信ボタンをクリック
      console.log('🖱️ ログインボタンをクリックします');
      
      const loginSubmitted = await page.evaluate(() => {
        // 送信ボタンを探す
        let submitButton = null;
        ['input[type="submit"]', 'button[type="submit"]', 'input.login', '.login-button', '.submit-button']
          .forEach(selector => {
            if (!submitButton) {
              submitButton = document.querySelector(selector);
            }
          });
        
        if (submitButton) {
          submitButton.click();
          return true;
        }
        
        return false;
      });
      
      if (!loginSubmitted) {
        console.log('❌ ログインボタンのクリックに失敗しました');
        throw new Error('ログインボタンのクリックに失敗しました');
      }
    }
    
    // ログイン後のページ遷移を待機
    console.log('⏳ ログイン処理後のページ遷移を待機中...');
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }).catch(e => {
      console.log('⚠️ ナビゲーション待機でタイムアウト:', e.message);
    });
    
    // 現在のURLを確認
    const afterLoginUrl = page.url();
    console.log(`📍 ログイン後のURL: ${afterLoginUrl}`);
    
    // ログイン後のページのスクリーンショットを取得（デバッグ用）
    const afterLoginScreenshotPath = path.join(os.tmpdir(), 'after-login.png');
    await page.screenshot({ path: afterLoginScreenshotPath, fullPage: true });
    console.log(`📸 ログイン後のページのスクリーンショットを保存しました: ${afterLoginScreenshotPath}`);
    
    // ページのHTMLソースを取得してログアウトリンクを探す
    console.log('🔍 ページのHTMLを確認してログアウト要素を探します...');
    const pageContent = await page.content();
    const logoutKeywords = ['logout', 'log-out', 'ログアウト', 'サインアウト', 'sign-out', 'signout'];
    
    // キーワードに基づいてHTML内を検索
    const keywordFound = logoutKeywords.some(keyword => 
      pageContent.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (keywordFound) {
      console.log('✅ ページ内にログアウト関連のキーワードが見つかりました');
    } else {
      console.log('❌ ページ内にログアウト関連のキーワードが見つかりませんでした');
    }
    
    // 複数のXPathを試行
    let xpathFound = false;
    const xpathsToTry = [
      targetXPath,
      "//a[contains(@class, 'logout')]",
      "//a[contains(text(), 'ログアウト')]",
      "//button[contains(text(), 'ログアウト')]",
      "//a[contains(@href, 'logout')]",
      "//button[contains(@class, 'logout')]",
      "//div[contains(@class, 'logout')]",
      "//span[contains(text(), 'ログアウト')]"
    ];
    
    let successXPath = null;
    
    for (const xpathToTry of xpathsToTry) {
      try {
        const elements = await page.$x(xpathToTry);
        if (elements.length > 0) {
          console.log(`✅ XPath "${xpathToTry}" で ${elements.length} 個の要素が見つかりました`);
          xpathFound = true;
          successXPath = xpathToTry;
          break;
        }
      } catch (error) {
        console.log(`❌ XPath "${xpathToTry}" の検索中にエラーが発生しました: ${error.message}`);
      }
    }
    
    if (!xpathFound && keywordFound) {
      // キーワードは見つかったがXPathで要素が見つからない場合
      console.log('⚠️ ログアウト関連のキーワードは見つかりましたが、XPathでの要素検出に失敗しました');
      
      // ページ内の全リンクを取得して分析
      const allLinks = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a')).map(a => {
          return {
            text: a.innerText.trim(),
            href: a.href,
            classes: a.className
          };
        }).filter(a => a.text !== '');
      });
      
      // リンク情報をログに記録
      console.log(`📋 ページ内のリンク数: ${allLinks.length}`);
      if (allLinks.length < 20) {  // リンクが多すぎる場合は表示しない
        console.log(JSON.stringify(allLinks, null, 2));
      }
      
      // ログアウト関連のリンクを探す
      const logoutLinks = allLinks.filter(link => 
        logoutKeywords.some(keyword => 
          link.text.toLowerCase().includes(keyword.toLowerCase()) || 
          (link.href && link.href.toLowerCase().includes(keyword.toLowerCase()))
        )
      );
      
      if (logoutLinks.length > 0) {
        console.log('✅ リンク分析からログアウト関連のリンクが見つかりました');
        xpathFound = true; // キーワード検索とリンク分析から成功と判断
      }
    }
    
    // ブラウザを閉じる
    if (browser) {
      await browser.close();
      console.log('🏁 ブラウザを閉じました');
    }
    
    // ログイン結果を返す
    if (xpathFound) {
      return generateSuccessResponse('ログインに成功しました', {
        url: afterLoginUrl,
        foundXPath: successXPath || 'キーワード検索から検出',
        loginStatus: 'success'
      });
    } else if (keywordFound) {
      return generateSuccessResponse('ログインに成功しましたが、指定されたXPathでは要素が見つかりませんでした', {
        url: afterLoginUrl,
        loginStatus: 'partial',
        note: 'ログアウト関連のキーワードは検出されました'
      });
    } else {
      return generateErrorResponse(
        'ログインには成功しましたが、認証確認要素が見つかりませんでした',
        'VERIFICATION_FAILED',
        {
          loginUrl: currentUrl,
          afterLoginUrl: afterLoginUrl,
          screenshotPath: afterLoginScreenshotPath
        }
      );
    }
    
  } catch (error) {
    console.log('❌ 例外が発生しました:', error.message);
    
    // ブラウザを閉じる
    if (browser) {
      try {
        await browser.close();
        console.log('🏁 ブラウザを閉じました');
      } catch (closeError) {
        console.log('❌ ブラウザクローズエラー:', closeError.message);
      }
    }
    
    return generateErrorResponse(
      'Puppeteerによる認証処理中にエラーが発生しました',
      'PUPPETEER_ERROR',
      {
        errorMessage: error.message,
        stack: error.stack,
        errorType: error.constructor.name
      }
    );
  }
}; 