// 認証処理を行う関数
exports.handler = async (event, context) => {
  // OPTIONSメソッドへの対応
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  // リクエストがPOSTであることを確認
  if (event.httpMethod !== 'POST') {
    return generateErrorResponse(
      'POSTリクエストが必要です',
      'METHOD_NOT_ALLOWED'
    );
  }

  let requestData;
  try {
    requestData = JSON.parse(event.body);
  } catch (error) {
    return generateErrorResponse(
      'リクエストボディの解析に失敗しました',
      'INVALID_REQUEST'
    );
  }

  // 必要なパラメータが揃っているか確認
  const { username, password } = requestData;
  if (!username || !password) {
    return generateErrorResponse(
      'ユーザー名とパスワードが必要です',
      'MISSING_PARAMETERS'
    );
  }

  console.log(`🔒 ${username} の認証を開始します...`);

  // まずは直接APIを試みる
  try {
    console.log(`📡 APIエンドポイントへのリクエスト準備: https://ats.rct.airwork.net/airplf/api/v1/auth/login`);
    console.log(`📝 リクエストパラメータ: userId=${username}, password=***`);

    const response = await axios.post(
      'https://ats.rct.airwork.net/airplf/api/v1/auth/login',
      {
        userId: username,
        password
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
        },
        timeout: 30000 // タイムアウトを30秒に延長
      }
    );

    console.log(`📥 APIレスポンス: ステータスコード=${response.status}`);
    console.log(`📊 レスポンスボディ:`, JSON.stringify(response.data).substring(0, 500));

    if (response.status === 200 && response.data.success) {
      console.log('✅ APIによる認証に成功しました');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'APIによる認証に成功しました',
          details: {
            status: 'success',
            code: 'API_AUTH_SUCCESS',
            timestamp: new Date().toISOString()
          }
        })
      };
    } else {
      console.log(`❌ API認証の結果が成功でない: ${JSON.stringify(response.data)}`);
      return generateErrorResponse(
        'APIによる認証に失敗しました',
        'API_AUTH_FAILED',
        {
          response: response.data
        }
      );
    }
  } catch (error) {
    console.log(`❌ APIによる認証に失敗:`, error.message);
    
    if (error.response) {
      console.log(`🔴 APIからのエラーレスポンス:`, error.response.status, JSON.stringify(error.response.data).substring(0, 500));
    }

    // 次にAirwork相互作用ページへのアクセスを試みる
    try {
      console.log(`🌐 Airworkインタラクションページへのアクセス: https://ats.rct.airwork.net/interaction`);
      
      const interactionResponse = await axios.get('https://ats.rct.airwork.net/interaction', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
        },
        timeout: 30000
      });
      
      console.log(`✅ インタラクションページアクセス成功: ステータスコード=${interactionResponse.status}`);
      
      // Next.jsランタイム設定を探す
      const runtimeConfigMatch = interactionResponse.data.match(/"runtimeConfig":\s*({[^}]+})/);
      if (runtimeConfigMatch) {
        console.log(`🔍 Next.jsランタイム設定が見つかりました:`, runtimeConfigMatch[1]);
      }
      
      // ログインリンクを探す
      const loginLinkMatch = interactionResponse.data.match(/<a[^>]*>(ログイン)<\/a>/i);
      if (loginLinkMatch) {
        console.log(`🔍 ログインリンクが見つかりました:`, loginLinkMatch[0]);
      }
      
      return generateErrorResponse(
        'APIによる認証に失敗しましたがインタラクションページにはアクセス可能です',
        'API_AUTH_FAILED_BUT_SITE_ACCESSIBLE',
        {
          errorMessage: error.message,
          hasLoginLink: !!loginLinkMatch,
          hasRuntimeConfig: !!runtimeConfigMatch
        }
      );
    } catch (siteError) {
      console.log(`❌ インタラクションページへのアクセスにも失敗:`, siteError.message);
      
      return generateErrorResponse(
        '認証サーバーへの接続に失敗しました',
        'NETWORK_ERROR',
        {
          apiErrorMessage: error.message,
          siteErrorMessage: siteError.message,
          errorType: error.constructor.name
        }
      );
    }
  }
}; 