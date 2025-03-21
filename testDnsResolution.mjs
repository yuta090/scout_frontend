import { promisify } from 'util';
import { lookup } from 'dns';
import { createConnection } from 'net';

const dnsLookup = promisify(lookup);

/**
 * 指定されたドメインのDNS解決と接続テストを行う関数
 */
async function testDnsAndConnection(domain, port = 443) {
  console.log(`\n🔍 ${domain}:${port} のDNSおよび接続テスト開始`);
  
  try {
    console.log(`DNS解決を実行中...`);
    const result = await dnsLookup(domain);
    console.log(`✅ DNS解決成功: ${domain} -> ${result.address} (IPv${result.family})`);
    
    console.log(`TCP接続テスト中...`);
    const socket = createConnection({ host: domain, port: port });
    
    await new Promise((resolve, reject) => {
      // 接続成功時
      socket.on('connect', () => {
        console.log(`✅ ${domain}:${port} への接続成功!`);
        socket.end();
        resolve();
      });
      
      // エラー発生時
      socket.on('error', (err) => {
        console.error(`❌ 接続エラー: ${err.message}`);
        reject(err);
      });
      
      // タイムアウト設定
      setTimeout(() => {
        socket.destroy();
        reject(new Error('接続タイムアウト (5秒)'));
      }, 5000);
    });
    
  } catch (error) {
    console.error(`❌ テスト失敗: ${error.message}`);
  }
}

// テスト対象ドメインリスト
const domains = [
  { domain: 'ats.rct.airwork.net', port: 443, description: 'Airwork API' },
  { domain: 'skfaxseunjlrjzxmlpqv.supabase.co', port: 443, description: 'Supabase API' },
  { domain: 'www.google.com', port: 443, description: 'Google (比較用)' }
];

// テストを実行
(async () => {
  for (const site of domains) {
    console.log(`\n[テスト] ${site.description} (${site.domain}:${site.port})`);
    await testDnsAndConnection(site.domain, site.port);
  }
})(); 