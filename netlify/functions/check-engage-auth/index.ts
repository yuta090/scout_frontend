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
      
      // Navigate to Engage login page
      await page.goto('https://en-gage.net/company_login/login/', {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      // Wait for login form
      await page.waitForSelector('#loginID');
      await page.waitForSelector('#password');
      await page.waitForSelector('#login-button');

      // Fill in credentials
      await page.type('#loginID', username);
      await page.type('#password', password);

      // Click login and wait for navigation
      await Promise.all([
        page.click('#login-button'),
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
      const success = await page.evaluate(() => {
        return window.location.pathname.includes('/company/');
      });

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
    console.error('Error in check-engage-auth:', error);

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