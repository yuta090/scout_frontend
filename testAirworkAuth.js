#!/usr/bin/env node
const axios = require('axios');

// テスト用の認証情報
const DEFAULT_USERNAME = 'test@example.com';
const DEFAULT_PASSWORD = 'password123';

// 引数からユーザー名とパスワードを取得
const username = process.argv[2] || DEFAULT_USERNAME;
const password = process.argv[3] || DEFAULT_PASSWORD;

console.log(`🔑 Airwork認証をテストします (${username})`);

// HTMLから特定の部分を抽出するヘルパー関数
function extractFromHTML(html, pattern) {
  const matches = html.match(pattern) || [];
  return [...new Set(matches)]; // 重複を削除
}

// Netlify Functions のローカルテスト
async function testLocalNetlifyFunction() {
  try {
    console.log('\n📡 ローカルNetlify Function (http://localhost:8888) をテストします...');
    const response = await axios.post('http://localhost:8888/.netlify/functions/check-airwork-auth', {
      username,
      password
    }, {
      timeout: 120000 // 2分のタイムアウト
    });
    
    console.log(`🔵 ステータスコード: ${response.status}`);
    console.log('🔵 レスポンス:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ ローカルNetlify Functionテストエラー:');
    if (error.response) {
      // サーバーからのレスポンスがある場合
      console.error(`   ステータスコード: ${error.response.status}`);
      console.error('   レスポンスデータ:', error.response.data);
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

// サインインページへのアクセスとフォーム解析
async function testSignInPage() {
  try {
    console.log('\n📡 Airworkサインインページへアクセスします...');
    // 直接サインインページにアクセス
    const response = await axios.get('https://ats.rct.airwork.net/auth/sign-in', {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
      }
    });
    
    console.log(`🔵 ステータスコード: ${response.status}`);
    
    const html = response.data;
    
    // APIエンドポイントを抽出
    const apiEndpoints = extractFromHTML(html, /["']\/api\/[^"']+["']/gi)
      .map(endpoint => endpoint.replace(/["']/g, ''));
    
    if (apiEndpoints.length > 0) {
      console.log('🔍 発見されたAPIエンドポイント:');
      apiEndpoints.forEach((endpoint, index) => {
        console.log(`   ${index + 1}. ${endpoint}`);
      });
    } else {
      console.log('⚠️ APIエンドポイントが見つかりませんでした');
    }
    
    // フォーム要素を解析
    const formAction = extractFromHTML(html, /form[^>]+action=["']([^"']+)["']/i);
    const formMethod = extractFromHTML(html, /form[^>]+method=["']([^"']+)["']/i);
    const csrfToken = extractFromHTML(html, /name=["']csrfToken["'][^>]+value=["']([^"']+)["']/i);
    
    console.log('\n🔍 フォーム情報:');
    console.log(`   アクション: ${formAction.length ? formAction[0] : 'なし'}`);
    console.log(`   メソッド: ${formMethod.length ? formMethod[0] : 'なし'}`);
    console.log(`   CSRFトークン: ${csrfToken.length ? csrfToken[0] : 'なし'}`);
    
    // 入力フィールドを解析
    const inputFields = html.match(/<input[^>]+>/gi) || [];
    
    if (inputFields.length > 0) {
      console.log('\n🔍 発見された入力フィールド:');
      inputFields.forEach((field, index) => {
        const name = field.match(/name=["']([^"']+)["']/i);
        const type = field.match(/type=["']([^"']+)["']/i);
        const id = field.match(/id=["']([^"']+)["']/i);
        
        console.log(`   ${index + 1}. ${name ? `名前="${name[1]}" ` : ''}${type ? `タイプ="${type[1]}" ` : ''}${id ? `ID="${id[1]}"` : ''}`);
      });
    }
    
    // JavaScriptコードを解析
    const jsSnippets = extractFromHTML(html, /fetch\(['"]([^'"]+)['"]/gi);
    if (jsSnippets.length > 0) {
      console.log('\n🔍 フェッチAPIの使用:');
      jsSnippets.forEach((snippet, index) => {
        console.log(`   ${index + 1}. ${snippet}`);
      });
    }
    
    // 認証関連の文言を抽出
    const authTerms = extractFromHTML(html, /auth|login|sign[\s\-]in|credential/gi);
    if (authTerms.length > 0) {
      console.log('\n🔍 認証関連のキーワード:');
      console.log(`   ${authTerms.join(', ')}`);
    }
    
    // Next.jsのデータを抽出
    const nextData = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
    if (nextData && nextData[1]) {
      try {
        console.log('\n🔍 Next.jsデータの分析:');
        const data = JSON.parse(nextData[1]);
        if (data.runtimeConfig) {
          console.log('   ランタイム設定:', data.runtimeConfig);
          
          // API関連の設定を確認
          const apiRelated = Object.entries(data.runtimeConfig)
            .filter(([key]) => key.toLowerCase().includes('api'));
          
          if (apiRelated.length > 0) {
            console.log('\n🔍 API関連の設定:');
            apiRelated.forEach(([key, value]) => {
              console.log(`   ${key}: ${value}`);
            });
          }
        }
      } catch (e) {
        console.log('   Next.jsデータの解析に失敗:', e.message);
      }
    }
    
    return {
      apiEndpoints,
      csrfToken: csrfToken.length ? csrfToken[0] : null,
      formAction: formAction.length ? formAction[0] : null,
      html: html
    };
  } catch (error) {
    console.error('❌ サインインページアクセスエラー:');
    if (error.response) {
      console.error(`   ステータスコード: ${error.response.status}`);
      if (error.response.data) {
        const dataPreview = typeof error.response.data === 'string' 
          ? error.response.data.substring(0, 500) + '...' 
          : JSON.stringify(error.response.data);
        console.error(`   レスポンスデータプレビュー: ${dataPreview}`);
      }
    } else if (error.request) {
      console.error('   レスポンスなし (タイムアウトまたは接続エラー)');
      console.error(`   ${error.message}`);
    } else {
      console.error(`   エラー: ${error.message}`);
    }
    return null;
  }
}

// インタラクションページのログインリンクをチェック
async function testInteractionPage() {
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
    const loginLinkMatches = extractFromHTML(html, /href=["']([^"']*(?:login|sign-in)[^"']*)["']/gi);
    
    if (loginLinkMatches.length > 0) {
      console.log('🔍 発見されたログインリンク:');
      loginLinkMatches.forEach((match, index) => {
        console.log(`   ${index + 1}. ${match}`);
      });
    } else {
      console.log('⚠️ ログインリンクが見つかりませんでした');
      
      // ページのすべてのリンクを調査
      const allLinks = extractFromHTML(html, /href=["']([^"']*)["']/gi);
      console.log('🔍 見つかったすべてのリンク (最大10件):');
      allLinks.slice(0, 10).forEach((link, index) => {
        console.log(`   ${index + 1}. ${link}`);
      });
    }
    
    // 可能なAPIエンドポイントを探す
    const apiMatches = extractFromHTML(html, /["']\/api\/[^"']+["']/gi);
    if (apiMatches.length > 0) {
      console.log('🔍 発見されたAPIエンドポイント:');
      apiMatches.forEach((match, index) => {
        console.log(`   ${index + 1}. ${match}`);
      });
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ インタラクションページアクセスエラー:');
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
  console.log(`   タイムスタンプ: ${new Date().toISOString()}`);
  console.log('============================================\n');
  
  // テスト実行
  await testInteractionPage();
  await testSignInPage();
  await testLocalNetlifyFunction();
  
  console.log('\n✅ テスト完了');
}

// スクリプト実行
runTests().catch(error => {
  console.error('😱 予期せぬエラーが発生しました:', error);
  process.exit(1);
}); 