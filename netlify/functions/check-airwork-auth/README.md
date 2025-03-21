# Airwork認証チェック関数

このNetlify Functionは、browserless.ioを使用してPuppeteerでAirworkのログイン認証をテストするための関数です。

## 仕組み

1. browserless.ioのリモートブラウザインスタンスに接続
2. Puppeteerを使用してAirworkのログインページにアクセス
3. ユーザー名とパスワードを入力してログイン
4. 指定されたXPathが存在するか確認して認証の成功を判定

## セットアップ

### 必要な環境変数

- `BROWSERLESS_TOKEN`: browserless.ioのAPIトークン（[browserless.io](https://www.browserless.io/)でアカウント作成後に取得）

### 環境変数の設定方法

Netlify CLIを使用する場合:
```
npx netlify-cli env:set BROWSERLESS_TOKEN "your-token-here"
```

または、Netlify Dashboard → Site settings → Environment variables から設定

## API仕様

### エンドポイント
`https://your-site.netlify.app/.netlify/functions/check-airwork-auth`

### メソッド
POST

### リクエストボディ
```json
{
  "username": "your-username",
  "password": "your-password",
  "xpath": "//a[contains(@class, 'logout')]"
}
```

- `username`: ログインに使用するユーザー名（必須）
- `password`: ログインに使用するパスワード（必須）
- `xpath`: 認証成功を判定するためのXPath（オプション、デフォルトは`//a[contains(@class, 'logout')]`）

### レスポンス例（成功時）
```json
{
  "success": true,
  "message": "認証に成功しました",
  "screenshot": "base64エンコードされたスクリーンショット"
}
```

### レスポンス例（失敗時）
```json
{
  "success": false,
  "message": "認証処理中にエラーが発生しました",
  "error": {
    "error": "エラーメッセージ",
    "screenshot": "base64エンコードされたスクリーンショット（取得できた場合）"
  }
}
```

## テスト方法

curlコマンドでテスト:
```bash
curl -X POST -H "Content-Type: application/json" -d '{"username":"your-username","password":"your-password","xpath":"//a[contains(@class, \"logout\")]"}' https://your-site.netlify.app/.netlify/functions/check-airwork-auth
```

## 参考資料

- [browserless.ioドキュメント](https://www.browserless.io/docs/puppeteer)
- [Puppeteer on Netlify Functions](https://www.browserless.io/blog/puppeteer-netlify) 