-- 管理者がすべてのプロフィールにアクセスできるようにするポリシー

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow admin to read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin update all profiles" ON profiles;

-- 管理者がすべてのプロフィールを読み取れるようにするポリシー
CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- 管理者がすべてのプロフィールを更新できるようにするポリシー
CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    auth.uid() = id OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- プロファイルテーブルのデバッグ用ビューを作成
CREATE OR REPLACE VIEW profile_counts AS
SELECT
  role,
  COUNT(*) as count
FROM
  profiles
GROUP BY
  role;

-- 管理者ユーザーが存在しない場合は作成
DO $$
DECLARE
  admin_count integer;
BEGIN
  SELECT COUNT(*) INTO admin_count FROM profiles WHERE role = 'admin';
  
  IF admin_count = 0 THEN
    -- 管理者ユーザーが存在しない場合は作成
    INSERT INTO auth.users (id, email, raw_user_meta_data, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      'admin@example.com',
      '{"role": "admin", "company_name": "HRaim管理者"}',
      now(),
      now()
    )
    ON CONFLICT DO NOTHING;
  END IF;
END
$$;