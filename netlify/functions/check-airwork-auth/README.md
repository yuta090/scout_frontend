# Airwork認証チェック関数

このNetlify Functionは、chrome-aws-lambdaを使用してPuppeteerでAirworkのログイン認証をテストするための関数です。

## 仕組み

1. Netlify Functionsの環境でchrome-aws-lambdaを使って軽量なChromiumを実行
2. Puppeteerを使用してAirworkのログインページにアクセス
3. ユーザー名とパスワードを入力してログイン
4. 指定されたXPathが存在するか確認して認証の成功を判定

## 技術的な詳細

- `chrome-aws-lambda`: AWS Lambda環境向けに最適化されたChromiumパッケージを使用
- `puppeteer-core`: ブラウザ自動化のコア機能のみを提供する軽量版Puppeteer
- 環境検出: Netlify環境とローカル開発環境を自動的に検出して適切なブラウザを使用

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

- [chrome-aws-lambda](https://github.com/alixaxel/chrome-aws-lambda)
- [Netlify Functionsでheadless chromiumを動かす](https://mizchi.dev/202006161500-netlify-lambda-chromium) 