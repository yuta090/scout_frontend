#!/usr/bin/env node
const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');
const path = require('path');
const os = require('os');

// 追加: Chromiumのインストール確認
async function verifyChromium() {
  try {
    console.log('Chromiumの検証を開始...');
    
    // Chromiumのパスを取得
    const execPath = await chromium.executablePath();
    console.log(`Chromiumパス: ${execPath}`);
    
    // ファイルの存在確認
    const fs = require('fs');
    const exists = fs.existsSync(execPath);
    console.log(`ファイルが存在するか: ${exists}`);
    
    if (exists) {
      // ファイルの権限確認
      const stats = fs.statSync(execPath);
      console.log(`ファイル権限: ${stats.mode.toString(8)}`);
      
      // 実行権限を付与
      if ((stats.mode & 0o111) === 0) {
        console.log('実行権限を付与します...');
        fs.chmodSync(execPath, stats.mode | 0o111);
        console.log(`新しい権限: ${fs.statSync(execPath).mode.toString(8)}`);
      }
    }
    
    return exists;
  } catch (error) {
    console.error('Chromium検証エラー:', error);
    return false;
  }
}

// テスト関数
async function runTest() {
  // Chromiumの検証
  const chromiumValid = await verifyChromium();
  if (!chromiumValid) {
    console.error('Chromiumが正しく設定されていません。処理を中止します。');
    return;
  }

  const username = process.argv[2] || 'kido@tomataku.jp';
  const password = process.argv[3] || 'Tomataku0427#';
  const xpath = process.argv[4] || "//a[contains(@class, 'logout')]";

  console.log('='.repeat(70));
  console.log(`🧪 AirWork ログインテスト`);
  console.log(`👤 ユーザー: ${username}`);
  console.log(`🔍 チェックするXPath: ${xpath}`);
  console.log('='.repeat(70));

  let browser = null;
  try {
    console.log('\n🌐 ブラウザを起動中...');
    
    // 環境情報を表示
    console.log('🔧 環境情報:');
    console.log(`  Node.js バージョン: ${process.version}`);
    console.log(`  プラットフォーム: ${process.platform}`);
    console.log(`  アーキテクチャ: ${process.arch}`);
    console.log(`  Chromium パス: ${await chromium.executablePath()}`);
    
    // Chromiumパスを取得
    const fs = require('fs');
    const execPath = await chromium.executablePath();
    if (!fs.existsSync(execPath)) {
      console.log(`Chromium実行ファイルが見つかりません: ${execPath}`);
      console.log('システムにインストールされたGoogle Chromeを使用します');
    }
    
    // macOSのChromeパス
    const macOSChromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    const chromePath = fs.existsSync(macOSChromePath) ? macOSChromePath : execPath;
    
    console.log(`使用するブラウザのパス: ${chromePath}`);
    
    // ブラウザ起動オプション - headlessモードを明示的に指定
    browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ],
      defaultViewport: { width: 1280, height: 800 },
      executablePath: chromePath,
      headless: true // 明示的にheadlessモードを指定
    });
    
    console.log('✅ ブラウザ起動成功');
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    
    console.log('\n🌐 AirWorkインタラクションページにアクセス中...');
    await page.goto('https://ats.rct.airwork.net/interaction', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    console.log('✅ インタラクションページにアクセス完了');
    
    // 現在のURLを確認
    console.log(`📍 現在のURL: ${page.url()}`);
    
    console.log('\n🔍 ログインボタンを探しています...');
    
    // ログインボタンをJavaScriptで探してクリック
    const loginButtonClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('a, button'));
      const loginButton = buttons.find(button => 
        button.textContent.includes('ログイン') || 
        button.innerText.includes('ログイン')
      );
      
      if (loginButton) {
        console.log('ログインボタン発見:', loginButton.textContent);
        loginButton.click();
        return true;
      }
      return false;
    });
    
    if (loginButtonClicked) {
      console.log('✅ ログインボタンをクリックしました');
    } else {
      console.log('❌ ログインボタンが見つかりませんでした');
      return;
    }
    
    // ログインページへのリダイレクトを待機
    console.log('\n⏳ ログインページへのリダイレクトを待機中...');
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 });
    console.log(`📍 リダイレクト後のURL: ${page.url()}`);
    
    // ログインフォームの入力
    console.log('\n🔑 ログインフォームにユーザー情報を入力中...');
    
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
    
      // フォーム要素を探して入力
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
        return;
      }
      
      // ログインボタンをクリック
      console.log('\n🖱️ ログインボタンをクリック中...');
      const loginSubmitted = await page.evaluate(() => {
        // 送信ボタンを探す
        let submitButton = null;
        ['input[type="submit"]', 'button[type="submit"]', 'input.login', '.login-button', '.submit-button']
          .forEach(selector => {
            if (!submitButton) {
              submitButton = document.querySelector(selector);
            }
          });
        
        // ボタンが見つからない場合はフォームを直接送信
        if (!submitButton) {
          const form = document.querySelector('form');
          if (form) {
            form.submit();
            return true;
          }
          return false;
        }
        
        submitButton.click();
        return true;
      });
    }
    
    // ログイン処理後のページ遷移を待機
    console.log('\n⏳ ログイン処理後のページ遷移を待機中...');
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 });
    console.log(`📍 ログイン後のURL: ${page.url()}`);
    
    // ログイン後のページのスクリーンショットを保存
    const screenshotPath = path.join(os.tmpdir(), 'airwork-dashboard.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 ログイン後のページのスクリーンショットを保存しました: ${screenshotPath}`);
    
    // ページのHTMLソースを取得してログアウトリンクを探す
    console.log('\n🔍 ページのHTMLを確認してログアウト要素を探します...');
    const pageContent = await page.content();
    const logoutKeywords = ['logout', 'log-out', 'ログアウト', 'サインアウト', 'sign-out', 'signout'];
    
    // キーワードに基づいてHTML内を検索
    const keywordFound = logoutKeywords.some(keyword => pageContent.toLowerCase().includes(keyword.toLowerCase()));
    if (keywordFound) {
      console.log('✅ ページ内にログアウト関連のキーワードが見つかりました');
    } else {
      console.log('❌ ページ内にログアウト関連のキーワードが見つかりませんでした');
    }
    
    // XPathで要素を確認（複数のXPathを試行）
    console.log(`\n🔍 指定されたXPath "${xpath}" を確認中...`);
    let xpathFound = false;
    
    // 試行するXPathのリスト
    const xpathsToTry = [
      xpath,
      "//a[contains(text(), 'ログアウト')]",
      "//button[contains(text(), 'ログアウト')]",
      "//a[contains(@href, 'logout')]",
      "//button[contains(@class, 'logout')]",
      "//div[contains(@class, 'logout')]",
      "//span[contains(text(), 'ログアウト')]"
    ];
    
    for (const xpathToTry of xpathsToTry) {
      try {
        const elements = await page.$x(xpathToTry);
        if (elements.length > 0) {
          console.log(`✅ XPath "${xpathToTry}" で ${elements.length} 個の要素が見つかりました`);
          xpathFound = true;
          break;
        }
      } catch (error) {
        console.log(`❌ XPath "${xpathToTry}" の検索中にエラーが発生しました: ${error.message}`);
      }
    }
    
    if (!xpathFound) {
      console.log('❌ すべてのXPathの試行に失敗しました');
      
      // ページ内の全リンクを取得
      console.log('\n📋 ページ内の全リンク要素:');
      const allLinks = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a')).map(a => {
          return {
            text: a.innerText.trim(),
            href: a.href,
            classes: a.className
          };
        }).filter(a => a.text !== '');
      });
      
      console.log(JSON.stringify(allLinks, null, 2));
    }
    
  } catch (error) {
    console.error('\n❌ テスト実行中にエラーが発生しました:');
    console.error(error);
  } finally {
    // ブラウザを閉じる
    if (browser) {
      await browser.close();
      console.log('\n🏁 ブラウザを閉じました');
    }
  }
}

// テスト実行
runTest().catch(error => {
  console.error('予期せぬエラーが発生しました:', error);
  process.exit(1);
}); 