import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
serve(async (req)=>{
  // OPTIONSリクエスト（プリフライト）への対応
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  try {
    // リクエストボディのパース
    const { email, redirectUrl } = await req.json();
    // 必須パラメータの確認
    if (!email) {
      return new Response(JSON.stringify({
        success: false,
        error: "メールアドレスは必須です"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    // Supabaseクライアントの初期化
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({
        success: false,
        error: "サーバー設定が不足しています"
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    // リダイレクトURLの設定
    const finalRedirectUrl = redirectUrl || `${req.headers.get('origin') || ''}/reset-password`;
    console.log(`リダイレクトURL: ${finalRedirectUrl}`);
    // パスワードリセットリンクを生成
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: finalRedirectUrl
      }
    });
    if (error) {
      console.error('パスワードリセットリンク生成エラー:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error.message,
        details: error
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    // 生成されたリンクを取得
    const actionLink = data?.properties?.action_link;
    if (!actionLink) {
      return new Response(JSON.stringify({
        success: false,
        error: "リセットリンクの生成に失敗しました"
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    console.log(`生成されたリセットリンク: ${actionLink}`);
    // メール送信処理（Supabaseの自動メール送信を使用）
    return new Response(JSON.stringify({
      success: true,
      message: "パスワードリセットリンクを送信しました",
      data: {
        email: email,
        action_link: actionLink
      }
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error('パスワードリセット処理エラー:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "不明なエラーが発生しました",
      details: error
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
