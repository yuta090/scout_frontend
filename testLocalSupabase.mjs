import axios from 'axios';

/**
 * ローカルで実行中のSupabase Edge Function経由でAirwork認証をテストする関数
 */
async function testLocalSupabaseFunction(username, password) {
  console.log(`\n🔍 ローカルSupabase Edge Functionテスト`);
  console.log(`ユーザー名: ${username}`);
  
  try {
    console.log(`\nローカルで実行中のEdge Function呼び出しテスト...`);
    const response = await axios.post('http://localhost:54321/functions/v1/check-airwork-auth', {
      username: username,
      password: password
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrZmF4c2V1bmpscmp6eG1scHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwOTU4MzEsImV4cCI6MjA1NjY3MTgzMX0.kEpHYmqxERtaDk3vjurDXjHgSsLbNbJSuiFsVp6FvRg'
      },
      timeout: 20000, // 20秒タイムアウト
    });
    
    console.log(`✅ ローカルEdge Function呼び出し成功!`);
    console.log(`ステータスコード: ${response.status}`);
    console.log(`レスポンスデータ:`, JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error(`❌ ローカルEdge Function呼び出しエラー:`);
    
    if (error.response) {
      // サーバーからのレスポンスがある場合
      console.log(`ステータスコード: ${error.response.status}`);
      console.log(`エラーデータ:`, JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      // リクエストは成功したがレスポンスがない場合
      console.error(`サーバーから応答がありませんでした`);
      console.error(`エラータイプ: ${error.code || 'unknown'}`);
      console.error(`エラーメッセージ: ${error.message || 'No error message'}`);
    } else {
      // リクエスト設定時のエラー
      console.error(`リクエスト設定エラー: ${error.message}`);
    }
  }
}

// コマンドライン引数からユーザー名とパスワードを取得
const args = process.argv.slice(2);
if (args.length >= 2) {
  const [username, password] = args;
  testLocalSupabaseFunction(username, password);
} else {
  console.log('使用方法: node testLocalSupabase.mjs <ユーザー名> <パスワード>');
  process.exit(1);
} 