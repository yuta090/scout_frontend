// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

console.log("AirWork認証チェック関数を開始");

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  // OPTIONSリクエストの処理
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const logs: Array<{
    timestamp: string;
    message: string;
    data?: any;
    error?: string;
  }> = [];

  const addLog = (message: string, data?: any, error?: string) => {
    logs.push({
      timestamp: new Date().toISOString(),
      message,
      ...(data && { data }),
      ...(error && { error })
    });
  };

  try {
    addLog("認証リクエストを受信");

    // リクエストボディの解析
    const { username, password } = await req.json();

    // 入力値の検証
    if (!username || !password) {
      addLog("必須パラメータが不足", { username: !!username, password: !!password });
      throw new Error("ユーザー名とパスワードは必須です");
    }

    if (username.length < 4) {
      addLog("ユーザー名が短すぎる", { length: username.length });
      throw new Error("ユーザー名は4文字以上で入力してください");
    }

    if (password.length < 8) {
      addLog("パスワードが短すぎる", { length: password.length });
      throw new Error("パスワードは8文字以上で入力してください");
    }

    addLog("認証情報の検証に成功");

    // Puppeteerの起動
    addLog("ブラウザを起動");
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      addLog("新規ページを作成");
      
      // AirWorkのログインページにアクセス
      await page.goto("https://ats.rct.airwork.jp/airplf/login");
      addLog("ログインページにアクセス");
      
      // ユーザー名とパスワードを入力
      await page.type("#loginId", username);
      await page.type("#password", password);
      addLog("認証情報を入力");
      
      // ログインボタンをクリック
      await page.click("button[type='submit']");
      addLog("ログインボタンをクリック");
      
      // ログイン後のページ遷移を待機
      await page.waitForNavigation();
      addLog("ページ遷移を待機");
      
      // ログイン成功の確認
      const isLoggedIn = await page.evaluate(() => {
        return document.querySelector(".user-name") !== null;
      });

      addLog(isLoggedIn ? "ログイン成功" : "ログイン失敗", { isLoggedIn });

      return new Response(
        JSON.stringify({
          success: isLoggedIn,
          message: isLoggedIn ? "認証に成功しました" : "認証に失敗しました。認証情報を確認してください。",
          logs
        }),
        { 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );

    } finally {
      await browser.close();
      addLog("ブラウザを終了");
    }

  } catch (error) {
    console.error("認証エラー:", error);
    addLog("エラーが発生", null, error instanceof Error ? error.message : "不明なエラー");

    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : "認証チェック中にエラーが発生しました",
        logs
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 400
      }
    );
  }
});