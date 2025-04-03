# Airwork認証テスト結果

## テスト概要

Airworkの認証システムについて、Netlify FunctionsとSupabase Edge Functionsを使用して複数のアプローチでテストを行いました。

### テスト環境
- **ローカル環境**: Mac OS X (darwin 24.3.0)
- **テストアカウント**: kido@tomataku.jp / Tomataku0427#
- **テスト対象API**: 
  - `https://ats.rct.airwork.net/airplf/api/v1/auth/login`
  - `https://connect.airregi.jp/auth/login`

## テスト結果サマリー

| テスト項目 | 結果 | ステータスコード | 備考 |
|------------|------|------------------|------|
| 直接APIアクセス | ❌ 失敗 | 404 | APIエンドポイントが見つからない |
| AIRPLF API | ❌ 失敗 | 403 | アクセス権限エラー |
| インタラクションページ | ✅ 成功 | 200 | ログインリンク確認 |
| Supabase Edge Function | ❌ 失敗 | 500 | NETWORK_ERROR |
| Netlify Function | ❌ 失敗 | - | Puppeteerエラー |

## 詳細分析

### 1. 直接APIアクセス

```
🔍 直接APIテスト: https://ats.rct.airwork.net/airplf/api/v1/auth/login
❌ APIエラー: Request failed with status code 404
🔴 ステータスコード: 404
```

404エラーは、APIエンドポイントが存在しないことを示しています。Airworkの認証APIは、公開されている直接アクセス可能なAPIではなく、フロントエンドのJavaScriptコードから呼び出される内部APIか、別のエンドポイントを使用している可能性があります。

### 2. AIRPLF API

```
🔍 AIRPLF_API_DOMAINテスト: https://connect.airregi.jp
❌ APIエラー: Request failed with status code 403
🔴 ステータスコード: 403
```

403エラーは、APIへのアクセス権限がないことを示しています。これは以下の理由が考えられます：
- 認証ヘッダーまたはAPI keyが必要
- CORS制限により外部からのアクセスが禁止されている
- IP制限またはリファラーチェックを実施している
- クライアントIDの検証または特定のセッションフローが必要

### 3. インタラクションページ

```
🔍 インタラクションページテスト: https://ats.rct.airwork.net/interaction
✅ ステータスコード: 200
✅ ログインリンクが見つかりました
```

インタラクションページには正常にアクセスでき、ログインリンクも存在しています。このページからのログインフローを追跡する必要があります。

### 4. Next.jsランタイム設定

ページから抽出されたランタイム設定に重要な情報があります：

```json
{
  "AIRPLF_API_DOMAIN": "https://connect.airregi.jp",
  "AIRPLF_CLIENT_ID": "AWR"
}
```

これらはAirworkの認証APIに関連する設定ですが、具体的なエンドポイントや認証フローの詳細は不明です。

### 5. Supabase Edge Functions

Supabase Edge Functionsからのアクセスも失敗しています：

```
❌ Supabase Function テストエラー:
   ステータスコード: 500
   レスポンスデータ: {
     "success": false,
     "message": "認証サーバーへの接続に失敗しました",
     "details": {
       "status": "network_error",
       "code": "NETWORK_ERROR",
       "timestamp": "2025-03-21T06:53:49.338Z"
     }
   }
```

これはCloudflare Workersベースの環境から外部ドメインに接続できない制限を示しています。

### 6. Netlify Function

Netlify Functionからのテストも失敗しています。Puppeteerを使用した自動ブラウジングはエラーが発生しました：

```
❌ 例外が発生しました: spawn ENOEXEC
```

これはChromiumの実行に関する問題が発生していることを示しています。

## 重要な発見

1. **正しいエンドポイント不明**: `/airplf/api/v1/auth/login`は404を返すため、正確な認証APIエンドポイントは不明です。

2. **認証フローが複雑**: AirworkはSPAとして実装されており、単純なAPIコール以上の複雑な認証フローを持つ可能性があります。

3. **アクセス制限**: API直接アクセスは許可されていないようです（403エラー）。

4. **環境制限**: サーバーレス環境（SupabaseやNetlify）からの外部APIアクセスには制限があります。

## 推奨対応策

1. **ブラウザ認証フローの分析**
   - 開発者ツールを使用して実際のログインフローを追跡
   - XHRリクエストをキャプチャして正確なエンドポイントとパラメータを特定

2. **正しいヘッダーと認証情報の特定**
   - リファラー、Origin、Cookie、APIキーなど、必要なヘッダーを特定

3. **プロキシサーバーの検討**
   - より制限の少ないサーバー環境でプロキシを構築
   - クライアント→プロキシ→Airwork APIの構成を検討

4. **公式APIドキュメントの確認**
   - もしAirworkが公式APIを提供している場合、そのドキュメントを確認

5. **別のサーバーレス環境の試行**
   - AWS LambdaやGoogle Cloud Functionsなど、より柔軟なサーバーレス環境を検討 