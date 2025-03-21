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
      // Make a direct HTTP request to AirWork login API
      const response = await fetch('https://ats.rct.airwork.net/airplf/api/v1/auth/login', {
        method: 'POST',
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
      });

      const data = await response.json();

      if (!response.ok) {
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
      console.error('Error making auth request:', error);
      const response: AuthResponse = {
        success: false,
        message: '認証サーバーへの接続に失敗しました',
        details: {
          status: 'network_error',
          code: 'NETWORK_ERROR',
          timestamp: new Date().toISOString()
        }
      };

      throw response;
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
          timestamp: new Date().toISOString()
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
