// Airwork APIをfetch APIを使ってテストするスクリプト
// このスクリプトはブラウザまたはNode.jsで実行できます

// ローカルテスト用のURLとProductionのURL
const LOCAL_URL = 'http://localhost:54321/functions/v1/check-airwork-auth';
const PRODUCTION_URL = 'https://skfaxseunjlrjzxmlpqv.supabase.co/functions/v1/check-airwork-auth';
const PROXY_URL = 'http://localhost:3000/auth/login';

// テスト用の認証情報
const testCredentials = {
  username: 'kido@tomataku.jp',
  password: 'Tomataku0427#'
};

// Authorizationヘッダー用のトークン
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrZmF4c2V1bmpscmp6eG1scHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwOTU4MzEsImV4cCI6MjA1NjY3MTgzMX0.kEpHYmqxERtaDk3vjurDXjHgSsLbNbJSuiFsVp6FvRg';

/**
 * 指定されたURLに認証リクエストを送信するテスト関数
 */
async function testAuth(url, credentials) {
  console.log(`\n🔍 ${url} への認証テスト`);
  console.log(`ユーザー名: ${credentials.username}`);
  
  try {
    console.log(`リクエスト送信中...`);
    
    const startTime = Date.now();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`
      },
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password
      }),
    });
    
    const responseTime = Date.now() - startTime;
    console.log(`応答時間: ${responseTime}ms`);
    
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ リクエスト成功 (${response.status})`);
      console.log(`応答データ:`, data);
    } else {
      console.error(`❌ リクエストエラー (${response.status})`);
      console.error(`エラーデータ:`, data);
    }
    
    return { success: response.ok, status: response.status, data, responseTime };
  } catch (error) {
    console.error(`❌ 実行エラー:`, error.message);
    return { 
      success: false, 
      error: error.message, 
      errorType: error.name,
      errorDetails: String(error)
    };
  }
}

/**
 * プロキシサーバー経由での認証テスト
 */
async function testProxy(credentials) {
  return testAuth(PROXY_URL, credentials);
}

/**
 * ローカルSupabase Edge Functionでの認証テスト
 */
async function testLocal(credentials) {
  return testAuth(LOCAL_URL, credentials);
}

/**
 * 本番環境のSupabase Edge Functionでの認証テスト
 */
async function testProduction(credentials) {
  return testAuth(PRODUCTION_URL, credentials);
}

// メイン実行関数
async function runTests() {
  console.log(`=== Airwork認証テスト (fetch API使用) ===`);
  
  // 各環境でテストを実行
  console.log(`\n[1] プロキシサーバー経由テスト`);
  const proxyResult = await testProxy(testCredentials);
  
  console.log(`\n[2] ローカルSupabase Edge Functionテスト`);
  const localResult = await testLocal(testCredentials);
  
  console.log(`\n[3] 本番Supabase Edge Functionテスト`);
  const productionResult = await testProduction(testCredentials);
  
  // 結果のサマリー
  console.log(`\n=== テスト結果サマリー ===`);
  console.log(`プロキシサーバー経由: ${proxyResult.success ? '✅ 成功' : '❌ 失敗'}`);
  console.log(`ローカルEdge Function: ${localResult.success ? '✅ 成功' : '❌ 失敗'}`);
  console.log(`本番Edge Function: ${productionResult.success ? '✅ 成功' : '❌ 失敗'}`);
}

// テスト実行
runTests().catch(console.error); 