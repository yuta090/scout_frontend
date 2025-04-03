# Airwork認証チェック - Netlify Functions

このプロジェクトは、Airwork採用管理システムのログイン検証をNetlify Functionsを使って実装したものです。

## 概要

- Puppeteerを使用したヘッドレスブラウザでAirworkログインページをスクレイピング
- サーバーレス環境で実行するためのNetlify Functions実装
- フロントエンドからのAPI呼び出しに対応したCORS設定

## 使用方法

### API呼び出し

```javascript
// 認証チェックのリクエスト例
fetch('https://your-site.netlify.app/.netlify/functions/check-airwork-auth', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'user@example.com',
    password: 'password123'
  })
})
.then(response => response.json())
.then(data => {
  console.log('認証結果:', data);
  // 認証成功の場合: data.success === true
  // 認証失敗の場合: data.success === false
})
.catch(error => {
  console.error('エラー:', error);
});
```

### レスポンス例

```json
// 成功時
{
  "success": true,
  "message": "ログインに成功しました",
  "details": {
    "status": "success",
    "code": "AUTH_SUCCESS",
    "url": "https://ats.rct.airwork.net/dashboards",
    "timestamp": "2023-05-20T12:34:56.789Z"
  }
}

// 失敗時
{
  "success": false,
  "message": "ログインに失敗しました: ユーザー名またはパスワードが正しくありません",
  "details": {
    "status": "invalid_credentials",
    "code": "AUTH_FAILED",
    "url": "https://ats.rct.airwork.net/interaction",
    "timestamp": "2023-05-20T12:34:56.789Z"
  }
}
```

## ローカルでの開発

```bash
# 依存関係のインストール
npm install

# ローカルサーバーの起動
npx netlify dev
```

## デプロイ

```bash
# Netlify CLIのインストール
npm install -g netlify-cli

# Netlifyにログイン
netlify login

# デプロイ
netlify deploy --prod
```

## 技術スタック

- Netlify Functions (サーバーレス環境)
- Puppeteer (ヘッドレスブラウザ)
- @sparticuz/chromium (サーバーレス用に最適化されたChromium) 