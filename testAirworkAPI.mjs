import axios from 'axios';
import { createInterface } from 'readline';

// ユーザー入力を取得するための設定
const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Airworkの認証APIに直接リクエストを送信するテスト関数
 */
async function testAirworkAPI(username, password) {
  console.log(`\n🔍 Airwork APIに直接リクエスト送信テスト`);
  console.log(`ユーザー名: ${username}`);
  
  try {
    console.log(`\n1. API直接呼び出しテスト...`);
    const directResponse = await axios.post('https://ats.rct.airwork.net/airplf/api/v1/auth/login', {
      account: username,
      password: password,
      remember: false
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
      },
      timeout: 15000, // 15秒タイムアウト
    });
    
    console.log(`✅ 直接呼び出し成功!`);
    console.log(`ステータスコード: ${directResponse.status}`);
    console.log(`レスポンスデータ:`, JSON.stringify(directResponse.data, null, 2));
    
  } catch (error) {
    console.error(`❌ 直接呼び出しエラー:`);
    
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
  
  try {
    console.log(`\n2. Supabase Edge Functionを通したAPIテスト...`);
    const supabaseResponse = await axios.post('https://skfaxseunjlrjzxmlpqv.supabase.co/functions/v1/check-airwork-auth', {
      username: username,
      password: password
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrZmF4c2V1bmpscmp6eG1scHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwOTU4MzEsImV4cCI6MjA1NjY3MTgzMX0.kEpHYmqxERtaDk3vjurDXjHgSsLbNbJSuiFsVp6FvRg'
      },
      timeout: 20000, // 20秒タイムアウト
    });
    
    console.log(`✅ Supabase経由呼び出し成功!`);
    console.log(`ステータスコード: ${supabaseResponse.status}`);
    console.log(`レスポンスデータ:`, JSON.stringify(supabaseResponse.data, null, 2));
    
  } catch (error) {
    console.error(`❌ Supabase経由呼び出しエラー:`);
    
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

  rl.close();
}

// コマンドライン引数からユーザー名とパスワードを取得
const args = process.argv.slice(2);
if (args.length >= 2) {
  const [username, password] = args;
  testAirworkAPI(username, password);
} else {
  // 対話形式で認証情報を入力
  rl.question('Airworkのユーザー名を入力してください: ', (username) => {
    rl.question('Airworkのパスワードを入力してください: ', (password) => {
      testAirworkAPI(username, password);
    });
  });
} 