import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS対応のためのヘッダー
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Resend APIキーを環境変数から取得
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

serve(async (req) => {
  // OPTIONSリクエスト（プリフライト）への対応
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  // POSTリクエスト以外は拒否
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Method Not Allowed' 
      }),
      { 
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }

  try {
    // API Keyの確認
    if (!RESEND_API_KEY) {
      console.error('Resend API Keyが設定されていません');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'API key not configured'
        }),
        { 
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // リクエストボディのパース
    const { from = 'スカウトツール <support@hraim.com>', to, subject, html, text } = await req.json();

    // 必須パラメータの確認
    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required parameters',
          details: {
            from: !from,
            to: !to,
            subject: !subject,
            html: !html
          }
        }),
        { 
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    console.log(`メール送信を開始します: 宛先=${Array.isArray(to) ? to.join(', ') : to}, 件名=${subject}`);

    // Resend APIを使用してメール送信
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html,
        text: text || undefined
      })
    });

    // レスポンスの処理
    const data = await response.json();

    if (!response.ok) {
      console.error('メール送信エラー:', data);
      return new Response(
        JSON.stringify({
          success: false,
          error: data.message || 'Failed to send email',
          details: data
        }),
        { 
          status: response.status,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    console.log('メール送信に成功しました:', data);
    return new Response(
      JSON.stringify({
        success: true,
        data
      }),
      { 
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('メール送信処理エラー:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? { message: error.message, stack: error.stack } : error
      }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});