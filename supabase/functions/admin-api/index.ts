import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
// CORS対応のためのヘッダー
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
// Supabase Admin APIクライアントの初期化
const supabaseAdmin = createClient(// 環境変数からSupabase URLとサービスロールキーを取得
Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
// メール送信関数
async function sendEmail(emailData) {
  try {
    // 必須パラメータのチェック
    if (!emailData.from) {
      throw new Error('送信元メールアドレスは必須です');
    }
    if (!emailData.to) {
      throw new Error('送信先メールアドレスは必須です');
    }
    if (!emailData.subject) {
      throw new Error('件名は必須です');
    }
    if (!emailData.html) {
      throw new Error('HTML本文は必須です');
    }
    // Resend APIキーを環境変数から取得
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('Resend API Keyが設定されていません');
    }
    // Resend APIを呼び出してメール送信
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: emailData.from,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text || undefined
      })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`メール送信エラー: ${errorData.message || response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('メール送信エラー:', error);
    throw error;
  }
}
serve(async (req)=>{
  // OPTIONSリクエスト（プリフライト）への対応
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  try {
    // リクエストボディのパース
    const { action, data } = await req.json();
    // アクションに基づいて処理を分岐
    switch(action){
      case 'createUser':
        {
          // 必須パラメータの検証
          const { email, password, userData, emailSettings } = data;
          if (!email || !password) {
            return new Response(JSON.stringify({
              success: false,
              error: 'メールアドレスとパスワードは必須です'
            }), {
              status: 400,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            });
          }
          console.log(`ユーザー作成リクエスト: ${email}`);
          try {
            // メールアドレスの存在確認
            const { data: existingUsers, error: checkError } = await supabaseAdmin.auth.admin.listUsers();
            if (checkError) {
              console.error('ユーザー存在確認エラー:', checkError);
              return new Response(JSON.stringify({
                success: false,
                error: `ユーザー確認エラー: ${checkError.message}`
              }), {
                status: 400,
                headers: {
                  ...corsHeaders,
                  'Content-Type': 'application/json'
                }
              });
            }
            // ユーザーが既に存在する場合
            const userExists = existingUsers.users.some((user)=>user.email === email);
            if (userExists) {
              return new Response(JSON.stringify({
                success: false,
                error: 'このメールアドレスは既に使用されています'
              }), {
                status: 400,
                headers: {
                  ...corsHeaders,
                  'Content-Type': 'application/json'
                }
              });
            }
            // Admin APIを使用してユーザーを作成
            const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
              email,
              password,
              email_confirm: true,
              user_metadata: userData || {}
            });
            if (error) {
              console.error('ユーザー作成エラー:', error);
              return new Response(JSON.stringify({
                success: false,
                error: `ユーザー作成エラー: ${error.message}`
              }), {
                status: 400,
                headers: {
                  ...corsHeaders,
                  'Content-Type': 'application/json'
                }
              });
            }
            // メール送信処理
            let emailResult = {
              success: false,
              error: null
            };
            if (emailSettings) {
              try {
                const result = await sendEmail({
                  from: emailSettings.from || 'スカウトツール <noreply@example.com>',
                  to: email,
                  subject: emailSettings.subject || 'アカウント作成のお知らせ',
                  html: emailSettings.html || '<p>アカウントが作成されました。</p>',
                  text: emailSettings.text
                });
                emailResult = {
                  success: true,
                  data: result
                };
                console.log(`確認メールを送信しました: ${email}`);
              } catch (emailError) {
                console.error('メール送信エラー:', emailError);
                emailResult = {
                  success: false,
                  error: emailError instanceof Error ? emailError.message : 'メール送信に失敗しました'
                };
              }
            }
            return new Response(JSON.stringify({
              success: true,
              data: user,
              emailResult
            }), {
              status: 200,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            });
          } catch (userError) {
            console.error('ユーザー作成処理エラー:', userError);
            return new Response(JSON.stringify({
              success: false,
              error: `ユーザー作成処理エラー: ${userError instanceof Error ? userError.message : 'Unknown error'}`
            }), {
              status: 500,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            });
          }
        }
      case 'checkUserExists':
        {
          const { email } = data;
          if (!email) {
            return new Response(JSON.stringify({
              success: false,
              error: 'メールアドレスは必須です',
              exists: false
            }), {
              status: 400,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            });
          }
          try {
            // ユーザーの存在確認
            const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
            if (error) {
              console.error('ユーザー一覧取得エラー:', error);
              return new Response(JSON.stringify({
                success: false,
                error: `ユーザー一覧取得エラー: ${error.message}`,
                exists: false
              }), {
                status: 500,
                headers: {
                  ...corsHeaders,
                  'Content-Type': 'application/json'
                }
              });
            }
            // メールアドレスが一致するユーザーを検索
            const userExists = users.users.some((user)=>user.email === email);
            return new Response(JSON.stringify({
              success: true,
              exists: userExists
            }), {
              status: 200,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            });
          } catch (error) {
            console.error('ユーザー存在確認エラー:', error);
            return new Response(JSON.stringify({
              success: false,
              error: `ユーザー存在確認エラー: ${error instanceof Error ? error.message : 'Unknown error'}`,
              exists: false
            }), {
              status: 500,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            });
          }
        }
      case 'resetPassword':
        {
          const { email, redirectTo } = data;
          if (!email) {
            return new Response(JSON.stringify({
              success: false,
              error: 'メールアドレスは必須です'
            }), {
              status: 400,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            });
          }
          try {
            // パスワードリセットメールを送信
            const { data, error } = await supabaseAdmin.auth.admin.generateLink({
              type: 'recovery',
              email,
              options: {
                redirectTo
              }
            });
            if (error) {
              console.error('パスワードリセットリンク生成エラー:', error);
              return new Response(JSON.stringify({
                success: false,
                error: `パスワードリセットリンク生成エラー: ${error.message}`
              }), {
                status: 400,
                headers: {
                  ...corsHeaders,
                  'Content-Type': 'application/json'
                }
              });
            }
            return new Response(JSON.stringify({
              success: true,
              data
            }), {
              status: 200,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            });
          } catch (error) {
            console.error('パスワードリセットエラー:', error);
            return new Response(JSON.stringify({
              success: false,
              error: `パスワードリセットエラー: ${error instanceof Error ? error.message : 'Unknown error'}`
            }), {
              status: 500,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            });
          }
        }
      case 'deleteUser':
        {
          const { userId } = data;
          if (!userId) {
            return new Response(JSON.stringify({
              success: false,
              error: 'ユーザーIDは必須です'
            }), {
              status: 400,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            });
          }
          try {
            // ユーザーの削除
            const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
            if (error) {
              console.error('ユーザー削除エラー:', error);
              return new Response(JSON.stringify({
                success: false,
                error: `ユーザー削除エラー: ${error.message}`
              }), {
                status: 400,
                headers: {
                  ...corsHeaders,
                  'Content-Type': 'application/json'
                }
              });
            }
            return new Response(JSON.stringify({
              success: true
            }), {
              status: 200,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            });
          } catch (error) {
            console.error('ユーザー削除エラー:', error);
            return new Response(JSON.stringify({
              success: false,
              error: `ユーザー削除エラー: ${error instanceof Error ? error.message : 'Unknown error'}`
            }), {
              status: 500,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            });
          }
        }
      case 'updateUser':
        {
          const { userId, userData } = data;
          if (!userId || !userData) {
            return new Response(JSON.stringify({
              success: false,
              error: 'ユーザーIDとユーザーデータは必須です'
            }), {
              status: 400,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            });
          }
          try {
            // ユーザーの更新
            const { data: user, error } = await supabaseAdmin.auth.admin.updateUserById(userId, userData);
            if (error) {
              console.error('ユーザー更新エラー:', error);
              return new Response(JSON.stringify({
                success: false,
                error: `ユーザー更新エラー: ${error.message}`
              }), {
                status: 400,
                headers: {
                  ...corsHeaders,
                  'Content-Type': 'application/json'
                }
              });
            }
            return new Response(JSON.stringify({
              success: true,
              data: user
            }), {
              status: 200,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            });
          } catch (error) {
            console.error('ユーザー更新エラー:', error);
            return new Response(JSON.stringify({
              success: false,
              error: `ユーザー更新エラー: ${error instanceof Error ? error.message : 'Unknown error'}`
            }), {
              status: 500,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
              }
            });
          }
        }
      default:
        return new Response(JSON.stringify({
          success: false,
          error: '不明なアクションです'
        }), {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
    }
  } catch (error) {
    console.error('Edge Function エラー:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
