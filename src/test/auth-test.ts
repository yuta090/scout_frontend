import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// .envファイルから環境変数を読み込み
dotenv.config();

// 環境変数の取得
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase環境変数が設定されていません');
}

// テスト用のSupabaseクライアントを作成
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAirworkAuth() {
  console.log('\n=== AirWork認証テスト開始 ===\n');
  console.log('Supabase URL:', supabaseUrl);

  try {
    // テストユーザーの作成
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'Test123!@#';

    console.log('\n1. テストユーザーの作成');
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          role: 'agency',
          company_name: 'テスト株式会社',
          contact_name: 'テスト太郎',
          phone: '03-1234-5678'
        }
      }
    });

    if (signUpError) {
      throw signUpError;
    }

    if (!user) {
      throw new Error('テストユーザーの作成に失敗しました');
    }

    console.log('✅ テストユーザー作成成功:', {
      id: user.id,
      email: testEmail
    });

    // セッションの取得
    console.log('\n2. ログイン実行');
    const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (signInError) {
      throw signInError;
    }

    if (!session) {
      throw new Error('セッションの取得に失敗しました');
    }

    console.log('✅ ログイン成功');

    // テスト用の認証情報
    const testCredentials = {
      username: 'test-user',
      password: 'test-pass'
    };

    console.log('\n3. Edge Function呼び出しテスト');
    console.time('認証処理時間');

    const response = await fetch(`${supabaseUrl}/functions/v1/check-airwork-auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': supabaseAnonKey
      },
      body: JSON.stringify(testCredentials)
    });

    console.timeEnd('認証処理時間');

    if (!response.ok) {
      const errorText = await response.text();
      console.error('\n❌ Edge Function エラー:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });

      if (response.status === 404) {
        console.error('Edge Functionが見つかりません。Supabaseにデプロイされているか確認してください。');
      } else if (response.status === 401) {
        console.error('認証エラー。Supabaseの認証情報を確認してください。');
      }
      return;
    }

    const data = await response.json();
    console.log('\n✅ Edge Function レスポンス:', {
      success: data.success,
      message: data.message
    });

    if (data?.logs) {
      console.log('\n📋 認証プロセスログ:');
      console.log('------------------------');
      data.logs.forEach((log: any) => {
        const timestamp = new Date(log.timestamp).toLocaleTimeString();
        const icon = log.error ? '❌' : log.data ? '📝' : '✓';
        
        console.log(`[${timestamp}] ${icon} ${log.message}`);
        
        if (log.data) {
          console.log('  データ:', log.data);
        }
        if (log.error) {
          console.log('  エラー:', log.error);
        }
      });
      console.log('------------------------');
    }

    // クリーンアップ: テストユーザーの削除
    console.log('\n4. クリーンアップ');
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error('❌ テストユーザーの削除に失敗:', deleteError);
    } else {
      console.log('✅ テストユーザーを削除しました');
    }

    console.log('\n=== テスト完了 ===\n');

  } catch (error) {
    console.error('\n❌ テストエラー:', error);
    console.error('スタックトレース:', error instanceof Error ? error.stack : '不明なエラー');
  } finally {
    // テスト後にサインアウト
    await supabase.auth.signOut();
  }
}

// テストの実行
testAirworkAuth();