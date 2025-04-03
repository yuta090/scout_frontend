import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    };
  }

  try {
    const { username, password } = JSON.parse(event.body || '{}');

    if (!username || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'ログイン情報が不足しています'
        })
      };
    }

    // Launch browser with Chromium
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    try {
      const page = await browser.newPage();
      
      // Set a reasonable timeout
      page.setDefaultTimeout(30000);
      
      // Navigate to AirWork login page
      await page.goto('https://ats.rct.airwork.net/airplf/login?agt_association_token=SelfServe', {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      // Wait for login form
      await page.waitForSelector('#account');
      await page.waitForSelector('#password');
      await page.waitForSelector('input[type="submit"]');

      // Fill in credentials
      await page.type('#account', username);
      await page.type('#password', password);

      // Click login and wait for navigation
      await Promise.all([
        page.click('input[type="submit"]'),
        page.waitForNavigation({ waitUntil: 'networkidle0' })
      ]);

      // Check for login errors
      const errorElement = await page.$('.error-message');
      if (errorElement) {
        const errorText = await page.evaluate(el => el.textContent, errorElement);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: false,
            message: errorText || 'ログインに失敗しました'
          })
        };
      }

      // Check for successful login
      const header = await page.$('#air-common-header');
      const success = !!header;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success,
          message: success ? '認証に成功しました' : '認証に失敗しました'
        })
      };

    } finally {
      await browser.close();
    }

  } catch (error) {
    console.error('Error in check-airwork-auth:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : '認証チェック中にエラーが発生しました'
      })
    };
  }
};