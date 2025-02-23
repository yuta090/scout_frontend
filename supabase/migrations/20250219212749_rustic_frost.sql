/*
  # プロジェクトとアクティビティテーブルの作成

  1. 新規テーブル
    - `projects`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `status` (text)
      - `client_id` (uuid, foreign key)
      - `agency_id` (uuid, foreign key)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `activities`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `action` (text)
      - `details` (jsonb)
      - `created_at` (timestamptz)

  2. セキュリティ
    - 両テーブルでRLSを有効化
    - プロジェクトの読み取り・更新ポリシー
    - アクティビティの読み取り・作成ポリシー
*/

-- プロジェクトテーブルの作成
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text NOT NULL CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  agency_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- プロジェクトテーブルのRLS設定
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- プロジェクトの読み取りポリシー（関係者のみ）
CREATE POLICY "Users can read own projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = client_id OR
    auth.uid() = agency_id
  );

-- プロジェクトの更新ポリシー（関係者のみ）
CREATE POLICY "Users can update own projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = client_id OR
    auth.uid() = agency_id
  )
  WITH CHECK (
    auth.uid() = client_id OR
    auth.uid() = agency_id
  );

-- アクティビティテーブルの作成
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  action text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- アクティビティテーブルのRLS設定
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- アクティビティの読み取りポリシー（自分のアクティビティのみ）
CREATE POLICY "Users can read own activities"
  ON activities
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- アクティビティの作成ポリシー（認証済みユーザーのみ）
CREATE POLICY "Users can create activities"
  ON activities
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- プロジェクトの更新時にupdated_atを更新する関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- プロジェクトの更新時にupdated_atを自動更新するトリガー
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();