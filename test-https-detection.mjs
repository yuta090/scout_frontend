import { spawnSync } from 'child_process';

/**
 * curlコマンドを使用してHTTPS接続の詳細情報を取得する関数
 */
function testHttpsConnection(url) {
  console.log(`\n🔍 ${url} へのHTTPS接続テスト`);
  
  try {
    // curlコマンドを実行してHTTPS接続の詳細を取得
    const curl = spawnSync('curl', [
      '-v',               // 詳細表示
      '-sS',              // 進行状況は隠すがエラーは表示
      '--connect-timeout', '10', // 接続タイムアウト (秒)
      '--tlsv1.2',        // TLS v1.2を使用
      url
    ], { 
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    if (curl.status === 0) {
      console.log(`✅ ${url} への接続成功!`);
      
      // TLS/SSL情報を抽出して表示（stderrに出力される）
      const stderr = curl.stderr;
      
      // TLS バージョン
      const tlsVersionMatch = stderr.match(/^\* TLSv([0-9.]+) \(OUT\), TLS/m);
      if (tlsVersionMatch) {
        console.log(`TLSバージョン: ${tlsVersionMatch[1]}`);
      }
      
      // 暗号スイート
      const cipherMatch = stderr.match(/^\* SSL connection using ([^\n]+)/m);
      if (cipherMatch) {
        console.log(`暗号スイート: ${cipherMatch[1]}`);
      }
      
      // サーバー証明書情報
      const certInfoMatch = stderr.match(/^\* Server certificate:([^]*?)^\*/ms);
      if (certInfoMatch) {
        console.log('サーバー証明書情報:');
        const certLines = certInfoMatch[1].trim().split('\n');
        certLines.forEach(line => console.log(`  ${line.trim()}`));
      }
      
    } else {
      console.error(`❌ 接続エラー (終了コード: ${curl.status})`);
      if (curl.stderr) {
        console.error(`エラー詳細:\n${curl.stderr}`);
      }
    }
  } catch (error) {
    console.error(`❌ テスト実行エラー: ${error.message}`);
  }
}

// テスト対象URLリスト
const urls = [
  'https://ats.rct.airwork.net/airplf/api/v1/auth/login',
  'https://skfaxseunjlrjzxmlpqv.supabase.co/functions/v1/check-airwork-auth',
  'https://www.google.com'
];

// テストを実行
console.log('=== HTTPS接続テスト ===');
urls.forEach(url => {
  testHttpsConnection(url);
}); 