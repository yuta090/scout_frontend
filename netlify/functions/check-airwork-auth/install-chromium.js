#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
  
  // パッケージの削除
  console.log('\n既存のChromiumパッケージを削除します...');
  execSync('npm uninstall @sparticuz/chromium', { stdio: 'inherit' });
  
  // パッケージの再インストール
  console.log('\nChromiumパッケージを再インストールします (バージョン 113.0.1)...');
  execSync('npm install @sparticuz/chromium@113.0.1 --no-save', { stdio: 'inherit' });

  // Puppeteerの依存関係を確認
  console.log('\nPuppeteer-coreの依存関係を確認します...');
  execSync('npm install puppeteer-core@19.7.5 --no-save', { stdio: 'inherit' });
  
  // Chromiumのパスを取得して確認
  const chromium = require('@sparticuz/chromium');
  const execPath = chromium.executablePath();
  console.log(`\nChromiumのパス: ${execPath}`);
  
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
  }
  
  console.log('\n=============================================');
  console.log('Chromiumインストール処理が完了しました');
  console.log('=============================================');
} catch (error) {
  console.error('❌ Chromiumのインストール中にエラーが発生しました:');
  console.error(error);
  process.exit(1);
} 