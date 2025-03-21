const fetch = require('node-fetch');
const readline = require('readline');

// ユーザー入力を取得するための設定
const rl = readline.createInterface({
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
  
  if (response.details.url) {
    console.log(`URL: ${response.details.url}`);
  }
  
  // 追加の詳細情報がある場合に表示
  if (response.details.error) {
    console.log(`エラー: ${response.details.error}`);
  }
  console.log('========================\n');
}

// 認証チェック関数
async function testCheckAirworkAuth(username, password) {
  // ローカルNetlify Functions開発サーバーのURL
  // Netlify CLIでローカル開発時は通常このポートで動作
  const url = 'http://localhost:8888/.netlify/functions/check-airwork-auth';
  const data = { username, password };
  
  console.log(`\n🔒 ${username} の認証をチェック中...`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    const responseData = await response.json();
    
    // レスポンスの詳細を表示
    displayAuthResponse(responseData);
    
  } catch (error) {
    console.error('❌ エラーが発生しました:');
    console.error(`エラーメッセージ: ${error.message}`);
    
    if (error.response) {
      try {
        const errorData = await error.response.json();
        displayAuthResponse(errorData);
      } catch (e) {
        console.error('レスポンスのパースに失敗しました');
      }
    }
  }
}

// インタラクティブにユーザー名とパスワードを入力
function promptCredentials() {
  rl.question('Airworkのユーザー名を入力してください: ', (username) => {
    // パスワード入力時に表示しない設定がない場合の注意
    rl.question('Airworkのパスワードを入力してください: ', async (password) => {
      await testCheckAirworkAuth(username, password);
      rl.close();
    });
  });
}

// 引数からユーザー名とパスワードを取得
const args = process.argv.slice(2);
if (args.length >= 2) {
  const [username, password] = args;
  testCheckAirworkAuth(username, password)
    .finally(() => process.exit(0));
} else {
  console.log('引数が不足しています。インタラクティブモードで実行します。');
  promptCredentials();
} 