#!/usr/bin/env node
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// テスト用の認証情報
const DEFAULT_USERNAME = 'test@example.com';
const DEFAULT_PASSWORD = 'password123';

// 環境変数ファイルから値を読み込む
function loadEnvVars() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    const envVars = {};
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const [, key, value] = match;
        envVars[key] = value;
      }
    });
    
    return envVars;
  } catch (err) {
    console.warn('⚠️ .env ファイルの読み込みに失敗しました:', err.message);
    return {};
  }
}

// 環境変数を読み込む
const envVars = loadEnvVars();

// 引数からユーザー名とパスワードを取得
const username = process.argv[2] || DEFAULT_USERNAME;
const password = process.argv[3] || DEFAULT_PASSWORD;

// Supabase Edge Functions URL
const SUPABASE_URL = envVars.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://skfaxseunjlrjzxmlpqv.supabase.co';
const SUPABASE_ANON_KEY = envVars.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrZmF4c2V1bmpscmp6eG1scHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwOTU4MzEsImV4cCI6MjA1NjY3MTgzMX0.kEpHYmqxERtaDk3vjurDXjHgSsLbNbJSuiFsVp6FvRg';
const FUNCTION_NAME = 'check-airwork-auth';

console.log(`🔑 Airwork認証をテストします (${username})`);

// Supabase Edge Functionのテスト
async function testSupabaseFunction() {
  try {
    const url = `${SUPABASE_URL}/functions/v1/${FUNCTION_NAME}`;
    console.log(`\n📡 Supabase Edge Function (${url}) をテストします...`);
    
    const response = await axios.post(url, {
      username,
      password
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      timeout: 120000 // 2分のタイムアウト
    });
    
    console.log(`🔵 ステータスコード: ${response.status}`);
    console.log('🔵 レスポンス:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ Supabase Function テストエラー:');
    if (error.response) {
      // サーバーからのレスポンスがある場合
      console.error(`   ステータスコード: ${error.response.status}`);
      if (error.response.data) {
        const dataStr = typeof error.response.data === 'object' 
          ? JSON.stringify(error.response.data, null, 2)
          : error.response.data.toString().substring(0, 1000) + '...';
        console.error('   レスポンスデータ:', dataStr);
      }
    } else if (error.request) {
      // リクエストは送信されたがレスポンスがない場合
      console.error('   レスポンスなし (タイムアウトまたは接続エラー)');
      console.error(`   ${error.message}`);
    } else {
      // リクエスト設定中にエラーが発生した場合
      console.error(`   エラー: ${error.message}`);
    }
  }
}

// インタラクションページのログインリンクをチェック
async function testAirworkSite() {
  try {
    console.log('\n📡 Airworkインタラクションページをテストします...');
    const response = await axios.get('https://ats.rct.airwork.net/interaction', {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
      }
    });
    
    console.log(`🔵 ステータスコード: ${response.status}`);
    
    // HTMLからログインリンクを探す
    const html = response.data;
    const loginLinkPattern = /<a[^>]*>(ログイン)<\/a>/i;
    const loginLinkMatch = html.match(loginLinkPattern);
    
    if (loginLinkMatch) {
      console.log('✅ ログインリンクが見つかりました');
      
      // ログインリンクの前後の内容を表示
      const matchIndex = html.indexOf(loginLinkMatch[0]);
      const preContext = html.substring(Math.max(0, matchIndex - 100), matchIndex);
      const postContext = html.substring(matchIndex + loginLinkMatch[0].length, Math.min(html.length, matchIndex + loginLinkMatch[0].length + 100));
      
      console.log('前後のコンテキスト:');
      console.log(`... ${preContext} [${loginLinkMatch[0]}] ${postContext} ...`);
    } else {
      console.log('⚠️ ログインリンクが見つかりませんでした');
    }
    
    return html;
  } catch (error) {
    console.error('❌ Airworkサイトアクセスエラー:');
    if (error.response) {
      console.error(`   ステータスコード: ${error.response.status}`);
    } else if (error.request) {
      console.error('   レスポンスなし (タイムアウトまたは接続エラー)');
      console.error(`   ${error.message}`);
    } else {
      console.error(`   エラー: ${error.message}`);
    }
  }
}

// スクリプト実行
async function runTests() {
  console.log('🧪 Airwork認証テストを開始します...');
  
  // ヘッダー出力
  console.log('\n============================================');
  console.log(`📋 テスト情報:`);
  console.log(`   ユーザー名: ${username}`);
  console.log(`   パスワード: ${'*'.repeat(password.length)}`);
  console.log(`   Supabase URL: ${SUPABASE_URL}`);
  console.log(`   Function名: ${FUNCTION_NAME}`);
  console.log(`   タイムスタンプ: ${new Date().toISOString()}`);
  console.log('============================================\n');
  
  // テスト実行
  await testAirworkSite();
  await testSupabaseFunction();
  
  console.log('\n✅ テスト完了');
}

// スクリプト実行
runTests().catch(error => {
  console.error('😱 予期せぬエラーが発生しました:', error);
  process.exit(1);
}); 