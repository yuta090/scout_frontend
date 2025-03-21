import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface AuthResponse {
  success: boolean;
  message: string;
  details: {
    status: 'success' | 'error' | 'network_error' | 'invalid_credentials' | 'account_locked' | 'maintenance';
    code: string;
    timestamp: string;
    attempts?: number;
    nextAttemptAt?: string;
    maintenanceEndAt?: string;
    error?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { username, password } = await req.json();

    // Validate input
    if (!username || !password) {
      const response: AuthResponse = {
        success: false,
        message: "ログイン情報が不足しています",
        details: {
          status: 'error',
          code: 'MISSING_CREDENTIALS',
          timestamp: new Date().toISOString()
        }
      };

      return new Response(
        JSON.stringify(response),
        { 
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 400
        }
      );
    }

    try {
      console.log(`認証試行: ユーザー名 ${username} (${new Date().toISOString()})`);
      
      // Make a direct HTTP request to AirWork login API with more detailed error handling
      const timeoutMs = 15000; // 15秒タイムアウト設定
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      console.log(`AirWork APIへリクエスト送信を開始...`);
      
      const response = await fetch('https://ats.rct.airwork.net/airplf/api/v1/auth/login', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
        },
        body: JSON.stringify({
          account: username,
          password: password,
          remember: false
        })
      }).finally(() => {
        clearTimeout(timeoutId);
      });
      
      console.log(`AirWork APIからのレスポンス: ステータス ${response.status}`);
      
      // レスポンスボディの取得
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('APIレスポンスのJSON解析エラー:', jsonError);
        data = { message: 'レスポンスの解析に失敗しました' };
      }

      if (!response.ok) {
        console.log(`認証失敗: ${data.message || "不明なエラー"}`);
        
        const authResponse: AuthResponse = {
          success: false,
          message: data.message || "認証に失敗しました",
          details: {
            status: 'error',
            code: 'AUTH_FAILED',
            timestamp: new Date().toISOString()
          }
        };

        // エラーの種類に応じて詳細情報を設定
        if (response.status === 401) {
          authResponse.details.status = 'invalid_credentials';
          authResponse.details.code = 'INVALID_CREDENTIALS';
        } else if (response.status === 429) {
          authResponse.details.status = 'error';
          authResponse.details.code = 'RATE_LIMIT';
          authResponse.details.attempts = data.attempts;
          authResponse.details.nextAttemptAt = data.nextAttemptAt;
        } else if (response.status === 423) {
          authResponse.details.status = 'account_locked';
          authResponse.details.code = 'ACCOUNT_LOCKED';
          authResponse.details.nextAttemptAt = data.nextAttemptAt;
        } else if (response.status === 503) {
          authResponse.details.status = 'maintenance';
          authResponse.details.code = 'MAINTENANCE';
          authResponse.details.maintenanceEndAt = data.maintenanceEndAt;
        }

        return new Response(
          JSON.stringify(authResponse),
          { 
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            },
            status: response.status
          }
        );
      }

      console.log(`認証成功: ユーザー ${username}`);
      
      const authResponse: AuthResponse = {
        success: true,
        message: "認証に成功しました",
        details: {
          status: 'success',
          code: 'AUTH_SUCCESS',
          timestamp: new Date().toISOString()
        }
      };

      return new Response(
        JSON.stringify(authResponse),
        { 
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 200
        }
      );

    } catch (error) {
      // エラーの詳細な情報をログに記録
      console.error('Error making auth request:', error);
      console.error('Error type:', typeof error);
      console.error('Error name:', error instanceof Error ? error.name : 'NotError');
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

      // エラーレスポンスを作成（throwではなく直接レスポンスを返す）
      const response: AuthResponse = {
        success: false,
        message: '認証サーバーへの接続に失敗しました',
        details: {
          status: 'network_error',
          code: 'NETWORK_ERROR',
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? `${error.name}: ${error.message}` : String(error)
        }
      };

      // エラーをスローするのではなく、エラーレスポンスを返す
      return new Response(
        JSON.stringify(response),
        { 
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 500
        }
      );
    }

  } catch (error) {
    console.error("Error in check-airwork-auth function:", error);
    
    let response: AuthResponse;
    if (error && typeof error === 'object' && 'details' in error) {
      response = error as AuthResponse;
    } else {
      response = {
        success: false,
        message: error instanceof Error ? error.message : "認証チェック中にエラーが発生しました",
        details: {
          status: 'error',
          code: 'UNKNOWN_ERROR',
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.stack : String(error)
        }
      };
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    );
  }
});
