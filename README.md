  <!-- 最終更新: 2025-05/10 -->

# HRAim Frontend

このプロジェクトは、[Puppeteer](https://pptr.dev/)と[@sparticuz/chromium](https://github.com/Sparticuz/chromium)を使用して、Netlify Functions でヘッドレスブラウザによる認証機能を実装したものです。

## 概要

- `check-airwork-auth`: Airwork 認証のチェック機能
- `check-engage-auth`: Engage 認証のチェック機能
- `engage-auth-simple`: 簡素化した Engage 認証機能

## 認証モード

- フルブラウザモード: Puppeteer を使用してブラウザを操作
- 簡易認証モード: ハードコードされた認証情報を使用した簡易チェック

## 構成

このプロジェクトは以下のようなディレクトリ構成になっています。

```
netlify/
  functions/
    check-airwork-auth/
      index.js
      package.json
    check-engage-auth/
      index.js
      package.json
    engage-auth-simple/
      index.js
      package.json
```

## 使用技術

- Node.js: サーバーサイド JavaScript 実行環境
- Netlify Functions: サーバーレス関数ホスティング
- Chrome AWS Lambda: AWS Lambda/Netlify 向け Chromium パッケージ
- Puppeteer: ヘッドレスブラウザ操作ライブラリ

## 機能概要

- Netlify Functions での認証チェック
- 50MB 制限内での Puppeteer 実装
- 複数認証方法のフォールバックアプローチ

## 実装状況

### 現在のステータス

Netlify Functions での実装はテスト中ですが、以下の重要な問題が判明しています：

1. **IP ベースのブロック**: Airwork サイトは特定の IP アドレスからのアクセスをブロックしている可能性があります。ローカル環境では動作しますが、Netlify 関数の実行環境からはエラーが発生します。

2. **ヘッドレスブラウザの検出**: Airwork サイトがヘッドレスブラウザの使用を検出してブロックしている可能性があります。サイトの分析結果は取得できますが、インタラクションが制限されています。

3. **JavaScript の実行環境**: サーバーレス環境での JavaScript の実行に制限があり、サイトの一部機能が正常に動作しない可能性があります。

## テスト結果

以下の結果が確認されました：

- ローカル環境でのテスト: ✅ Airwork サイトにアクセスできます
- Netlify Functions 環境: ❌ 「アカウント登録・ログイン選択」ページは表示されますが、ログインボタンのクリックに失敗します

## 実装の詳細

### 使用している主要パッケージ

- `@sparticuz/chromium` - サーバーレス環境用に最適化された Chromium
- `puppeteer-core` - Puppeteer のコア機能
- `axios` - API 通信用

### netlify.toml の設定

```toml
[functions]
  node_bundler = "esbuild"
  external_node_modules = ["@sparticuz/chromium", "puppeteer-core"]
```

## 推奨される解決策

### 1. Browserless.io の利用

[Browserless](https://www.browserless.io/)は、サーバーレス環境での Puppeteer 実行を支援するサービスです。Netlify Functions から以下のように Browserless に接続できます：

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

AWS Lambda では、より大きなメモリ容量とランタイムが使用できるため、Puppeteer の実行環境としてより適しています：

- **Lambda レイヤー**: Chromium を別レイヤーとして配置
- **メモリ上限**: 最大 10GB までメモリを割り当て可能
- **タイムアウト**: 最大 15 分の実行時間

### 3. Airwork 公式 API の利用

もし可能であれば、Airwork が提供する公式 API を使用する方法が最も信頼性が高いです。これにより、ヘッドレスブラウザのブロックの問題を解決できます。

## 最終推奨事項

1. **短期解決策**: Browserless.io の利用
2. **中期解決策**: AWS Lambda + Chromium レイヤーへの移行
3. **長期解決策**: Airwork 公式 API または認証連携の検討

## 今後の開発

Puppeteer アプローチを継続する場合は、以下の改善を検討してください：

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
