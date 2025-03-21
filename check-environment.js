// Deno環境の情報を取得するスクリプト
// Supabaseの上でDenoがどのような設定で動いているかを確認するために使用します
// このスクリプトを含むEdge Functionをデプロイして実行します

// ヘッダーの設定
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

// APIハンドラ関数
const handler = async (req) => {
  // OPTIONS (プリフライト) リクエストへの対応
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 環境情報を収集
    const environmentInfo = {
      deno: {
        version: Deno.version,
        build: Deno.build,
        permissions: {
          net: await checkPermission('net'),
          env: await checkPermission('env'),
          read: await checkPermission('read'),
          write: await checkPermission('write'),
          run: await checkPermission('run')
        }
      },
      runtime: {
        userAgent: globalThis.navigator?.userAgent || 'unknown',
        languages: globalThis.navigator?.languages || [],
        platform: globalThis.navigator?.platform || 'unknown'
      },
      environment: {
        currentTimeUTC: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        locale: Intl.DateTimeFormat().resolvedOptions().locale
      },
      // TLS設定を取得
      tlsCheck: await checkTLS()
    };

    // 環境変数をリストアップ（実際にはセキュリティ上、制限があるかもしれない）
    try {
      environmentInfo.environment.env = Object.fromEntries(
        Object.entries(Deno.env.toObject()).map(([key, value]) => {
          // センシティブな値は隠す
          if (key.toLowerCase().includes('key') || 
              key.toLowerCase().includes('token') || 
              key.toLowerCase().includes('secret') ||
              key.toLowerCase().includes('password')) {
            return [key, '***REDACTED***'];
          }
          return [key, value];
        })
      );
    } catch (err) {
      environmentInfo.environment.env = { error: `環境変数へのアクセスができません: ${err.message}` };
    }

    // 応答を返す
    return new Response(
      JSON.stringify(environmentInfo, null, 2),
      { 
        headers: { ...corsHeaders },
        status: 200
      }
    );

  } catch (error) {
    // エラーハンドリング
    console.error('Error:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message,
        stack: error.stack
      }, null, 2),
      {
        headers: { ...corsHeaders },
        status: 500
      }
    );
  }
};

// 権限チェックのユーティリティ関数
async function checkPermission(name) {
  try {
    const status = await Deno.permissions.query({ name });
    return status.state;
  } catch (error) {
    return `Error checking: ${error.message}`;
  }
}

// TLS関連のチェックを行う関数
async function checkTLS() {
  const tlsInfo = {
    supportedVersions: [],
    testConnections: {}
  };

  // TLSバージョンをチェック
  const urls = [
    { url: 'https://www.howsmyssl.com/a/check', name: 'howsmyssl' },
    { url: 'https://ats.rct.airwork.net', name: 'airwork' },
    { url: 'https://cloudflareresearch.com/resources/publications/serverless-in-the-wild/info.json', name: 'cloudflare' }
  ];

  // 各URLへの接続をテスト
  for (const { url, name } of urls) {
    try {
      console.log(`Checking TLS connection to ${url}`);
      const startTime = Date.now();
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'User-Agent': 'Deno/1.0 TLS Test' }
      });

      // レスポンスのステータスコードと時間を記録
      tlsInfo.testConnections[name] = {
        status: response.status,
        responseTimeMs: Date.now() - startTime,
        ok: response.ok
      };

      // HowsMySSLの場合、詳細なTLS情報を取得
      if (name === 'howsmyssl' && response.ok) {
        const data = await response.json();
        tlsInfo.testConnections[name].details = {
          tls_version: data.tls_version,
          rating: data.rating,
          beast_vuln: data.beast_vuln,
          able_to_detect_n_minus_one_splitting: data.able_to_detect_n_minus_one_splitting,
          insecure_cipher_suites: data.insecure_cipher_suites
        };
      }
    } catch (error) {
      tlsInfo.testConnections[name] = {
        error: error.message,
        errorType: error.name,
        errorStack: error.stack
      };
    }
  }

  return tlsInfo;
}

// Deno Deployでのハンドラー登録
Deno.serve(handler); 