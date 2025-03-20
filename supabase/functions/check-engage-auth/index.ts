import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

serve(async (req) => {
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
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          } 
        }
      );
    }

    // Launch browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      
      // Set a reasonable timeout
      page.setDefaultTimeout(30000);
      
      // Navigate to Engage login page
      await page.goto('https://en-gage.net/company_login/login/', {
        waitUntil: 'networkidle2'
      });

      // Wait for login form
      const loginIdXPath = '//*[@id="loginID"]';
      const passwordXPath = '//*[@id="password"]';
      const loginButtonXPath = '//*[@id="login-button"]';

      await page.waitForXPath(loginIdXPath);
      
      // Get elements
      const [loginIdInput] = await page.$x(loginIdXPath);
      const [passwordInput] = await page.$x(passwordXPath);
      const [loginButton] = await page.$x(loginButtonXPath);
      
      if (!loginIdInput || !passwordInput || !loginButton) {
        throw new Error("ログインフォームが見つかりませんでした");
      }
      
      // Fill in credentials
      await loginIdInput.type(username);
      await passwordInput.type(password);
      await loginButton.click();
      
      // Wait for either success or failure
      try {
        // Wait for header element that indicates successful login
        await page.waitForSelector(
          'body > div.MuiBox-root.mui-bpbk3x > header > div.MuiStack-root.mui-1io6cfr > a.MuiButtonBase-root.MuiButton-root.MuiButton-primary.MuiButton-primaryPrimary.MuiButton-sizeMedium.MuiButton-primarySizeMedium.MuiButton-colorPrimary.MuiButton-root.MuiButton-primary.MuiButton-primaryPrimary.MuiButton-sizeMedium.MuiButton-primarySizeMedium.MuiButton-colorPrimary.mui-126hwps',
          { timeout: 10000 }
        );
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "認証に成功しました" 
          }),
          { 
            headers: { 
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            } 
          }
        );
      } catch (timeoutError) {
        // Check if we're still on login page or if there's an error message
        const errorElement = await page.$('.error-message');
        const errorMessage = errorElement 
          ? await page.evaluate(el => el.textContent, errorElement)
          : "認証に失敗しました";

        return new Response(
          JSON.stringify({ 
            success: false, 
            message: errorMessage 
          }),
          { 
            headers: { 
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            } 
          }
        );
      }
    } finally {
      await browser.close();
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
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        } 
      }
    );
  }
});