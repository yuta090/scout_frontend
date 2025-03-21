#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

// macOSのbrewでChromeをインストール
async function setUpChrome() {
  console.log('シンプルなChromiumテスト');
  console.log('=====================');
  
  console.log('環境情報:');
  console.log(`Node.js: ${process.version}`);
  console.log(`OS: ${os.type()} ${os.release()}`);
  console.log(`アーキテクチャ: ${process.arch}`);
  
  try {
    // macOSの場合はChromeがインストールされているか確認
    if (process.platform === 'darwin') {
      console.log('\nmacOS用のChromeパスを確認中...');
      
      const possiblePaths = [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
        '/Applications/Chromium.app/Contents/MacOS/Chromium'
      ];
      
      let chromePath = null;
      for (const path of possiblePaths) {
        if (fs.existsSync(path)) {
          chromePath = path;
          break;
        }
      }
      
      if (chromePath) {
        console.log(`✅ Chromeが見つかりました: ${chromePath}`);
        
        // バージョン情報を取得
        try {
          const version = execSync(`"${chromePath}" --version`).toString().trim();
          console.log(`Chromeバージョン: ${version}`);
        } catch (e) {
          console.log('バージョン取得エラー:', e.message);
        }
        
        return chromePath;
      } else {
        console.log('❌ システム上にChromeが見つかりません');
        
        // Homebrewでインストールを試みる
        try {
          console.log('\nHomebrewを使用してChromiumをインストールします...');
          execSync('brew install --cask chromium', { stdio: 'inherit' });
          
          if (fs.existsSync('/Applications/Chromium.app/Contents/MacOS/Chromium')) {
            console.log('✅ Chromiumのインストールに成功しました');
            return '/Applications/Chromium.app/Contents/MacOS/Chromium';
          }
        } catch (e) {
          console.log('Chromiumインストールエラー:', e.message);
        }
      }
    }
    
    // システムのChromeが見つからない場合は、puppeteer-coreとchromiumを使用
    console.log('\nシステムChromeが見つからないため、puppeteer-core用のChromiumをセットアップします...');
    
    // 一時ディレクトリにChromiumをダウンロード
    const tmpDir = os.tmpdir();
    const chromiumDir = path.join(tmpDir, 'chromium-for-puppeteer');
    
    if (!fs.existsSync(chromiumDir)) {
      fs.mkdirSync(chromiumDir, { recursive: true });
    }
    
    console.log(`一時ディレクトリを作成しました: ${chromiumDir}`);
    
    return null;
  } catch (error) {
    console.error('セットアップエラー:', error);
    return null;
  }
}

// PuppeteerによるWebページスクリーンショットのテスト
async function testPuppeteer(chromePath) {
  console.log('\nPuppeteerのテストを実行します...');
  
  try {
    // Puppeteerをインストール
    console.log('puppeteer-coreをインストールしています...');
    execSync('npm install puppeteer-core@19.7.5', { stdio: 'inherit' });
    
    const puppeteer = require('puppeteer-core');
    
    console.log('ブラウザを起動しています...');
    const browser = await puppeteer.launch({
      executablePath: chromePath || '/Applications/Chromium.app/Contents/MacOS/Chromium',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    console.log('新しいページを開いています...');
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    console.log('Googleにアクセスしています...');
    await page.goto('https://www.google.com', { 
      waitUntil: 'networkidle0', 
      timeout: 30000 
    });
    
    console.log('スクリーンショットを取得しています...');
    await page.screenshot({ path: path.join(os.tmpdir(), 'test-screenshot.png') });
    
    console.log('ブラウザを閉じています...');
    await browser.close();
    
    console.log(`✅ テスト成功! スクリーンショットを保存しました: ${path.join(os.tmpdir(), 'test-screenshot.png')}`);
    return true;
  } catch (error) {
    console.error('Puppeteerテストエラー:', error);
    return false;
  }
}

// メイン関数
async function main() {
  try {
    const chromePath = await setUpChrome();
    const testResult = await testPuppeteer(chromePath);
    
    if (testResult) {
      console.log('\n🎉 全てのテストが成功しました!');
      process.exit(0);
    } else {
      console.error('\n❌ テストに失敗しました');
      process.exit(1);
    }
  } catch (error) {
    console.error('予期せぬエラー:', error);
    process.exit(1);
  }
}

// スクリプトを実行
main(); 