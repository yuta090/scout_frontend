import { supabase } from './client';

/**
 * ユーザーのアクティビティをログに記録する
 * @param userId - アクティビティを実行したユーザーのID
 * @param action - 実行されたアクション（例: 'agency_created', 'agency_updated'）
 * @param details - アクションの詳細情報（JSONBとして保存）
 */
export const logActivity = async (
  userId: string,
  action: string,
  details: Record<string, any>
) => {
  try {
    // ユーザーのロールを取得
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, company_name')
      .eq('id', userId)
      .maybeSingle(); // プロファイルが見つからない場合に対応
    
    // プロファイル情報をdetailsに追加（フォールバック値付き）
    details.role = profile?.role || details.role || 'unknown';
    details.company_name = profile?.company_name || details.company_name || 'Unknown Company';
    console.log('アクティビティにロールを追加:', details.role);

    // アクティビティを挿入
    const { data, error } = await supabase
      .from('activities')
      .insert([{
        user_id: userId,
        action,
        details
      }])
      .select();

    if (error) throw error;
    
    console.log('アクティビティを挿入:', data);
    return data;
  } catch (err) {
    console.error('アクティビティログ記録エラー:', err);
    throw err;
  }
};