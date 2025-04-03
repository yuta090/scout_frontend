#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Promise対応の関数として再実装
async function main() {
  try {
    console.log('=============================================');
    console.log('Chromiumのインストール処理を開始します');
    console.log('=============================================');

    console.log('\n環境情報:');
    console.log(`Node.js バージョン: ${process.version}`);
    console.log(`プラットフォーム: ${process.platform}`);
    console.log(`アーキテクチャ: ${process.arch}`);

    // 現在のディレクトリを表示
    console.log(`\n現在のディレクトリ: ${process.cwd()}`);
    
    // パッケージの削除と再インストール
    console.log('\n既存のChromiumパッケージを削除します...');
    execSync('npm uninstall @sparticuz/chromium', { stdio: 'inherit' });
    
    console.log('\nChromiumパッケージを再インストールします (バージョン 113.0.1)...');
    execSync('npm install @sparticuz/chromium@113.0.1', { stdio: 'inherit' });

    console.log('\nPuppeteer-coreの依存関係を確認します...');
    execSync('npm install puppeteer-core@19.7.5', { stdio: 'inherit' });
    
    // Chromiumのモジュールを再ロード
    delete require.cache[require.resolve('@sparticuz/chromium')];
    const chromium = require('@sparticuz/chromium');
    
    // Chromiumのバージョン情報を表示
    console.log('\nChromiumモジュール情報:');
    console.log('ロードされたパス:', require.resolve('@sparticuz/chromium'));
    console.log('chromiumプロパティ:', Object.keys(chromium));
    console.log('executablePathの型:', typeof chromium.executablePath);
    
    // executablePathがPromiseかどうかを確認
    let execPath;
    try {
      if (typeof chromium.executablePath === 'function') {
        console.log('executablePathは関数です。実行します...');
        const result = chromium.executablePath();
        
        if (result instanceof Promise) {
          console.log('executablePathはPromiseを返します。awaiting...');
          execPath = await result;
        } else {
          execPath = result;
        }
      } else {
        execPath = chromium.executablePath;
      }
      
      console.log(`\nChromiumのパス: ${execPath}`);
    } catch (e) {
      console.error('executablePathの呼び出しに失敗:', e);
      
      // フォールバック: 直接Chromiumパスを構築
      const tmpDir = process.env.TMPDIR || '/tmp';
      execPath = path.join(tmpDir, 'chromium');
      console.log(`フォールバックパス: ${execPath}`);
    }
    
    // Chromiumが存在するか確認
    if (fs.existsSync(execPath)) {
      console.log('✅ Chromiumが存在します');
      
      // ファイルの権限を確認
      const stats = fs.statSync(execPath);
      console.log(`現在のファイル権限: ${stats.mode.toString(8)}`);
      
      // 実行権限を付与
      console.log('実行権限を付与します...');
      fs.chmodSync(execPath, 0o755);
      console.log(`新しいファイル権限: ${fs.statSync(execPath).mode.toString(8)}`);
      
      // ファイル情報を表示
      if (process.platform !== 'win32') {
        try {
          console.log('\nファイル情報:');
          const fileInfo = execSync(`file "${execPath}"`).toString();
          console.log(fileInfo);
        } catch (e) {
          console.log('ファイル情報の取得に失敗しました:', e.message);
        }
      }
    } else {
      console.error('❌ Chromiumが見つかりません');
      console.error(`パス ${execPath} が存在しません`);
      
      // Chromiumディレクトリの内容を表示
      try {
        const chromiumDir = path.dirname(execPath);
        console.log(`\nChromiumディレクトリの内容:`);
        if (fs.existsSync(chromiumDir)) {
          const files = fs.readdirSync(chromiumDir);
          console.log(files);
        } else {
          console.log(`ディレクトリ ${chromiumDir} が存在しません`);
        }
      } catch (e) {
        console.error('ディレクトリ内容の取得に失敗:', e);
      }
      
      // 手動でChromiumをダウンロード
      console.log('\n手動でChromiumをダウンロードします...');
      const platform = process.platform === 'darwin' ? 'mac' : 
                       process.platform === 'win32' ? 'win64' : 'linux';
      const arch = process.arch === 'arm64' ? 'arm64' : 'x64';
      const downloadDir = tmpDir;
      
      try {
        execSync(`mkdir -p ${downloadDir}`, { stdio: 'inherit' });
        execSync(`curl -L -o ${execPath} https://github.com/Sparticuz/chromium/releases/download/v113.0.1/chromium-v113.0.1-${platform}-${arch}.zip`, 
          { stdio: 'inherit' });
        execSync(`chmod +x ${execPath}`, { stdio: 'inherit' });
        console.log('✅ Chromiumを手動でダウンロードしました');
      } catch (e) {
        console.error('手動ダウンロードに失敗:', e);
      }
    }
    
    console.log('\n=============================================');
    console.log('Chromiumインストール処理が完了しました');
    console.log('=============================================');
  } catch (error) {
    console.error('❌ Chromiumのインストール中にエラーが発生しました:');
    console.error(error);
    process.exit(1);
  }
}

// 実行
main().catch(error => {
  console.error('予期せぬエラーが発生しました:', error);
  process.exit(1); 