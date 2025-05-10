/*
  # 管理者ポリシーの修正 - 無限再帰の解決

  1. 変更点
    - 無限再帰を引き起こすすべてのポリシーを削除
    - 新しい方法で管理者ポリシーを実装
    - auth.uid() を直接使用するシンプルなポリシー設計

  2. セキュリティ
    - 管理者は全プロファイルにアクセス可能
    - 一般ユーザーは自分のプロファイルのみアクセス可能
*/

-- 無限再帰を引き起こすすべてのポリシーを削除
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow admin to read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admin read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin update all profiles" ON profiles;
DROP POLICY IF EXISTS "System can create profiles" ON profiles;

-- 基本的なユーザーポリシー - 自分のプロファイルの読み取り
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 基本的なユーザーポリシー - 自分のプロファイルの更新
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- プロファイル作成ポリシー
CREATE POLICY "System can create profiles"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 管理者ポリシー - すべてのプロファイルの読み取り
-- 単純な条件で実装
CREATE POLICY "Admin read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- 管理者ポリシー - すべてのプロファイルの更新
-- 単純な条件で実装
CREATE POLICY "Admin update all profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- 必要な権限を付与
GRANT SELECT, UPDATE, INSERT ON profiles TO authenticated;