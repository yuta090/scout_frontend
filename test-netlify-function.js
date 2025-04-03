const axios = require('axios');

async function testNetlifyFunction() {
  const username = process.argv[2];
  const password = process.argv[3];
  
  if (!username || !password) {
    console.error('使い方: node test-netlify-function.js <ユーザー名> <パスワード>');
    process.exit(1);
  }

  console.log(`🧪 Netlify Function のテストを開始します...`);
  console.log(`📝 ユーザー名: ${username}`);
  console.log(`🔑 パスワード: ${'*'.repeat(password.length)}`);

  try {
    const response = await axios.post(
      'https://hraim.com/.netlify/functions/check-airwork-auth',
      { username, password },
      { 
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000 // 長めのタイムアウト（60秒）
      }
    );

    console.log('\n===== レスポンス =====');
    console.log(`ステータスコード: ${response.status}`);
    console.log(`状態: ${response.data.success ? '成功 ✅' : '失敗 ❌'}`);
    console.log(`メッセージ: ${response.data.message}`);
    
    if (response.data.details) {
      console.log('\n----- 詳細情報 -----');
      console.log(`ステータス: ${response.data.details.status}`);
      console.log(`コード: ${response.data.details.code}`);
      console.log(`タイムスタンプ: ${response.data.details.timestamp}`);
      
      if (response.data.details.errorDetails) {
        console.log(`エラー詳細: ${response.data.details.errorDetails}`);
      }
      if (response.data.details.errorMessage) {
        console.log(`エラーメッセージ: ${response.data.details.errorMessage}`);
      }
    }
    
    console.log('======================\n');
  } catch (error) {
    console.error('❌ エラーが発生しました:');
    
    if (error.response) {
      // サーバーからのレスポンスがある場合
      console.log(`ステータスコード: ${error.response.status}`);
      console.log('レスポンスデータ:', error.response.data);
    } else if (error.request) {
      // リクエストは成功したがレスポンスがない場合
      console.error('サーバーからの応答がありません (タイムアウトの可能性)');
    } else {
      // リクエスト設定時のエラー
      console.error(`リクエストエラー: ${error.message}`);
    }
  }
}

testNetlifyFunction(); 