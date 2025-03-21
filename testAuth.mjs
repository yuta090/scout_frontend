import axios from 'axios';
import { createInterface } from 'readline';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

// ES Moduleでの__dirnameの代替
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ユーザー入力を取得するための設定
const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

// 認証レスポンスの詳細表示用関数
function displayAuthResponse(response) {
  console.log('\n===== 認証レスポンス =====');
  console.log(`状態: ${response.success ? '成功 ✅' : '失敗 ❌'}`);
  console.log(`メッセージ: ${response.message}`);
  
  console.log('\n----- 詳細情報 -----');
  console.log(`ステータス: ${response.details.status}`);
  console.log(`コード: ${response.details.code}`);
  console.log(`タイムスタンプ: ${response.details.timestamp}`);
  
  // 追加の詳細情報がある場合に表示
  if (response.details.attempts) {
    console.log(`試行回数: ${response.details.attempts}`);
  }
  if (response.details.nextAttemptAt) {
    console.log(`次回試行可能時間: ${response.details.nextAttemptAt}`);
  }
  if (response.details.maintenanceEndAt) {
    console.log(`メンテナンス終了予定時間: ${response.details.maintenanceEndAt}`);
  }
  console.log('========================\n');
}

// Airwork認証チェック関数
async function testCheckAirworkAuth(username, password) {
  const url = 'https://skfaxseunjlrjzxmlpqv.supabase.co/functions/v1/check-airwork-auth';
  const data = { username, password };
  
  console.log(`\n🔒 ${username} の認証をチェック中...`);

  try {
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        // Supabaseの関数を呼び出すにはanonキーが必要
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrZmF4c2V1bmpscmp6eG1scHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwOTU4MzEsImV4cCI6MjA1NjY3MTgzMX0.kEpHYmqxERtaDk3vjurDXjHgSsLbNbJSuiFsVp6FvRg'
      }
    });
    
    // レスポンスの詳細を表示
    displayAuthResponse(response.data);
    
  } catch (error) {
    console.error('❌ エラーが発生しました:');
    
    if (error.response) {
      // サーバーからのレスポンスがある場合
      console.log(`ステータスコード: ${error.response.status}`);
      
      if (error.response.data) {
        // レスポンスの詳細を表示
        displayAuthResponse(error.response.data);
      } else {
        console.error('レスポンスデータがありません');
      }
    } else if (error.request) {
      // リクエストは成功したがレスポンスがない場合
      console.error('サーバーからの応答がありません');
    } else {
      // リクエスト設定時のエラー
      console.error(`リクエストエラー: ${error.message}`);
    }
  } finally {
    rl.close();
  }
}

// インタラクティブにユーザー名とパスワードを入力
function promptCredentials() {
  rl.question('Airworkのユーザー名を入力してください: ', (username) => {
    // パスワード入力時に表示しない設定がない場合の注意
    rl.question('Airworkのパスワードを入力してください: ', async (password) => {
      await testCheckAirworkAuth(username, password);
    });
  });
}

// ヘルプ表示
function showHelp() {
  console.log(`
使用方法:
  node testAuth.mjs [ユーザー名] [パスワード]

引数:
  ユーザー名     Airworkのログインユーザー名
  パスワード     Airworkのログインパスワード

引数を省略した場合は、対話形式で入力を求めます。
  `);
  process.exit(0);
}

// メイン処理
const args = process.argv.slice(2);

// ヘルプ表示
if (args.includes('--help') || args.includes('-h')) {
  showHelp();
}

// 引数からユーザー名とパスワードを取得
if (args.length >= 2) {
  const [username, password] = args;
  testCheckAirworkAuth(username, password);
} else {
  console.log('引数が不足しています。インタラクティブモードで実行します。');
  promptCredentials();
} 