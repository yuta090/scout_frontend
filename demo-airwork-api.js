#!/usr/bin/env node
const axios = require('axios');

// コマンドライン引数からユーザー名とパスワードを取得
const username = process.argv[2];
const password = process.argv[3];

if (!username || !password) {
  console.error('使用方法: node demo-airwork-api.js <ユーザー名> <パスワード>');
  process.exit(1);
}

// ヘッダーセクションを表示
console.log('='.repeat(70));
console.log(`🧪 Airwork認証APIテスト`);
console.log(`📝 ユーザー: ${username}`);
console.log(`📅 日時: ${new Date().toISOString()}`);
console.log('='.repeat(70));

// 直接APIエンドポイントにアクセス
async function testDirectAPI() {
  console.log('\n🔍 直接APIテスト: https://ats.rct.airwork.net/airplf/api/v1/auth/login');
  
  try {
    const response = await axios.post(
      'https://ats.rct.airwork.net/airplf/api/v1/auth/login',
      {
        userId: username,
        password: password
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
        },
        timeout: 30000
      }
    );
    
    console.log(`✅ ステータスコード: ${response.status}`);
    console.log(`📄 レスポンス:`, JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.log(`❌ APIエラー: ${error.message}`);
    
    if (error.response) {
      console.log(`🔴 ステータスコード: ${error.response.status}`);
      console.log(`🔴 レスポンスデータ:`, JSON.stringify(error.response.data, null, 2));
    }
    
    return false;
  }
}

// AIRPLF_CLIENT_IDを使用したテスト
async function testAirplfAPI() {
  console.log('\n🔍 AIRPLF_API_DOMAINテスト: https://connect.airregi.jp');
  
  try {
    const response = await axios.post(
      'https://connect.airregi.jp/auth/login',
      {
        userId: username,
        password: password,
        clientId: 'AWR'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
        },
        timeout: 30000
      }
    );
    
    console.log(`✅ ステータスコード: ${response.status}`);
    console.log(`📄 レスポンス:`, JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.log(`❌ APIエラー: ${error.message}`);
    
    if (error.response) {
      console.log(`🔴 ステータスコード: ${error.response.status}`);
      console.log(`🔴 レスポンスデータ:`, JSON.stringify(error.response.data, null, 2));
    }
    
    return false;
  }
}

// インタラクションページのテスト
async function testInteractionPage() {
  console.log('\n🔍 インタラクションページテスト: https://ats.rct.airwork.net/interaction');
  
  try {
    const response = await axios.get(
      'https://ats.rct.airwork.net/interaction',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
        },
        timeout: 30000
      }
    );
    
    console.log(`✅ ステータスコード: ${response.status}`);
    
    // Next.jsランタイム設定を探す
    const runtimeConfigMatch = response.data.match(/"runtimeConfig":\s*({[^}]+})/);
    if (runtimeConfigMatch) {
      try {
        // 文字列をJSONとして解析
        const configStr = runtimeConfigMatch[1].replace(/([a-zA-Z0-9_]+):/g, '"$1":')
          .replace(/'/g, '"')
          .replace(/,\s*}/g, '}');
        const runtimeConfig = JSON.parse(configStr);
        console.log(`🔍 Next.jsランタイム設定:`, JSON.stringify(runtimeConfig, null, 2));
      } catch (e) {
        console.log(`🔍 Next.jsランタイム設定(生データ):`, runtimeConfigMatch[1]);
      }
    }
    
    // ログインリンクを探す
    const loginLinkMatch = response.data.match(/<a[^>]*>(ログイン)<\/a>/i);
    if (loginLinkMatch) {
      console.log(`✅ ログインリンクが見つかりました:`, loginLinkMatch[0]);
    } else {
      console.log(`❌ ログインリンクが見つかりませんでした`);
    }
    
    return true;
  } catch (error) {
    console.log(`❌ インタラクションページへのアクセスに失敗: ${error.message}`);
    
    if (error.response) {
      console.log(`🔴 ステータスコード: ${error.response.status}`);
    }
    
    return false;
  }
}

// すべてのテストを実行
async function runAllTests() {
  console.log('\n🚀 テスト開始...\n');
  
  const results = {
    directAPI: await testDirectAPI(),
    airplfAPI: await testAirplfAPI(),
    interactionPage: await testInteractionPage()
  };
  
  console.log('\n📊 テスト結果サマリー:');
  console.log('='.repeat(70));
  console.log(`直接API接続: ${results.directAPI ? '✅ 成功' : '❌ 失敗'}`);
  console.log(`AIRPLF API接続: ${results.airplfAPI ? '✅ 成功' : '❌ 失敗'}`);
  console.log(`インタラクションページ: ${results.interactionPage ? '✅ 成功' : '❌ 失敗'}`);
  console.log('='.repeat(70));
  
  if (!results.directAPI && !results.airplfAPI) {
    console.log('\n⚠️ 結論: どのAPIにも接続できませんでした。ネットワーク接続の問題が考えられます。');
  } else if (results.directAPI || results.airplfAPI) {
    console.log('\n✅ 結論: APIに接続できました！');
  }
}

// テストを実行
runAllTests().catch(error => {
  console.error('\n😱 予期せぬエラーが発生しました:', error);
  process.exit(1);
}); 