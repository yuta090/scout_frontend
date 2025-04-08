import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

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
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "ログイン情報が不足しています" 
        }),
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
      // Make a direct HTTP request to Engage login API
      const response = await fetch('https://en-gage.net/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
        },
        body: JSON.stringify({
          email: username,
          password: password,
          remember_me: false
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: data.message || "認証に失敗しました" 
          }),
          { 
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            },
            status: 401
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "認証に成功しました" 
        }),
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
      throw new Error('認証サーバーへの接続に失敗しました');
    }

  } catch (error) {
    console.error("Error in check-engage-auth function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : "認証チェック中にエラーが発生しました"
      }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    );
  }
});// 追加テスト: バージョン管理テスト
