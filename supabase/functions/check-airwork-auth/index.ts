import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
          }
        }
      );
    }

    // Launch browser with specific options for Edge Functions environment
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process'
      ]
    });

    try {
      const page = await browser.newPage();
      
      // Set a reasonable timeout and viewport
      page.setDefaultTimeout(30000);
      await page.setViewport({ width: 1280, height: 800 });
      
      // Navigate to AirWork login page with error handling
      try {
        await page.goto('https://ats.rct.airwork.net/airplf/login?agt_association_token=SelfServe', {
          waitUntil: 'networkidle2',
          timeout: 30000
        });
      } catch (error) {
        throw new Error('ログインページへのアクセスに失敗しました');
      }

      // Wait for login form with better error handling
      try {
        await page.waitForSelector('#account', { timeout: 10000 });
        await page.waitForSelector('#password', { timeout: 10000 });
        await page.waitForSelector('input[type="submit"]', { timeout: 10000 });
      } catch (error) {
        throw new Error('ログインフォームの読み込みに失敗しました');
      }

      // Fill in credentials with error handling
      try {
        await page.type('#account', username);
        await page.type('#password', password);
      } catch (error) {
        throw new Error('認証情報の入力に失敗しました');
      }
      
      // Click login and wait for navigation with error handling
      try {
        await Promise.all([
          page.click('input[type="submit"]'),
          page.waitForNavigation({ 
            waitUntil: 'networkidle2',
            timeout: 30000 
          })
        ]);
      } catch (error) {
        throw new Error('ログイン処理中にタイムアウトが発生しました');
      }

      // Check for login errors
      const errorElement = await page.$('.error-message');
      if (errorElement) {
        const errorText = await page.evaluate(el => el.textContent, errorElement);
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: errorText || "ログインに失敗しました" 
          }),
          { 
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          }
        );
      }

      // Check for successful login
      try {
        const header = await page.$('#air-common-header');
        if (header) {
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: "認証に成功しました" 
            }),
            { 
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            }
          );
        }
      } catch (error) {
        throw new Error('認証状態の確認に失敗しました');
      }

      // If we get here, authentication failed
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "認証に失敗しました" 
        }),
        { 
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );

    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error("Error in check-airwork-auth function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : "認証チェック中にエラーが発生しました",
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});