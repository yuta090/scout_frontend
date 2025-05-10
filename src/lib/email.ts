import { Resend } from 'resend';

// Resendインスタンスを作成
const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

// メール送信関数
export const sendEmail = async ({
  to,
  subject,
  html,
  from = 'スカウトツール <support@hraim.com>',
}: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}) => {
  if (!resend) {
    console.warn(
      'Resend API Keyが設定されていないため、メールは送信されません'
    );
    return { success: false, error: 'API key not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    if (error) {
      console.error('メール送信エラー:', error);
      return { success: false, error };
    }

    console.log('メール送信に成功しました:', data);
    return { success: true, data };
  } catch (error) {
    console.error('メール送信例外:', error);
    return { success: false, error };
  }
};

// Supabase Edge Functionsを使用してメールを送信する関数
export const sendEmailViaSupabase = async ({
  to,
  subject,
  html,
  text,
  from = 'スカウトツール <support@hraim.com>',
}: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}) => {
  try {
    console.log('Supabase Edge Functionsを使用してメール送信を開始します');

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase設定が見つかりません');
      return { success: false, error: 'Supabase configuration is missing' };
    }

    console.log(`Supabase URL: ${supabaseUrl}`);
    console.log(`送信先: ${Array.isArray(to) ? to.join(', ') : to}`);
    console.log(`件名: ${subject}`);

    const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabaseAnonKey}`,
        apikey: supabaseAnonKey,
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html,
        text,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Supabase Edge Function エラー:', errorText);
      return { success: false, error: errorText };
    }

    const result = await response.json();
    console.log('Supabase Edge Function 応答:', result);

    return result;
  } catch (error) {
    console.error('メール送信例外:', error);
    return { success: false, error };
  }
};

// サブアカウント作成通知メールテンプレート
export const getSubAccountCreationEmailTemplate = ({
  companyName,
  email,
  role,
  baseUrl,
  actionLink,
}: {
  companyName: string;
  email: string;
  role: string;
  baseUrl: string;
  actionLink?: string;
}) => {
  const roleDisplay =
    {
      admin: '管理者',
      staff: 'スタッフ',
      accounting: '経理',
      readonly: '閲覧のみ',
    }[role] || role;

  // actionLinkが提供されていない場合のデフォルトリンク
  const defaultActionLink = `${baseUrl}/reset-password`;

  const template = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #4f46e5; margin-bottom: 20px;">スカウトツール サブアカウント作成のお知らせ</h2>
      
      <p style="margin-bottom: 16px;">${companyName} 様</p>
      
      <p style="margin-bottom: 16px;">いつもスカウトツールをご利用いただき、誠にありがとうございます。</p>
      
      <p style="margin-bottom: 16px;">この度、貴社に新しいサブアカウントが作成されましたことをお知らせいたします。</p>
      
      <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
        <p style="margin: 0 0 8px 0;"><strong>メールアドレス:</strong> ${email}</p>
        <p style="margin: 0;"><strong>権限:</strong> ${roleDisplay}</p>
      </div>
      
      <p style="margin-bottom: 16px;">このアカウントでログインするには、以下のボタンからパスワードを設定してください。</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${
          actionLink || defaultActionLink
        }" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">パスワードを設定する</a>
      </div>
      
      <p style="margin-bottom: 16px;">今後ともスカウトツールをよろしくお願いいたします。</p>
      
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      
      <p style="color: #64748b; font-size: 12px;">このメールは自動送信されています。返信はできませんのでご了承ください。</p>
    </div>
  `;

  return template;
};

// サブアカウント作成通知メールのテキスト版
export const getSubAccountCreationEmailText = ({
  companyName,
  email,
  role,
  baseUrl,
  actionLink,
}: {
  companyName: string;
  email: string;
  role: string;
  baseUrl: string;
  actionLink?: string;
}) => {
  const roleDisplay =
    {
      admin: '管理者',
      staff: 'スタッフ',
      accounting: '経理',
      readonly: '閲覧のみ',
    }[role] || role;

  // actionLinkが提供されていない場合のデフォルトリンク
  const defaultActionLink = `${baseUrl}/reset-password`;

  const template = `
スカウトツール サブアカウント作成のお知らせ

${companyName} 様

いつもスカウトツールをご利用いただき、誠にありがとうございます。

この度、貴社に新しいサブアカウントが作成されましたことをお知らせいたします。

メールアドレス: ${email}
権限: ${roleDisplay}

このアカウントでログインするには、以下のURLからパスワードを設定してください。
${actionLink || defaultActionLink}

今後ともスカウトツールをよろしくお願いいたします。

※このメールは自動送信されています。返信はできませんのでご了承ください。
  `;

  return template;
};