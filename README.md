# Airwork 認証システム Netlify Functions 実装

このプロジェクトは、[Puppeteer](https://pptr.dev/)と[@sparticuz/chromium](https://github.com/Sparticuz/chromium)を使用して、Netlify Functionsでヘッドレスブラウザによる認証機能を実装したものです。

## 機能概要

- Netlify Functionsでの認証チェック
- 50MB制限内でのPuppeteer実装
- 複数認証方法のフォールバックアプローチ

## 実装状況

### 現在のステータス

Netlify Functionsでの実装はテスト中ですが、以下の重要な問題が判明しています：

1. **IPベースのブロック**: Airworkサイトは特定のIPアドレスからのアクセスをブロックしている可能性があります。ローカル環境では動作しますが、Netlify関数の実行環境からはエラーが発生します。

2. **ヘッドレスブラウザの検出**: Airworkサイトがヘッドレスブラウザの使用を検出してブロックしている可能性があります。サイトの分析結果は取得できますが、インタラクションが制限されています。

3. **JavaScriptの実行環境**: サーバーレス環境でのJavaScriptの実行に制限があり、サイトの一部機能が正常に動作しない可能性があります。

## テスト結果

以下の結果が確認されました：

- ローカル環境でのテスト: ✅ Airworkサイトにアクセスできます
- Netlify Functions環境: ❌ 「アカウント登録・ログイン選択」ページは表示されますが、ログインボタンのクリックに失敗します

## 実装の詳細

### 使用している主要パッケージ

- `@sparticuz/chromium` - サーバーレス環境用に最適化されたChromium
- `puppeteer-core` - Puppeteerのコア機能
- `axios` - API通信用

### netlify.toml の設定

```toml
[functions]
  node_bundler = "esbuild"
  external_node_modules = ["@sparticuz/chromium", "puppeteer-core"]
```

## 推奨される解決策

### 1. Browserless.io の利用

[Browserless](https://www.browserless.io/)は、サーバーレス環境でのPuppeteer実行を支援するサービスです。Netlify Functionsから以下のようにBrowserlessに接続できます：

```javascript
const puppeteer = require('puppeteer-core');

// Browserlessに接続
const browser = await puppeteer.connect({
  browserWSEndpoint: 'wss://chrome.browserless.io?token=YOUR_TOKEN'
});

// 残りのコードは通常のPuppeteerと同じ
const page = await browser.newPage();
await page.goto('https://ats.rct.airwork.net/interaction');
```

### 2. AWS Lambda への移行

AWS Lambdaでは、より大きなメモリ容量とランタイムが使用できるため、Puppeteerの実行環境としてより適しています：

- **Lambdaレイヤー**: Chromiumを別レイヤーとして配置
- **メモリ上限**: 最大10GBまでメモリを割り当て可能
- **タイムアウト**: 最大15分の実行時間

### 3. Airwork 公式API の利用

もし可能であれば、Airworkが提供する公式APIを使用する方法が最も信頼性が高いです。これにより、ヘッドレスブラウザのブロックの問題を解決できます。

## 最終推奨事項

1. **短期解決策**: Browserless.ioの利用
2. **中期解決策**: AWS Lambda + Chromiumレイヤーへの移行
3. **長期解決策**: Airwork公式APIまたは認証連携の検討

## 今後の開発

Puppeteerアプローチを継続する場合は、以下の改善を検討してください：

1. **追加のブラウザ設定**:
   ```javascript
   const browser = await puppeteer.launch({
     args: [
       '--disable-features=IsolateOrigins',
       '--disable-site-isolation-trials',
       '--disable-blink-features=AutomationControlled'
     ]
   });
   await page.evaluateOnNewDocument(() => {
     Object.defineProperty(navigator, 'webdriver', { get: () => false });
   });
   ```

2. **ユーザーエージェントのローテーション**:
   ```javascript
   const userAgents = [
     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
     'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15'
   ];
   await page.setUserAgent(userAgents[Math.floor(Math.random() * userAgents.length)]);
   ```

## 参考リソース

- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)
- [Puppeteer Documentation](https://pptr.dev/)
- [@sparticuz/chromium GitHub](https://github.com/Sparticuz/chromium)
- [Browserless Documentation](https://docs.browserless.io/) 